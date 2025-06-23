#By: summer_ai 
#License: MIT

#ive made this monstrosity mainly to understand slimeVR server and how it handels trackers. 

from __future__ import annotations

import asyncio
import struct
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, Tuple

SERVER_PORT: int = 6969
HANDSHAKE_RESPONSE: bytes = bytes([3]) + b"Hey OVR =D 5"

#all regular packets start with the 3 padding NULs followed by one byte for the packet type.
HEADER_MAGIC: bytes = b"\x00\x00\x00"
PACKET_HANDSHAKE: int = 3 #placed after the magic
PACKET_BATTERY: int = 12
PACKET_ROTATION: int = 17

#after the 4‑byte header comes an 8‑byte packet counter we do not care about.
HEADER_SIZE: int = 4 + 8 #bytes

#when a tracker is silent for longer we declare it disconnected.
DISCONNECT_SECONDS: int = 5
@dataclass
class Tracker:
    mac: str 
    addr: Tuple[str, int] #(ip, port) of last packet
    last_seen: float = field(default_factory=time.time)
    battery: float | None = None
    quat: Tuple[float, float, float, float] | None = None  #(x, y, z, w)

    def update_seen(self) -> None:
        self.last_seen = time.time()

    def pretty_quat(self) -> str:
        if self.quat is None:
            return "–"
        x, y, z, w = self.quat

        return f"( {x:+.2f}, {y:+.2f}, {z:+.2f}, {w:+.2f} )"

    def pretty_batt(self) -> str:
        return f"{self.battery:.1f} %" if self.battery is not None else "–"

#UDP server imp

class SlimeVRProtocol(asyncio.DatagramProtocol):

    def __init__(self) -> None:
        super().__init__()
        self.transport: asyncio.DatagramTransport | None = None
        self.trackers: Dict[str, Tracker] = {}
        #because we also index by address (in case a tracker reboots with the same mac but different source port).
        self.addr_to_mac: Dict[Tuple[str, int], str] = {}
    def connection_made(self, transport: asyncio.DatagramTransport) -> None:
        self.transport = transport
        print(f"UDP socket ready on 0.0.0.0:{SERVER_PORT}")

        #start a background checker that evicts dead trackers.
        asyncio.get_event_loop().create_task(self._garbage_collector())

    def datagram_received(self, data: bytes, addr: Tuple[str, int]) -> None:
        #1 is this a tracker handshake?
        if data.startswith(HEADER_MAGIC) and data[3] == PACKET_HANDSHAKE:
            self._handle_tracker_handshake(data, addr)
            return
        #2 is this a regular 13‑byte server handshake from a previous session?
        #ignore nothing we want to do with it.
        if data[:1] == bytes([PACKET_HANDSHAKE]):
            return  #our own echo, or a confused tracker?
        #3 otherwise it must be a normal data packet extract the type.
        if not data.startswith(HEADER_MAGIC):
            #unknown garbage
            return
        if len(data) < HEADER_SIZE + 1:
            return  #too short
        pkt_type: int = data[3]
        #you can add here the kinds of packets you do want! slimeVR FW has tons but i've only implmented these two
        if pkt_type == PACKET_BATTERY:
            self._handle_battery_packet(data, addr)
        elif pkt_type == PACKET_ROTATION:
            self._handle_rotation_packet(data, addr)
        else:
            pass

    #packet handlers
    def _handle_tracker_handshake(self, data: bytes, addr: Tuple[str, int]) -> None:
        if len(data) < HEADER_SIZE + 1 + 6:
            return  #bogus handshake
        offset: int = HEADER_SIZE + 24  #jump to len byte of firmware string
        if offset >= len(data):
            return
        fw_len: int = data[offset]
        offset += 1 + fw_len  #skip firmware string
        if offset + 6 > len(data):
            return
        mac_bytes: bytes = data[offset : offset + 6]
        mac_str: str = ":".join(f"{b:02x}" for b in mac_bytes)

        #create / update tracker object.
        tracker = self.trackers.get(mac_str)
        if tracker is None:
            tracker = Tracker(mac=mac_str, addr=addr)
            self.trackers[mac_str] = tracker
            print(f"Tracker {mac_str} connected!")
        else:
            #might be a re‑handshake, Update addr & mark alive.
            tracker.addr = addr
        tracker.update_seen()
        self.addr_to_mac[addr] = mac_str

        #respond with the tiny 13‑byte handshake.
        self._send(HANDSHAKE_RESPONSE, addr)

    def _handle_battery_packet(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._tracker_for_addr(addr)
        if tracker is None:
            return
        #battery packet payload
        if len(data) < HEADER_SIZE + 8:
            return
        _, pct = struct.unpack_from(">ff", data, HEADER_SIZE)
        tracker.battery = pct * 100.0 if pct <= 1.0 else pct  #some firmwares do this for some reason lol
        tracker.update_seen()
        self._log_tracker(tracker)

    def _handle_rotation_packet(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._tracker_for_addr(addr)
        if tracker is None:
            return
        if len(data) < HEADER_SIZE + 2 + 16 + 1:
            return  # sensorId + dataType + 4 floats + accuracy
        offset = HEADER_SIZE
        #sensorId, dataType
        offset += 2
        x, y, z, w = struct.unpack_from(">ffff", data, offset)
        tracker.quat = (x, y, z, w)
        tracker.update_seen()
        self._log_tracker(tracker)

    def _tracker_for_addr(self, addr: Tuple[str, int]) -> Tracker | None:
        mac = self.addr_to_mac.get(addr)
        if mac is None:
            return None
        return self.trackers.get(mac)

    def _send(self, payload: bytes, addr: Tuple[str, int]) -> None:
        if self.transport:
            self.transport.sendto(payload, addr)

    def _log_tracker(self, tracker: Tracker) -> None:
        print(
            f"{tracker.mac} | batt {tracker.pretty_batt()} | q={tracker.pretty_quat()}"
        )

    async def _garbage_collector(self) -> None:
        #remove trackers that have been silent for too long.
        while True:
            await asyncio.sleep(1)
            now = time.time()
            dead: list[str] = []
            for mac, trk in self.trackers.items():
                if now - trk.last_seen > DISCONNECT_SECONDS:
                    dead.append(mac)
            for mac in dead:
                del self.trackers[mac]
                #also purge address mapping.
                addr = next((a for a, m in self.addr_to_mac.items() if m == mac), None)
                if addr:
                    del self.addr_to_mac[addr]
                print(f"Tracker {mac} disconnected (timeout)")


def main() -> None:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    listen = loop.create_datagram_endpoint(
        SlimeVRProtocol, local_addr=("0.0.0.0", SERVER_PORT)
    )
    transport, _ = loop.run_until_complete(listen)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        transport.close()
        loop.close()
        print("exiting")


if __name__ == "__main__":
    main()
