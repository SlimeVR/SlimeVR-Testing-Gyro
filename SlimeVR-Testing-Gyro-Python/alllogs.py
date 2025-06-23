from __future__ import annotations

import asyncio
import csv
import random
import struct
import threading
import time
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Tuple, List

import can


BUS_CH = "can0"
NODE_IDS = [1, 2, 3]
ACCEL_FACTOR = 4.0
ERR_TOL_DEG = 0.05
MAX_SETTLE_S = 0.5
SPEED_MIN_DEG = 1000.0
SPEED_MAX_DEG = 10000.0

CMD_CLR_ERR = 0x18
CMD_SET_AXIS_STATE = 0x07
CMD_HEARTBEAT = 0x01
CMD_SET_CTRL_MODE = 0x0B
CMD_TRAJ_VEL_LIM = 0x11
CMD_TRAJ_ACCEL_LIM = 0x12
CMD_SET_INPUT_POS = 0x0C
CMD_ENCODER_EST = 0x09

AXIS_IDLE = 1
AXIS_CLOSED_LOOP = 8
CTRL_MODE_POS = 3
INPUT_MODE_TRAP = 5

SERVER_PORT = 6969
HANDSHAKE_RESPONSE = bytes([3]) + b"Hey OVR =D 5"
HEADER_MAGIC = b"\x00\x00\x00"
PACKET_HANDSHAKE = 3
PACKET_BATTERY = 12
PACKET_ROTATION = 17
HEADER_SIZE = 12
DISCONNECT_SECONDS = 5


def cid(nid: int, cmd: int) -> int:
    return (nid << 5) | cmd


def err_short(goal: float, cur: float) -> float:
    return ((goal - cur + 540) % 360) - 180


shared_lock = threading.Lock()
shared_state = {
    "goal_deg": [0.0, 0.0, 0.0],
    "enc_deg": [0.0, 0.0, 0.0],
    "err_deg": [0.0, 0.0, 0.0],
}


class GimbalThread(threading.Thread):
    def __init__(self) -> None:
        super().__init__(daemon=True)
        self._stop_evt = threading.Event()

    def _flush(self, bus: can.Bus) -> None:
        while bus.recv(timeout=0):
            pass

    def _send(self, bus: can.Bus, nid: int, cmd: int, data: bytes = b"\x00") -> None:
        bus.send(
            can.Message(
                arbitration_id=cid(nid, cmd), data=data, is_extended_id=False
            )
        )

    def _set_axis_state(self, bus: can.Bus, nid: int, state: int) -> None:
        self._send(bus, nid, CMD_SET_AXIS_STATE, struct.pack("<I", state))

    def _set_controller_mode(self, bus: can.Bus, nid: int) -> None:
        self._send(
            bus,
            nid,
            CMD_SET_CTRL_MODE,
            struct.pack("<II", CTRL_MODE_POS, INPUT_MODE_TRAP),
        )

    def _set_traj_limits(
        self, bus: can.Bus, nid: int, vel_rps: float, acc_rps2: float
    ) -> None:
        self._send(bus, nid, CMD_TRAJ_VEL_LIM, struct.pack("<f", vel_rps))
        self._send(
            bus, nid, CMD_TRAJ_ACCEL_LIM, struct.pack("<ff", acc_rps2, acc_rps2)
        )

    def _set_input_pos(self, bus: can.Bus, nid: int, turns: float) -> None:
        self._send(bus, nid, CMD_SET_INPUT_POS, struct.pack("<fhh", turns, 0, 0))

    def _wait_cl(self, bus: can.Bus) -> None:
        pending = set(NODE_IDS)
        deadline = time.time() + 2
        while pending:
            msg = bus.recv(timeout=0.1)
            if not msg:
                if time.time() > deadline:
                    raise RuntimeError
                continue
            if msg.arbitration_id & 0x1F != CMD_HEARTBEAT:
                continue
            nid = msg.arbitration_id >> 5
            state = struct.unpack("<IBBB", msg.data[:7])[1]
            if nid in pending and state == AXIS_CLOSED_LOOP:
                pending.remove(nid)

    def _read_turns(self, bus: can.Bus, nid: int, timeout: float = 0.1) -> float:
        deadline = time.time() + timeout
        while time.time() < deadline:
            msg = bus.recv(timeout=deadline - time.time())
            if (
                msg
                and msg.arbitration_id >> 5 == nid
                and msg.arbitration_id & 0x1F == CMD_ENCODER_EST
            ):
                return struct.unpack("<ff", msg.data)[0]
        raise RuntimeError

    def _nearest_turns(self, cur_turns: float, target_deg: float) -> float:
        cur_deg = (cur_turns * 360.0) % 360.0
        delta_deg = ((target_deg - cur_deg + 540) % 360) - 180
        return cur_turns + delta_deg / 360.0

    def stop(self) -> None:
        self._stop_evt.set()

    def run(self) -> None:
        with can.interface.Bus(channel=BUS_CH, interface="socketcan") as bus:
            self._flush(bus)
            for nid in NODE_IDS:
                self._send(bus, nid, CMD_CLR_ERR)
                self._set_controller_mode(bus, nid)
                self._set_axis_state(bus, nid, AXIS_CLOSED_LOOP)
            self._wait_cl(bus)
            try:
                while not self._stop_evt.is_set():
                    goal_deg = [random.uniform(0, 360) for _ in NODE_IDS]
                    spd_deg = random.uniform(SPEED_MIN_DEG, SPEED_MAX_DEG)
                    vel_rps = spd_deg / 360.0
                    acc_rps2 = vel_rps * ACCEL_FACTOR
                    cur_turns = {nid: self._read_turns(bus, nid) for nid in NODE_IDS}
                    for nid, tgt in zip(NODE_IDS, goal_deg):
                        tgt_turns = self._nearest_turns(cur_turns[nid], tgt)
                        self._set_traj_limits(bus, nid, vel_rps, acc_rps2)
                        self._set_input_pos(bus, nid, tgt_turns)
                    with shared_lock:
                        shared_state["goal_deg"] = goal_deg
                    done = set()
                    while done != set(NODE_IDS):
                        msg = bus.recv(timeout=0.05)
                        if (
                            msg
                            and msg.arbitration_id & 0x1F == CMD_HEARTBEAT
                            and struct.unpack("<IBBB", msg.data[:7])[3]
                        ):
                            done.add(msg.arbitration_id >> 5)
                    limit = time.time() + MAX_SETTLE_S
                    while True:
                        enc = []
                        err = []
                        for nid, tgt in zip(NODE_IDS, goal_deg):
                            tr = self._read_turns(bus, nid)
                            deg = (tr * 360.0) % 360.0
                            enc.append(deg)
                            err.append(err_short(tgt, deg))
                        with shared_lock:
                            shared_state["enc_deg"] = enc
                            shared_state["err_deg"] = err
                        if all(abs(e) <= ERR_TOL_DEG for e in err) or time.time() > limit:
                            break
                        time.sleep(0.05)
            finally:
                for nid in NODE_IDS:
                    self._set_axis_state(bus, nid, AXIS_IDLE)


class CSVLogger:
    def __init__(self, path: Path):
        self._f = path.open("w", newline="")
        self._w = csv.writer(self._f)
        self._w.writerow(
            [
                "ts",
                "mac",
                "battery_pct",
                "battery_volt",
                "qx",
                "qy",
                "qz",
                "qw",
                "enc_X",
                "enc_Y",
                "enc_Z",
                "err_X",
                "err_Y",
                "err_Z",
                "cmd_X",
                "cmd_Y",
                "cmd_Z",
            ]
        )
        self._lock = threading.Lock()

    def log(
        self,
        mac: str,
        battery_pct: float | None,
        battery_volt: float | None,
        quat: Tuple[float, float, float, float] | None,
    ) -> None:
        with shared_lock:
            enc = shared_state["enc_deg"][:]
            err = shared_state["err_deg"][:]
            cmd = shared_state["goal_deg"][:]
        row: List[str] = [
            f"{time.time():.6f}",
            mac,
            f"{battery_pct:.2f}" if battery_pct is not None else "",
            f"{battery_volt:.3f}" if battery_volt is not None else "",
        ]
        if quat:
            row.extend(f"{q:.6f}" for q in quat)
        else:
            row.extend(["", "", "", ""])
        row.extend(f"{v:.3f}" for v in enc + err + cmd)
        with self._lock:
            self._w.writerow(row)
            self._f.flush()


logger = CSVLogger(Path("tracker_gimbal_log.csv"))


@dataclass
class Tracker:
    mac: str
    addr: Tuple[str, int]
    last_seen: float = field(default_factory=time.time)
    battery: float | None = None
    battery_volt: float | None = None
    quat: Tuple[float, float, float, float] | None = None

    def seen(self) -> None:
        self.last_seen = time.time()


class SlimeVRProtocol(asyncio.DatagramProtocol):
    def __init__(self, stop_cb) -> None:
        self.transport: asyncio.DatagramTransport | None = None
        self.trackers: Dict[str, Tracker] = {}
        self.addr_to_mac: Dict[Tuple[str, int], str] = {}
        self._stop_cb = stop_cb

    def connection_made(self, transport) -> None:
        self.transport = transport
        asyncio.get_event_loop().create_task(self._gc())

    def datagram_received(self, data: bytes, addr: Tuple[str, int]) -> None:
        if data.startswith(HEADER_MAGIC) and data[3] == PACKET_HANDSHAKE:
            self._handshake(data, addr)
            return
        if data[:1] == bytes([PACKET_HANDSHAKE]):
            return
        if not data.startswith(HEADER_MAGIC) or len(data) < HEADER_SIZE + 1:
            return
        pkt_type = data[3]
        if pkt_type == PACKET_BATTERY:
            self._battery(data, addr)
        elif pkt_type == PACKET_ROTATION:
            self._rotation(data, addr)

    def _handshake(self, data: bytes, addr: Tuple[str, int]) -> None:
        off = HEADER_SIZE + 24
        fw_len = data[off]
        off += 1 + fw_len
        mac_bytes = data[off : off + 6]
        mac = ":".join(f"{b:02x}" for b in mac_bytes)
        tracker = self.trackers.get(mac) or Tracker(mac=mac, addr=addr)
        tracker.addr = addr
        tracker.seen()
        self.trackers[mac] = tracker
        self.addr_to_mac[addr] = mac
        self._send(HANDSHAKE_RESPONSE, addr)
        print(f"Handshake {tracker.mac} from {addr[0]}:{addr[1]}")

    def _battery(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker or len(data) < HEADER_SIZE + 8:
            return
        vol, pct = struct.unpack_from(">ff", data, HEADER_SIZE)
        pct = pct * 100.0 if pct <= 1.0 else pct
        tracker.battery = pct
        tracker.battery_volt = vol
        tracker.seen()
        print(f"Battery {tracker.mac} {pct:.2f}% {vol:.3f}V")
        logger.log(tracker.mac, tracker.battery, tracker.battery_volt, tracker.quat)

    def _rotation(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker or len(data) < HEADER_SIZE + 2 + 16 + 1:
            return
        offset = HEADER_SIZE + 2
        tracker.quat = struct.unpack_from(">ffff", data, offset)
        tracker.seen()
        qx, qy, qz, qw = tracker.quat
        bv = tracker.battery_volt
        bp = tracker.battery
        if bp is not None and bv is not None:
            print(f"Rotation {tracker.mac} {qx:.6f} {qy:.6f} {qz:.6f} {qw:.6f} {bp:.2f}% {bv:.3f}V")
        else:
            print(f"Rotation {tracker.mac} {qx:.6f} {qy:.6f} {qz:.6f} {qw:.6f}")
        logger.log(tracker.mac, tracker.battery, tracker.battery_volt, tracker.quat)

    def _get(self, addr: Tuple[str, int]) -> Tracker | None:
        mac = self.addr_to_mac.get(addr)
        return self.trackers.get(mac) if mac else None

    def _send(self, payload: bytes, addr: Tuple[str, int]) -> None:
        if self.transport:
            self.transport.sendto(payload, addr)

    async def _gc(self) -> None:
        while True:
            await asyncio.sleep(1)
            now = time.time()
            to_remove = [
                mac
                for mac, trk in self.trackers.items()
                if now - trk.last_seen > DISCONNECT_SECONDS
            ]
            for mac in to_remove:
                tracker = self.trackers.pop(mac)
                self.addr_to_mac.pop(tracker.addr, None)
                if tracker.battery is not None and tracker.battery == 0:
                    self._stop_cb()


def main() -> None:
    gimbal = GimbalThread()
    gimbal.start()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    transport, _ = loop.run_until_complete(
        loop.create_datagram_endpoint(
            lambda: SlimeVRProtocol(lambda: loop.call_soon_threadsafe(loop.stop)),
            local_addr=("0.0.0.0", SERVER_PORT),
        )
    )
    try:
        loop.run_forever()
    finally:
        transport.close()
        gimbal.stop()
        gimbal.join()
        loop.stop()
        loop.close()
        os._exit(0)


if __name__ == "__main__":
    main()
