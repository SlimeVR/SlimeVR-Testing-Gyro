from __future__ import annotations

import asyncio
import can
import csv
import logging
import math
import os
import struct
import sys
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple, List, Optional, Deque

def setup_error_logging():
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)

    log_filename = log_dir / f"error_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setLevel(logging.ERROR)

    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(funcName)s\n'
        'Message: %(message)s\n'
        '---'
    )
    file_handler.setFormatter(detailed_formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.ERROR)
    root_logger.addHandler(file_handler)

    latest_log = log_dir / "latest_error.log"
    latest_handler = logging.FileHandler(latest_log, mode='w', encoding='utf-8')
    latest_handler.setLevel(logging.ERROR)
    latest_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(latest_handler)

    return log_filename

error_logger = logging.getLogger(__name__)

def log_exception(exc_type, exc_value, exc_tb):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_tb)
        return

    error_logger.error(
        "Uncaught exception",
        exc_info=(exc_type, exc_value, exc_tb)
    )
    sys.__excepthook__(exc_type, exc_value, exc_tb)

def log_thread_exception(args):
    error_logger.error(
        f"Uncaught exception in thread {args.thread.name}",
        exc_info=(args.exc_type, args.exc_value, args.exc_traceback)
    )

try:
    import dearpygui.dearpygui as dpg
    DPG_AVAILABLE = True
except ImportError:
    DPG_AVAILABLE = False
    print("[WARN] DearPyGui not installed. Run: pip install dearpygui")

try:
    from bvh import Bvh
    BVH_AVAILABLE = True
except ImportError:
    BVH_AVAILABLE = False
    print("[WARN] bvh library not installed. Run: pip install bvh")

try:
    import hid
    HID_AVAILABLE = True
except ImportError:
    HID_AVAILABLE = False
    print("[WARN] hid library not installed. Run: pip install hidapi")


# CAN Bus Configuration
BUS_CH = 0
NODE_IDS = [1, 2, 3]

# Gimbal Parameters
ACCEL_FACTOR = 2.0
SPEED_MIN_DEG = 10.0
SPEED_MAX_DEG = 10.0

# CAN Commands
CMD_CLR_ERR = 0x18
CMD_SET_AXIS_STATE = 0x07
CMD_HEARTBEAT = 0x01
CMD_SET_CTRL_MODE = 0x0B
CMD_TRAJ_VEL_LIM = 0x11
CMD_TRAJ_ACCEL_LIM = 0x12
CMD_SET_INPUT_POS = 0x0C
CMD_ENCODER_EST = 0x09

# Axis States
AXIS_IDLE = 1
AXIS_CLOSED_LOOP = 8
CTRL_MODE_POS = 3
INPUT_MODE_TRAP = 5

# SlimeVR Protocol
SERVER_PORT = 6969
HANDSHAKE_RESPONSE = bytes([3]) + b"Hey OVR =D 5"
HEADER_MAGIC = b"\x00\x00\x00"
PACKET_HANDSHAKE = 3
PACKET_BATTERY = 12
PACKET_ROTATION = 17
PACKET_ROTATION_AND_ACCELERATION = 23
PACKET_ACCELERATION = 4
HEADER_SIZE = 12
DISCONNECT_SECONDS = 5

# HID Configuration
HID_VID = 0x1209
HID_PID = 0x7690
HID_REPORT_SIZE = 16

# BVH Configuration
BVH_PATH = os.environ.get("BVH_PATH", "BVH-Recording3.bvh")
BVH_JOINT = os.environ.get("BVH_JOINT", "CHEST")
BVH_TO_GIMBAL_Q = (1.0, 0.0, 0.0, 0.0)
AXIS_REMAP = (0, 1, 2)
AXIS_SIGN = (1.0, 1.0, 1.0)
LOOP_BVH = True
DO_STEP_TEST = False

# Timing
OUTPUT_HZ = 10.0
OUTPUT_PERIOD = 1.0 / OUTPUT_HZ
FRAME_DECIMATE = 10
ENCODER_POLL_EVERY = 1
POS_EPS_DEG = 0.25
VEL_EPS = 1e-3
ACC_EPS = 1e-3
TX_RETRIES = 10

VERBOSE = False

@dataclass
class VisualizerState:
    # Tracker data
    quat: Tuple[float, float, float, float] = (0.0, 0.0, 0.0, 1.0)  # x, y, z, w
    euler: Tuple[float, float, float] = (0.0, 0.0, 0.0)  # roll, pitch, yaw
    accel: Tuple[float, float, float] = (0.0, 0.0, 0.0)

    # Battery
    battery_pct: float = 100.0
    battery_volt: float = 4.2

    # Gimbal state
    goal_deg: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    enc_deg: Tuple[float, float, float] = (0.0, 0.0, 0.0)

    # Timing
    start_time: Optional[float] = None
    samples: int = 0

    # History buffers
    history_len: int = 3000
    time_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    battery_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    voltage_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    roll_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    pitch_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    yaw_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))
    err_history: Deque[float] = field(default_factory=lambda: deque(maxlen=3000))

# Global state
viz_state = VisualizerState()
_viz_lock = threading.Lock()

def update_viz_state(
    quat: Optional[Tuple[float, float, float, float]] = None,
    euler: Optional[Tuple[float, float, float]] = None,
    accel: Optional[Tuple[float, float, float]] = None,
    battery_pct: Optional[float] = None,
    battery_volt: Optional[float] = None,
    goal_deg: Optional[Tuple[float, float, float]] = None,
    enc_deg: Optional[Tuple[float, float, float]] = None,
):
    with _viz_lock:
        if viz_state.start_time is None:
            viz_state.start_time = time.time()

        elapsed = time.time() - viz_state.start_time

        # Update values
        if quat is not None:
            viz_state.quat = quat
        if euler is not None:
            viz_state.euler = euler
        if accel is not None:
            viz_state.accel = accel
        if battery_pct is not None:
            viz_state.battery_pct = battery_pct
        if battery_volt is not None:
            viz_state.battery_volt = battery_volt
        if goal_deg is not None:
            viz_state.goal_deg = goal_deg
        if enc_deg is not None:
            viz_state.enc_deg = enc_deg

        if euler is not None:
            viz_state.roll_history.append(euler[0])
            viz_state.pitch_history.append(euler[1])
            viz_state.yaw_history.append(euler[2])
            viz_state.time_history.append(elapsed)

            viz_state.battery_history.append(viz_state.battery_pct)
            viz_state.voltage_history.append(viz_state.battery_volt)

        if enc_deg is not None:
            err = sum((g - e) ** 2 for g, e in zip(viz_state.goal_deg, viz_state.enc_deg)) ** 0.5
            viz_state.err_history.append(err)

        viz_state.samples += 1

def get_viz_state() -> dict:
    """Thread-safe read of visualizer state."""
    with _viz_lock:
        return {
            'quat': viz_state.quat,
            'euler': viz_state.euler,
            'accel': viz_state.accel,
            'battery_pct': viz_state.battery_pct,
            'battery_volt': viz_state.battery_volt,
            'goal_deg': viz_state.goal_deg,
            'enc_deg': viz_state.enc_deg,
            'start_time': viz_state.start_time,
            'samples': viz_state.samples,
            'time_history': list(viz_state.time_history),
            'battery_history': list(viz_state.battery_history),
            'voltage_history': list(viz_state.voltage_history),
            'roll_history': list(viz_state.roll_history),
            'pitch_history': list(viz_state.pitch_history),
            'yaw_history': list(viz_state.yaw_history),
            'err_history': list(viz_state.err_history),
        }


def cid(nid: int, cmd: int) -> int:
    return (nid << 5) | cmd

def err_short(goal: float, cur: float) -> float:
    return ((goal - cur + 540) % 360) - 180

def validate_quaternion(qx: float, qy: float, qz: float, qw: float) -> bool:
    if any(not (-10.0 < v < 10.0) or v != v for v in [qx, qy, qz, qw]):
        return False
    magnitude = (qx*qx + qy*qy + qz*qz + qw*qw) ** 0.5
    return 0.1 < magnitude < 2.0

def _q_mul(a, b):
    aw, ax, ay, az = a
    bw, bx, by, bz = b
    return (
        aw*bw - ax*bx - ay*by - az*bz,
        aw*bx + ax*bw + ay*bz - az*by,
        aw*by - ax*bz + ay*bw + az*bx,
        aw*bz + ax*by - ay*bx + az*bw,
    )

def _q_normalize(q):
    w, x, y, z = q
    n = math.sqrt(w*w + x*x + y*y + z*z)
    if n == 0:
        return (1.0, 0.0, 0.0, 0.0)
    return (w/n, x/n, y/n, z/n)

def _q_to_euler_xyz_deg(q):
    w, x, y, z = q
    sinr_cosp = 2 * (w * x + y * z)
    cosr_cosp = 1 - 2 * (x * x + y * y)
    roll = math.degrees(math.atan2(sinr_cosp, cosr_cosp))
    sinp = 2 * (w * y - z * x)
    if abs(sinp) >= 1:
        pitch = math.degrees(math.copysign(math.pi / 2, sinp))
    else:
        pitch = math.degrees(math.asin(sinp))
    siny_cosp = 2 * (w * z + x * y)
    cosy_cosp = 1 - 2 * (y * y + z * z)
    yaw = math.degrees(math.atan2(siny_cosp, cosy_cosp))
    return (roll, pitch, yaw)

def _q_axis(axis: str, deg: float):
    r = math.radians(deg) * 0.5
    s, c = math.sin(r), math.cos(r)
    if axis == "X":
        return (c, s, 0.0, 0.0)
    if axis == "Y":
        return (c, 0.0, s, 0.0)
    return (c, 0.0, 0.0, s)


@dataclass
class Tracker:
    mac: str
    addr: Tuple[str, int] | None = None
    last_seen: float = field(default_factory=time.time)
    battery: float | None = None
    battery_volt: float | None = None
    quat: Tuple[float, float, float, float] | None = None
    accel: Tuple[float, float, float] | None = None
    source: str = "udp"

    def update_seen(self) -> None:
        self.last_seen = time.time()

def _get_parent_name(mocap: Bvh, joint: str) -> Optional[str]:
    try:
        node = mocap.get_joint(joint)
        if getattr(node, "parent", None):
            return node.parent.name
    except Exception:
        pass
    try:
        return mocap.joint_parent(joint)
    except Exception:
        return None

def _build_chain_root_to_joint(mocap: Bvh, joint: str) -> List[str]:
    chain = []
    cur = joint
    seen = set()
    while cur and cur not in seen:
        seen.add(cur)
        chain.append(cur)
        cur = _get_parent_name(mocap, cur)
    chain.reverse()
    return chain

def _joint_rot_channels(mocap: Bvh, joint: str) -> List[str]:
    return [c for c in mocap.joint_channels(joint) if c.endswith("rotation")]

def _local_quat_from_channels(mocap: Bvh, frame_idx: int, joint: str) -> Tuple[float, float, float, float]:
    chans = _joint_rot_channels(mocap, joint)
    q = (1.0, 0.0, 0.0, 0.0)
    if not chans:
        return q
    vals = mocap.frame_joint_channels(frame_idx, joint, chans)
    if len(vals) != len(chans):
        raise RuntimeError(f"Channel/value mismatch for {joint}")
    for ch_name, val in zip(chans, vals):
        axis = ch_name[0].upper()
        q = _q_mul(q, _q_axis(axis, float(val)))
    return _q_normalize(q)

@dataclass
class BVHSource:
    frames: List[Tuple[float, float, float]]
    frame_time: float

    @classmethod
    def load(cls, path: str, joint: str) -> "BVHSource":
        with open(path, "r") as f:
            mocap = Bvh(f.read())

        chain = _build_chain_root_to_joint(mocap, joint)
        if not chain:
            raise RuntimeError(f"Joint '{joint}' not found in BVH")

        n = len(mocap.frames)
        seq: List[Tuple[float, float, float]] = []

        for i in range(n):
            qg = (1.0, 0.0, 0.0, 0.0)
            for jn in chain:
                qloc = _local_quat_from_channels(mocap, i, jn)
                qg = _q_mul(qg, qloc)
            qg = _q_normalize(qg)
            qg = _q_mul(BVH_TO_GIMBAL_Q, qg)
            qg = _q_normalize(qg)
            x_deg, y_deg, z_deg = _q_to_euler_xyz_deg(qg)
            seq.append((x_deg, y_deg, z_deg))

        ft = float(getattr(mocap, "frame_time", 1.0/60.0))
        if not (1e-4 < ft < 1.0):
            ft = 1.0/60.0
        return cls(frames=seq, frame_time=ft)

class CSVLogger:
    def __init__(self, path: Path):
        self._f = path.open("w", newline="")
        self._w = csv.writer(self._f)
        self._w.writerow(
            [
                "ts", "mac", "battery_pct", "battery_volt",
                "qx", "qy", "qz", "qw",
                "acc_x", "acc_y", "acc_z",
                "enc_A", "enc_B", "enc_C",
                "err_A", "err_B", "err_C",
                "cmd_A", "cmd_B", "cmd_C",
            ]
        )
        self._lock = threading.Lock()

    def log(
        self,
        mac: str,
        battery_pct: float | None,
        battery_volt: float | None,
        quat: Tuple[float, float, float, float] | None,
        accel: Tuple[float, float, float] | None = None,
        enc_deg: Tuple[float, float, float] = (0.0, 0.0, 0.0),
        err_deg: Tuple[float, float, float] = (0.0, 0.0, 0.0),
        goal_deg: Tuple[float, float, float] = (0.0, 0.0, 0.0),
    ) -> None:
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
        if accel:
            row.extend(f"{a:.6f}" for a in accel)
        else:
            row.extend(["", "", ""])
        row.extend(f"{v:.3f}" for v in list(enc_deg) + list(err_deg) + list(goal_deg))
        with self._lock:
            self._w.writerow(row)
            self._f.flush()

def _send_rtr(bus: can.Bus, arbitration_id: int, dlc_try=(8, 0)) -> None:
    last_err = None
    for dlc in dlc_try:
        try:
            msg = can.Message(
                arbitration_id=arbitration_id,
                is_extended_id=False,
                is_remote_frame=True,
                dlc=dlc
            )
            bus.send(msg)
            return
        except TypeError as e:
            last_err = e
            try:
                msg = can.Message(
                    arbitration_id=arbitration_id,
                    is_extended_id=False,
                    remote=True,
                    dlc=dlc
                )
                bus.send(msg)
                return
            except Exception as e2:
                last_err = e2
        except Exception as e:
            last_err = e
    if VERBOSE:
        print(f"[CAN] RTR send failed for 0x{arbitration_id:X}: {last_err}")

class GimbalThread(threading.Thread):
    def __init__(self) -> None:
        super().__init__(daemon=True)
        self._stop_evt = threading.Event()
        self._last_turns: Dict[int, float] = {}
        self._last_limits: Dict[int, Tuple[float, float]] = {}

    def _flush(self, bus: can.Bus) -> None:
        while bus.recv(timeout=0):
            pass

    def _send(self, bus: can.Bus, nid: int, cmd: int, data: bytes = b"\x00") -> None:
        msg = can.Message(arbitration_id=cid(nid, cmd), data=data, is_extended_id=False)
        delay = 0.0005
        for _ in range(TX_RETRIES):
            try:
                bus.send(msg)
                return
            except can.CanOperationError:
                time.sleep(delay)
                delay = min(delay * 2, 0.01)
        if VERBOSE:
            print(f"[WARN] TX full, dropping cmd=0x{cmd:02X} nid={nid}")

    def _set_axis_state(self, bus: can.Bus, nid: int, state: int) -> None:
        try:
            self._send(bus, nid, CMD_SET_AXIS_STATE, struct.pack("<I", state))
        except can.CanOperationError:
            pass

    def _set_controller_mode(self, bus: can.Bus, nid: int) -> None:
        self._send(bus, nid, CMD_SET_CTRL_MODE, struct.pack("<II", CTRL_MODE_POS, INPUT_MODE_TRAP))

    def _set_traj_limits(self, bus: can.Bus, nid: int, vel_rps: float, acc_rps2: float) -> None:
        last = self._last_limits.get(nid)
        if last and abs(last[0] - vel_rps) < VEL_EPS and abs(last[1] - acc_rps2) < ACC_EPS:
            return
        self._send(bus, nid, CMD_TRAJ_VEL_LIM, struct.pack("<f", vel_rps))
        self._send(bus, nid, CMD_TRAJ_ACCEL_LIM, struct.pack("<ff", acc_rps2, acc_rps2))
        self._last_limits[nid] = (vel_rps, acc_rps2)

    def _set_input_pos(self, bus: can.Bus, nid: int, turns: float) -> None:
        self._send(bus, nid, CMD_SET_INPUT_POS, struct.pack("<fhh", turns, 0, 0))

    def _wait_cl(self, bus: can.Bus, timeout_s: float = 2.0) -> None:
        pending = set(NODE_IDS)
        deadline = time.time() + timeout_s
        while pending and time.time() < deadline:
            msg = bus.recv(timeout=0.1)
            if not msg:
                continue
            if (msg.arbitration_id & 0x1F) != CMD_HEARTBEAT:
                continue
            nid = msg.arbitration_id >> 5
            state = None
            if len(msg.data) >= 7:
                try:
                    state = struct.unpack("<IBBB", msg.data[:7])[1]
                except Exception:
                    pass
            if state == AXIS_CLOSED_LOOP and nid in pending:
                pending.remove(nid)
        if pending and VERBOSE:
            print(f"[WARN] CL not confirmed for nodes: {sorted(pending)} (continuing)")

    def _read_turns(self, bus: can.Bus, nid: int, timeout: float = 0.03) -> float:
        _send_rtr(bus, cid(nid, CMD_ENCODER_EST), dlc_try=(8, 0))
        deadline = time.time() + timeout
        while time.time() < deadline:
            msg = bus.recv(timeout=deadline - time.time())
            if (
                msg
                and (msg.arbitration_id >> 5) == nid
                and (msg.arbitration_id & 0x1F) == CMD_ENCODER_EST
                and len(msg.data) >= 8
            ):
                pos_turns, vel = struct.unpack("<ff", msg.data[:8])
                self._last_turns[nid] = pos_turns
                return pos_turns
        return self._last_turns.get(nid, 0.0)

    def _nearest_turns(self, cur_turns: float, target_deg: float) -> float:
        cur_deg = (cur_turns * 360.0) % 360.0
        delta_deg = ((target_deg - cur_deg + 540) % 360) - 180
        return cur_turns + delta_deg / 360.0

    def stop(self) -> None:
        self._stop_evt.set()

class BVHGimbalThread(GimbalThread):
    def __init__(self, bvh: 'BVHSource', loop_forever: bool = True) -> None:
        super().__init__()
        self._bvh = bvh
        self._loop_forever = loop_forever

    def _do_step_test(self, bus: can.Bus) -> None:
        print("[STEP] 0° → +90° → -90° → 0°")
        STEP_TEST_TURNS = [0.0, 0.25, -0.25, 0.0]
        for nid in NODE_IDS:
            self._set_traj_limits(bus, nid, vel_rps=0.5, acc_rps2=1.0)
            self._set_input_pos(bus, nid, 0.0)
        time.sleep(0.8)
        for turns in STEP_TEST_TURNS:
            for nid in NODE_IDS:
                self._set_input_pos(bus, nid, turns)
            print(f"[STEP] commanded {turns*360:.0f}°")
            time.sleep(0.8)
        print("[STEP] complete.")

    def run(self) -> None:
        try:
            with can.interface.Bus(channel=BUS_CH, interface="cantact") as bus:
                self._flush(bus)
                for nid in NODE_IDS:
                    self._send(bus, nid, CMD_CLR_ERR)
                    self._set_controller_mode(bus, nid)
                    self._set_axis_state(bus, nid, AXIS_CLOSED_LOOP)
                self._wait_cl(bus)

                if DO_STEP_TEST:
                    try:
                        self._do_step_test(bus)
                    except Exception as e:
                        print(f"[WARN] Step test error: {e}")

                prev_goal_deg: Optional[List[float]] = None
                next_tick = time.monotonic()

                while not self._stop_evt.is_set():
                    for frame_idx, (x_b, y_b, z_b) in enumerate(self._bvh.frames):
                        if self._stop_evt.is_set():
                            break
                        if (frame_idx % FRAME_DECIMATE) != 0:
                            continue

                        e = [x_b, y_b, z_b]
                        goal_deg = [AXIS_SIGN[k] * e[AXIS_REMAP[k]] for k in range(3)]

                        if prev_goal_deg is None:
                            prev_goal_deg = goal_deg[:]
                        dt = max(self._bvh.frame_time * FRAME_DECIMATE, OUTPUT_PERIOD)
                        degps = [
                            min(max(abs(err_short(c, p)) / dt, SPEED_MIN_DEG), SPEED_MAX_DEG)
                            for p, c in zip(prev_goal_deg, goal_deg)
                        ]
                        spd_deg = max(degps) if degps else SPEED_MIN_DEG
                        vel_rps = spd_deg / 360.0
                        acc_rps2 = vel_rps * ACCEL_FACTOR

                        now = time.monotonic()
                        if now < next_tick:
                            time.sleep(next_tick - now)
                        next_tick = time.monotonic() + OUTPUT_PERIOD

                        cur_turns = {nid: self._read_turns(bus, nid) for nid in NODE_IDS}
                        cur_deg_now = {nid: (cur_turns[nid] * 360.0) % 360.0 for nid in NODE_IDS}

                        for axis_index, nid in enumerate(NODE_IDS):
                            tgt = goal_deg[axis_index]
                            if abs(err_short(tgt, cur_deg_now[nid])) > POS_EPS_DEG:
                                tgt_turns = self._nearest_turns(cur_turns[nid], tgt)
                                self._set_traj_limits(bus, nid, vel_rps, acc_rps2)
                                self._set_input_pos(bus, nid, tgt_turns)

                        if VERBOSE and frame_idx < 30:
                            print(f"[BVH] frame={frame_idx} goal={goal_deg} cur={[cur_deg_now[n] for n in NODE_IDS]} spd≈{spd_deg:.1f}°/s")

                        # Update visualizer state
                        update_viz_state(
                            goal_deg=tuple(goal_deg),
                            enc_deg=tuple(cur_deg_now[nid] for nid in NODE_IDS)
                        )

                        prev_goal_deg = goal_deg[:]

                    if not self._loop_forever:
                        break

        except Exception as e:
            print(f"[FATAL] BVHGimbalThread crashed: {e}")
        finally:
            try:
                with can.interface.Bus(channel=BUS_CH, interface="socketcan") as bus:
                    for nid in NODE_IDS:
                        self._set_axis_state(bus, nid, AXIS_IDLE)
            except Exception:
                pass

class SlimeVRProtocol(asyncio.DatagramProtocol):
    def __init__(self, stop_cb, tracker_registry: Dict[str, Tracker], logger: CSVLogger) -> None:
        self.transport: asyncio.DatagramTransport | None = None
        self.trackers = tracker_registry
        self.addr_to_mac: Dict[Tuple[str, int], str] = {}
        self._stop_cb = stop_cb
        self._logger = logger

    def connection_made(self, transport) -> None:
        self.transport = transport
        print(f"[UDP] Listening on port {SERVER_PORT}")
        asyncio.get_event_loop().create_task(self._gc())

    def datagram_received(self, data: bytes, addr: Tuple[str, int]) -> None:
        try:
            if data.startswith(HEADER_MAGIC) and len(data) > 3:
                pkt_type = data[3]
                if pkt_type == PACKET_HANDSHAKE:
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
            elif pkt_type == PACKET_ROTATION_AND_ACCELERATION:
                self._rotation_and_accel(data, addr)
            elif pkt_type == PACKET_ACCELERATION:
                self._acceleration(data, addr)

            tracker = self._get(addr)
            if tracker:
                tracker.update_seen()

        except Exception as e:
            print(f"[UDP] Error from {addr}: {e}")

    def _handshake(self, data: bytes, addr: Tuple[str, int]) -> None:
        try:
            off = HEADER_SIZE + 24
            if off >= len(data):
                return
            fw_len = data[off]
            off += 1 + fw_len
            if off + 6 > len(data):
                return
            mac_bytes = data[off: off + 6]
            mac = ":".join(f"{b:02x}" for b in mac_bytes)
            if mac == "00:00:00:00:00:00":
                mac = f"ip-{addr[0].replace('.', '-')}"
            tracker = self.trackers.get(mac) or Tracker(mac=mac, addr=addr)
            tracker.addr = addr
            tracker.update_seen()
            self.trackers[mac] = tracker
            self.addr_to_mac[addr] = mac
            self._send(HANDSHAKE_RESPONSE, addr)
            print(f"[UDP] Handshake complete: {tracker.mac} from {addr[0]}:{addr[1]}")
        except Exception as e:
            print(f"[UDP] Handshake error from {addr}: {e}")

    def _battery(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker or len(data) < HEADER_SIZE + 8:
            return
        try:
            vol, pct = struct.unpack_from(">ff", data, HEADER_SIZE)
            if pct <= 1.0:
                pct *= 100.0
            tracker.battery = pct
            tracker.battery_volt = vol

            update_viz_state(battery_pct=pct, battery_volt=vol)

            state = get_viz_state()
            self._logger.log(
                tracker.mac, tracker.battery, tracker.battery_volt,
                tracker.quat, tracker.accel,
                state['enc_deg'], (0, 0, 0), state['goal_deg']
            )
        except Exception as e:
            print(f"[UDP] Battery parse error: {e}")

    def _rotation(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker:
            return
        try:
            if len(data) >= HEADER_SIZE + 2 + 16:
                offset = HEADER_SIZE + 2
                qx, qy, qz, qw = struct.unpack_from(">ffff", data, offset)
            elif len(data) >= HEADER_SIZE + 1 + 16:
                offset = HEADER_SIZE + 1
                qx, qy, qz, qw = struct.unpack_from(">ffff", data, offset)
            elif len(data) >= HEADER_SIZE + 16:
                qx, qy, qz, qw = struct.unpack_from(">ffff", data, HEADER_SIZE)
            else:
                return
            if validate_quaternion(qx, qy, qz, qw):
                tracker.quat = (qx, qy, qz, qw)
                euler = _q_to_euler_xyz_deg((qw, qx, qy, qz))

                # Update visualizer
                update_viz_state(quat=tracker.quat, euler=euler)

                # Log to CSV
                state = get_viz_state()
                self._logger.log(
                    tracker.mac, tracker.battery, tracker.battery_volt,
                    tracker.quat, tracker.accel,
                    state['enc_deg'], (0, 0, 0), state['goal_deg']
                )
        except Exception as e:
            print(f"[UDP] Rotation parse error: {e}")

    def _acceleration(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker:
            return
        try:
            if len(data) >= HEADER_SIZE + 13:
                ax, ay, az = struct.unpack_from(">fff", data, HEADER_SIZE)
            elif len(data) >= HEADER_SIZE + 12:
                ax, ay, az = struct.unpack_from(">fff", data, HEADER_SIZE)
            else:
                return
            if all(-1000.0 < v < 1000.0 and v == v for v in [ax, ay, az]):
                tracker.accel = (ax, ay, az)

                update_viz_state(accel=tracker.accel)

                state = get_viz_state()
                self._logger.log(
                    tracker.mac, tracker.battery, tracker.battery_volt,
                    tracker.quat, tracker.accel,
                    state['enc_deg'], (0, 0, 0), state['goal_deg']
                )
        except Exception as e:
            print(f"[UDP] Accel parse error: {e}")

    def _rotation_and_accel(self, data: bytes, addr: Tuple[str, int]) -> None:
        tracker = self._get(addr)
        if not tracker or len(data) < HEADER_SIZE + 1 + 14:
            return
        try:
            raw = struct.unpack_from(">7h", data, HEADER_SIZE + 1)
            scale_r = 1.0 / 32768.0
            qx, qy, qz, qw = [v * scale_r for v in raw[:4]]
            mag = (qx*qx + qy*qy + qz*qz + qw*qw) ** 0.5
            if mag > 0.1:
                qx, qy, qz, qw = qx/mag, qy/mag, qz/mag, qw/mag
            scale_a = 1.0 / 128.0
            ax, ay, az = [v * scale_a for v in raw[4:7]]
            if validate_quaternion(qx, qy, qz, qw):
                tracker.quat = (qx, qy, qz, qw)
                euler = _q_to_euler_xyz_deg((qw, qx, qy, qz))
            if all(-100.0 < v < 100.0 and v == v for v in [ax, ay, az]):
                tracker.accel = (ax, ay, az)

            if tracker.quat:
                euler = _q_to_euler_xyz_deg((tracker.quat[3], tracker.quat[0], tracker.quat[1], tracker.quat[2]))
                update_viz_state(quat=tracker.quat, euler=euler, accel=tracker.accel)

            state = get_viz_state()
            self._logger.log(
                tracker.mac, tracker.battery, tracker.battery_volt,
                tracker.quat, tracker.accel,
                state['enc_deg'], (0, 0, 0), state['goal_deg']
            )
        except Exception as e:
            print(f"[UDP] Rot+Accel parse error: {e}")

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
            to_remove = [mac for mac, trk in self.trackers.items() if now - trk.last_seen > DISCONNECT_SECONDS]
            for mac in to_remove:
                tracker = self.trackers.pop(mac)
                self.addr_to_mac.pop(tracker.addr, None)
                print(f"[UDP] Tracker {mac} disconnected (timeout)")


class HIDDongleReader:
    def __init__(self, tracker_registry: Dict[str, Tracker], logger: CSVLogger) -> None:
        self.trackers = tracker_registry
        self.device = None
        self.tracker_addrs: Dict[int, str] = {}
        self.running = False
        self._logger = logger

    def _find_dongle(self):
        for dev_info in hid.enumerate(HID_VID, HID_PID):
            device = hid.device()
            device.open_path(dev_info['path'])
            device.set_nonblocking(True)
            return device
        return None

    def _parse_hid_packet(self, data: bytes) -> None:
        if len(data) < HID_REPORT_SIZE:
            return

        pkt_type = data[0]
        tracker_id = data[1]

        if pkt_type == 255:
            if len(data) >= 8:
                addr_bytes = data[2:8]
                addr_str = ":".join(f"{b:02x}" for b in addr_bytes)
                self.tracker_addrs[tracker_id] = addr_str
            return

        mac = self.tracker_addrs.get(tracker_id)
        if mac is None:
            return

        tracker = self.trackers.get(mac)
        if tracker is None:
            tracker = Tracker(mac=mac, source="hid")
            self.trackers[mac] = tracker
            print(f"[HID] Tracker {mac} connected via HID dongle")

        tracker.update_seen()

        if pkt_type == 0:
            if len(data) >= 5:
                batt_pct = data[2]
                batt_v = data[3]
                tracker.battery = int(batt_pct) & 127 if batt_pct != 128 else 1
                tracker.battery_volt = (float(batt_v) + 245.0) / 100.0
                update_viz_state(battery_pct=tracker.battery, battery_volt=tracker.battery_volt)
        elif pkt_type == 1:
            if len(data) >= 16:
                q0, q1, q2, q3, a0, a1, a2 = struct.unpack_from("<7h", data, 2)
                tracker.quat = (q0 / 32768.0, q1 / 32768.0, q2 / 32768.0, q3 / 32768.0)
                tracker.accel = (a0 / 32768.0, a1 / 32768.0, a2 / 32768.0)
                euler = _q_to_euler_xyz_deg((tracker.quat[3], tracker.quat[0], tracker.quat[1], tracker.quat[2]))
                update_viz_state(quat=tracker.quat, euler=euler, accel=tracker.accel)
        elif pkt_type == 2:
            if len(data) >= 5:
                batt_pct = data[2]
                batt_v = data[3]
                tracker.battery = int(batt_pct) & 127 if batt_pct != 128 else 1
                tracker.battery_volt = (float(batt_v) + 245.0) / 100.0
                update_viz_state(battery_pct=tracker.battery, battery_volt=tracker.battery_volt)
        elif pkt_type == 4:
            if len(data) >= 16:
                q0, q1, q2, q3, m0, m1, m2 = struct.unpack_from("<7h", data, 2)
                tracker.quat = (q0 / 32768.0, q1 / 32768.0, q2 / 32768.0, q3 / 32768.0)
                euler = _q_to_euler_xyz_deg((tracker.quat[3], tracker.quat[0], tracker.quat[1], tracker.quat[2]))
                update_viz_state(quat=tracker.quat, euler=euler)

        state = get_viz_state()
        self._logger.log(
            mac, tracker.battery, tracker.battery_volt,
            tracker.quat, tracker.accel,
            state['enc_deg'], (0, 0, 0), state['goal_deg']
        )

    async def run(self) -> None:
        self.running = True
        print("[HID] Looking for HID dongle...")

        while self.running:
            if self.device is None:
                self.device = self._find_dongle()
                if self.device:
                    print("[HID] Dongle found and connected")
                else:
                    await asyncio.sleep(2)
                    continue

            try:
                data = self.device.read(64, timeout_ms=100)
                if data:
                    data = bytes(data)
                    for i in range(0, len(data), HID_REPORT_SIZE):
                        packet = data[i:i+HID_REPORT_SIZE]
                        if len(packet) == HID_REPORT_SIZE:
                            self._parse_hid_packet(packet)
                await asyncio.sleep(0.001)
            except Exception as e:
                print(f"[HID] Read error: {e}")
                try:
                    self.device.close()
                except:
                    pass
                self.device = None
                await asyncio.sleep(1)

    def stop(self) -> None:
        self.running = False
        if self.device:
            try:
                self.device.close()
            except:
                pass
            self.device = None


class RealtimeVisualizer:

    def __init__(self, width: int = 1920, height: int = 1080, title: str = "Gimbal + IMU Tracker System"):
        if not DPG_AVAILABLE:
            raise RuntimeError("DearPyGui not available")

        self.width = width
        self.height = height
        self.title = title
        self.running = False
        self._thread: Optional[threading.Thread] = None

    def _setup_theme(self):
        with dpg.theme() as self.global_theme:
            with dpg.theme_component(dpg.mvAll):
                dpg.add_theme_color(dpg.mvThemeCol_WindowBg, (15, 15, 25, 255))
                dpg.add_theme_color(dpg.mvThemeCol_TitleBg, (20, 20, 35, 255))
                dpg.add_theme_color(dpg.mvThemeCol_TitleBgActive, (40, 20, 80, 255))
                dpg.add_theme_color(dpg.mvThemeCol_FrameBg, (25, 25, 40, 255))
                dpg.add_theme_color(dpg.mvThemeCol_Text, (220, 220, 255, 255))
                dpg.add_theme_style(dpg.mvStyleVar_FrameRounding, 5)
                dpg.add_theme_style(dpg.mvStyleVar_WindowRounding, 10)

    def _create_battery_gauge(self, parent=None):
        with dpg.drawlist(width=200, height=400, tag="battery_canvas"):
            dpg.draw_rectangle((50, 20), (150, 380), color=(100, 100, 150, 255), thickness=3, tag="batt_outline")
            dpg.draw_rectangle((80, 5), (120, 20), color=(100, 100, 150, 255), fill=(100, 100, 150, 255))
            dpg.draw_rectangle((55, 375), (145, 375), color=(0, 255, 100, 255), fill=(0, 255, 100, 200), tag="batt_fill")
            dpg.draw_text((65, 190), "100%", color=(255, 255, 255, 255), size=24, tag="batt_text")
            dpg.draw_text((60, 390), "4.20V", color=(150, 150, 200, 255), size=16, tag="volt_text")

    def _create_3d_gimbal(self, parent=None):
        with dpg.drawlist(width=400, height=400, tag="gimbal_canvas"):
            cx, cy = 200, 200

    def _draw_gimbal_frame(self, roll: float, pitch: float, yaw: float):
        dpg.delete_item("gimbal_canvas", children_only=True)

        cx, cy = 200, 200

        r, p, y = math.radians(roll), math.radians(pitch), math.radians(yaw)

        self._draw_rotated_ellipse(cx, cy, 150, 150, y, (59, 130, 246, 200), "gimbal_canvas")
        self._draw_rotated_ellipse(cx, cy, 110, 50, p, (34, 197, 94, 200), "gimbal_canvas")
        self._draw_rotated_ellipse(cx, cy, 70, 30, r, (239, 68, 68, 200), "gimbal_canvas")

        dpg.draw_circle((cx, cy), 15, color=(147, 51, 234, 255), fill=(147, 51, 234, 200), parent="gimbal_canvas")

        dpg.draw_text((10, 370), f"R:{roll:+6.1f}°", color=(239, 68, 68, 255), size=18, parent="gimbal_canvas")
        dpg.draw_text((140, 370), f"P:{pitch:+6.1f}°", color=(34, 197, 94, 255), size=18, parent="gimbal_canvas")
        dpg.draw_text((270, 370), f"Y:{yaw:+6.1f}°", color=(59, 130, 246, 255), size=18, parent="gimbal_canvas")

    def _draw_rotated_ellipse(self, cx: float, cy: float, rx: float, ry: float, angle: float, color: tuple, parent: str):
        points = []
        segments = 64
        for i in range(segments + 1):
            t = (i / segments) * 2 * math.pi
            x = rx * math.cos(t)
            y = ry * math.sin(t)
            xr = x * math.cos(angle) - y * math.sin(angle)
            yr = x * math.sin(angle) + y * math.cos(angle)
            points.append((cx + xr, cy + yr))

        dpg.draw_polyline(points, color=color, thickness=3, parent=parent)

    def _update_battery_gauge(self, pct: float, volt: float):
        fill_height = 375 - (pct / 100.0) * 350

        if pct > 60:
            color = (34, 197, 94, 200)
        elif pct > 30:
            color = (234, 179, 8, 200)
        elif pct > 10:
            color = (249, 115, 22, 200)
        else:
            color = (239, 68, 68, 200)

        dpg.configure_item("batt_fill", pmin=(55, fill_height), pmax=(145, 375), color=color, fill=color)
        dpg.configure_item("batt_text", text=f"{pct:.0f}%", pos=(65 if pct >= 10 else 75, 190))
        dpg.configure_item("volt_text", text=f"{volt:.2f}V", pos=(60, 390))

    def _build_ui(self):
        dpg.create_context()
        dpg.create_viewport(title=self.title, width=self.width, height=self.height)

        self._setup_theme()
        dpg.bind_theme(self.global_theme)

        with dpg.window(label=self.title, tag="main_window",
                       no_title_bar=True, no_resize=True, no_move=True,
                       pos=(0, 0), width=self.width, height=self.height):

            with dpg.group(horizontal=True):
                dpg.add_text("GIMBAL + IMU TRACKER SYSTEM", color=(147, 51, 234, 255))
                dpg.add_spacer(width=50)
                dpg.add_text("00:00:00", tag="elapsed_time", color=(100, 200, 255, 255))
                dpg.add_spacer(width=50)
                dpg.add_text("Samples: 0", tag="sample_count", color=(150, 150, 200, 255))

            dpg.add_separator()
            dpg.add_spacer(height=10)

            with dpg.group(horizontal=True):
                with dpg.child_window(width=220, height=500, border=True):
                    dpg.add_text("BATTERY", color=(34, 197, 94, 255))
                    dpg.add_separator()
                    self._create_battery_gauge()

                dpg.add_spacer(width=20)

                with dpg.child_window(width=420, height=500, border=True):
                    dpg.add_text("GIMBAL ORIENTATION", color=(59, 130, 246, 255))
                    dpg.add_separator()
                    self._create_3d_gimbal()

                dpg.add_spacer(width=20)

                with dpg.child_window(width=350, height=500, border=True):
                    dpg.add_text("TRACKER DATA", color=(239, 68, 68, 255))
                    dpg.add_separator()
                    dpg.add_spacer(height=10)

                    dpg.add_text("Quaternion (x, y, z, w):", color=(150, 150, 200, 255))
                    dpg.add_text("( 0.000,  0.000,  0.000,  1.000)", tag="quat_display")

                    dpg.add_spacer(height=15)
                    dpg.add_text("Euler Angles:", color=(150, 150, 200, 255))
                    dpg.add_text("Roll:   0.0°", tag="euler_roll", color=(239, 68, 68, 255))
                    dpg.add_text("Pitch:  0.0°", tag="euler_pitch", color=(34, 197, 94, 255))
                    dpg.add_text("Yaw:    0.0°", tag="euler_yaw", color=(59, 130, 246, 255))

                    dpg.add_spacer(height=15)
                    dpg.add_text("Acceleration (g):", color=(150, 150, 200, 255))
                    dpg.add_text("X:  0.00  Y:  0.00  Z:  0.00", tag="accel_display")

                    dpg.add_spacer(height=15)
                    dpg.add_text("Gimbal Command:", color=(150, 150, 200, 255))
                    dpg.add_text("Goal: (  0.0°,   0.0°,   0.0°)", tag="goal_display")
                    dpg.add_text("Enc:  (  0.0°,   0.0°,   0.0°)", tag="enc_display")

                    dpg.add_spacer(height=15)
                    dpg.add_text("Tracking Error:", color=(150, 150, 200, 255))
                    dpg.add_progress_bar(default_value=0, tag="error_bar", width=300)
                    dpg.add_text("0.0°", tag="error_text")

            dpg.add_spacer(height=10)

            with dpg.child_window(height=350, border=True):
                dpg.add_text("TELEMETRY", color=(234, 179, 8, 255))
                dpg.add_separator()

                with dpg.group(horizontal=True):
                    with dpg.plot(label="Orientation", width=600, height=280, tag="euler_plot"):
                        dpg.add_plot_legend()
                        dpg.add_plot_axis(dpg.mvXAxis, label="Time (s)", tag="euler_x_axis")
                        dpg.add_plot_axis(dpg.mvYAxis, label="Degrees", tag="euler_y_axis")
                        dpg.set_axis_limits("euler_y_axis", -180, 180)

                        dpg.add_line_series([], [], label="Roll", parent="euler_y_axis", tag="roll_series")
                        dpg.add_line_series([], [], label="Pitch", parent="euler_y_axis", tag="pitch_series")
                        dpg.add_line_series([], [], label="Yaw", parent="euler_y_axis", tag="yaw_series")

                    dpg.add_spacer(width=20)

                    with dpg.plot(label="Battery", width=600, height=280, tag="battery_plot"):
                        dpg.add_plot_legend()
                        dpg.add_plot_axis(dpg.mvXAxis, label="Time (s)", tag="batt_x_axis")
                        dpg.add_plot_axis(dpg.mvYAxis, label="Percent", tag="batt_y_axis")
                        dpg.set_axis_limits("batt_y_axis", 0, 105)

                        dpg.add_line_series([], [], label="Battery %", parent="batt_y_axis", tag="batt_series")
                        dpg.add_line_series([], [], label="Voltage×20", parent="batt_y_axis", tag="volt_series")

        with dpg.theme() as roll_theme:
            with dpg.theme_component(dpg.mvLineSeries):
                dpg.add_theme_color(dpg.mvPlotCol_Line, (239, 68, 68, 255), category=dpg.mvThemeCat_Plots)
        dpg.bind_item_theme("roll_series", roll_theme)

        with dpg.theme() as pitch_theme:
            with dpg.theme_component(dpg.mvLineSeries):
                dpg.add_theme_color(dpg.mvPlotCol_Line, (34, 197, 94, 255), category=dpg.mvThemeCat_Plots)
        dpg.bind_item_theme("pitch_series", pitch_theme)

        with dpg.theme() as yaw_theme:
            with dpg.theme_component(dpg.mvLineSeries):
                dpg.add_theme_color(dpg.mvPlotCol_Line, (59, 130, 246, 255), category=dpg.mvThemeCat_Plots)
        dpg.bind_item_theme("yaw_series", yaw_theme)

        with dpg.theme() as batt_theme:
            with dpg.theme_component(dpg.mvLineSeries):
                dpg.add_theme_color(dpg.mvPlotCol_Line, (34, 197, 94, 255), category=dpg.mvThemeCat_Plots)
        dpg.bind_item_theme("batt_series", batt_theme)

        with dpg.theme() as volt_theme:
            with dpg.theme_component(dpg.mvLineSeries):
                dpg.add_theme_color(dpg.mvPlotCol_Line, (234, 179, 8, 255), category=dpg.mvThemeCat_Plots)
        dpg.bind_item_theme("volt_series", volt_theme)

        dpg.setup_dearpygui()
        dpg.show_viewport()
        dpg.set_primary_window("main_window", True)

    def _render_loop_content(self):
        now = time.time()

        if not hasattr(self, '_last_ui_update'):
            self._last_ui_update = now

        if now - self._last_ui_update > 0.033:
            state = get_viz_state()

            if state['start_time']:
                elapsed = now - state['start_time']
                hrs = int(elapsed // 3600)
                mins = int((elapsed % 3600) // 60)
                secs = int(elapsed % 60)
                dpg.set_value("elapsed_time", f"{hrs:02d}:{mins:02d}:{secs:02d}")

            dpg.set_value("sample_count", f"Samples: {state['samples']:,}")

            self._update_battery_gauge(state['battery_pct'], state['battery_volt'])

            euler = state['euler']
            self._draw_gimbal_frame(euler[0], euler[1], euler[2])

            q = state['quat']
            dpg.set_value("quat_display", f"({q[0]:+.3f}, {q[1]:+.3f}, {q[2]:+.3f}, {q[3]:+.3f})")

            dpg.set_value("euler_roll", f"Roll:  {euler[0]:+7.2f}°")
            dpg.set_value("euler_pitch", f"Pitch: {euler[1]:+7.2f}°")
            dpg.set_value("euler_yaw", f"Yaw:   {euler[2]:+7.2f}°")

            acc = state['accel']
            dpg.set_value("accel_display", f"X:{acc[0]:+5.2f}  Y:{acc[1]:+5.2f}  Z:{acc[2]:+5.2f}")

            goal = state['goal_deg']
            enc = state['enc_deg']
            dpg.set_value("goal_display", f"Goal: ({goal[0]:+6.1f}°, {goal[1]:+6.1f}°, {goal[2]:+6.1f}°)")
            dpg.set_value("enc_display", f"Enc:  ({enc[0]:+6.1f}°, {enc[1]:+6.1f}°, {enc[2]:+6.1f}°)")

            if state['err_history']:
                err = state['err_history'][-1]
                dpg.set_value("error_bar", min(err / 10.0, 1.0))
                dpg.set_value("error_text", f"{err:.2f}°")

            time_hist = state['time_history']
            if time_hist and len(time_hist) > 0:
                current_time = time_hist[-1]
                window_start = max(0, current_time - 60)

                start_idx = 0
                for i, t in enumerate(time_hist):
                    if t >= window_start:
                        start_idx = i
                        break

                # Get only the visible portion of the data
                time_visible = list(time_hist)[start_idx:]
                roll_visible = list(state['roll_history'])[start_idx:]
                pitch_visible = list(state['pitch_history'])[start_idx:]
                yaw_visible = list(state['yaw_history'])[start_idx:]

                dpg.set_value("roll_series", [time_visible, roll_visible])
                dpg.set_value("pitch_series", [time_visible, pitch_visible])
                dpg.set_value("yaw_series", [time_visible, yaw_visible])

                if len(time_hist) > 1:
                    dpg.set_axis_limits("euler_x_axis", window_start, current_time + 1)
                    dpg.set_axis_limits("batt_x_axis", window_start, current_time + 1)

            batt_hist = state['battery_history']
            volt_hist = state['voltage_history']
            if batt_hist and time_hist and len(time_hist) > 0:
                current_time = time_hist[-1]
                window_start = max(0, current_time - 60)

                start_idx = 0
                for i, t in enumerate(time_hist):
                    if t >= window_start:
                        start_idx = i
                        break

                time_visible = list(time_hist)[start_idx:]
                batt_visible = list(batt_hist)[start_idx:]

                dpg.set_value("batt_series", [time_visible, batt_visible])

                if volt_hist and len(volt_hist) > start_idx:
                    volt_visible = [v * 20 for v in list(volt_hist)[start_idx:]]
                    dpg.set_value("volt_series", [time_visible, volt_visible])

            self._last_ui_update = now

    def _render_loop(self):
        """Main render loop."""
        while dpg.is_dearpygui_running() and self.running:
            self._render_loop_content()
            dpg.render_dearpygui_frame()
        dpg.destroy_context()

    def start(self, blocking: bool = True):
        """Start the visualizer."""
        self.running = True
        self._build_ui()

        if blocking:
            self._render_loop()
        else:
            self._thread = threading.Thread(target=self._render_loop, daemon=True)
            self._thread.start()

    def stop(self):
        """Stop the visualizer."""
        self.running = False
        if self._thread:
            self._thread.join(timeout=2.0)

def main() -> None:
    log_file = setup_error_logging()
    sys.excepthook = log_exception
    threading.excepthook = log_thread_exception

    print("=" * 80)
    print("Integrated Gimbal + IMU Tracker Visualization System")
    print("=" * 80)
    print(f"[LOG] Error logging to {log_file}")

    # Initialize CSV logger
    logger = CSVLogger(Path("integrated_tracker_log.csv"))
    print(f"[LOG] Logging to integrated_tracker_log.csv")

    # Initialize tracker registry
    tracker_registry: Dict[str, Tracker] = {}

    # Start BVH gimbal control thread (if BVH is available)
    gimbal_thread = None
    if BVH_AVAILABLE and os.path.exists(BVH_PATH):
        try:
            bvh_src = BVHSource.load(BVH_PATH, BVH_JOINT)
            print(f"[BVH] Loaded {len(bvh_src.frames)} frames from {BVH_PATH}")
            gimbal_thread = BVHGimbalThread(bvh_src, loop_forever=LOOP_BVH)
            gimbal_thread.start()
            print("[BVH] Gimbal control thread started")
        except Exception as e:
            print(f"[WARN] Failed to load BVH: {e}")
    else:
        print("[INFO] BVH gimbal control disabled (no BVH file or library)")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    transport = None
    try:
        transport, _ = loop.run_until_complete(
            loop.create_datagram_endpoint(
                lambda: SlimeVRProtocol(
                    lambda: loop.call_soon_threadsafe(loop.stop),
                    tracker_registry,
                    logger
                ),
                local_addr=("0.0.0.0", SERVER_PORT),
            )
        )
        print(f"[UDP] SlimeVR server started on port {SERVER_PORT}")
    except Exception as e:
        print(f"[WARN] UDP bind failed: {e}")

    hid_reader = None
    if HID_AVAILABLE:
        hid_reader = HIDDongleReader(tracker_registry, logger)
        loop.create_task(hid_reader.run())
        print("[HID] Dongle reader started")
    else:
        print("[INFO] HID dongle support disabled")

    async_thread = threading.Thread(target=loop.run_forever, daemon=True)
    async_thread.start()
    print("[ASYNC] Event loop started")

    if DPG_AVAILABLE:
        try:
            viz = RealtimeVisualizer(width=1280, height=900)
            viz.start(blocking=True)
        except KeyboardInterrupt:
            print("\n[SHUTDOWN] Keyboard interrupt received")
        except Exception as e:
            print(f"[ERROR] Visualizer error: {e}")
    else:
        print("[ERROR] DearPyGui not available - visualization disabled")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[SHUTDOWN] Keyboard interrupt received")

    # Cleanup
    print("[SHUTDOWN] Cleaning up...")

    if gimbal_thread:
        gimbal_thread.stop()
        gimbal_thread.join(timeout=2.0)

    if hid_reader:
        hid_reader.stop()

    if transport:
        transport.close()

    try:
        loop.call_soon_threadsafe(loop.stop)
        async_thread.join(timeout=2.0)
        loop.close()
    except Exception:
        pass

    print("[SHUTDOWN] Complete")

if __name__ == "__main__":
    main()
