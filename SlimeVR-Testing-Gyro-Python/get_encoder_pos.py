from __future__ import annotations
import struct, can, math, time

BUS_CH        = "can0"
NODE_IDS      = [1, 2, 3] # X, Y, Z
ACCEL_FACTOR  = 4.0 # accel = decel = speed * this
ERR_TOL_DEG   = 1.0 

CMD_CLR_ERR        = 0x18
CMD_SET_AXIS_STATE = 0x07
CMD_HEARTBEAT      = 0x01
CMD_SET_CTRL_MODE  = 0x0B
CMD_TRAJ_VEL_LIM   = 0x11
CMD_TRAJ_ACCEL_LIM = 0x12
CMD_SET_INPUT_POS  = 0x0C
CMD_ENCODER_EST    = 0x09

AXIS_IDLE          = 1
AXIS_CLOSED_LOOP   = 8
CTRL_MODE_POS      = 3
INPUT_MODE_TRAP    = 5

def cid(nid: int, cmd: int) -> int:
    return (nid << 5) | cmd

def flush(bus: can.Bus) -> None:
    while bus.recv(timeout=0):
        pass

def send(bus: can.Bus, nid: int, cmd: int, data: bytes = b'\x00') -> None:
    bus.send(
        can.Message(
            arbitration_id=cid(nid, cmd),
            data=data,
            is_extended_id=False
        )
    )

def clear_errors(bus: can.Bus, nid: int) -> None:
    send(bus, nid, CMD_CLR_ERR)


def set_axis_state(bus: can.Bus, nid: int, state: int) -> None:
    send(bus, nid, CMD_SET_AXIS_STATE, struct.pack('<I', state))

def set_controller_mode(bus: can.Bus, nid: int) -> None:
    send(bus, nid, CMD_SET_CTRL_MODE,
         struct.pack('<II', CTRL_MODE_POS, INPUT_MODE_TRAP))

def set_traj_limits(bus: can.Bus, nid: int,
                    vel_rps: float, acc_rps2: float) -> None:
    send(bus, nid, CMD_TRAJ_VEL_LIM,  struct.pack('<f', vel_rps))
    send(bus, nid, CMD_TRAJ_ACCEL_LIM,struct.pack('<ff', acc_rps2, acc_rps2))

def set_input_pos(bus: can.Bus, nid: int, turns: float) -> None:
    send(bus, nid, CMD_SET_INPUT_POS, struct.pack('<fhh', turns, 0, 0))

def wait_closed_loop(bus: can.Bus) -> None:
    pending = set(NODE_IDS)
    deadline = time.time() + 2
    while pending:
        msg = bus.recv(timeout=0.1)
        if msg is None:
            if time.time() > deadline:
                raise RuntimeError(f"No heartbeat from {pending}")
            continue
        if msg.arbitration_id & 0x1F != CMD_HEARTBEAT:
            continue
        nid = msg.arbitration_id >> 5
        if nid in pending:
            _, state, *_ = struct.unpack('<IBBB', msg.data[:7])
            if state == AXIS_CLOSED_LOOP:
                print(f"node {nid} in CLOSED_LOOP_CONTROL")
                pending.remove(nid)

def read_turns(bus: can.Bus, nid: int, timeout: float = 0.2) -> float:
    deadline = time.time() + timeout
    while time.time() < deadline:
        msg = bus.recv(timeout=deadline - time.time())
        if msg and (msg.arbitration_id >> 5) == nid \
           and (msg.arbitration_id & 0x1F) == CMD_ENCODER_EST:
            pos, _ = struct.unpack('<ff', msg.data)
            return pos
    raise RuntimeError(f"No encoder frame from node {nid}")

#wrapping maths
def nearest_turns(cur_turns: float, target_deg: float) -> float:
    tgt_mod = target_deg / 360.0
    cur_mod = cur_turns % 1.0
    delta   = (tgt_mod - cur_mod + 0.5) % 1.0 - 0.5
    return cur_turns + delta

def wrap_deg(deg: float) -> float: return deg % 360.0

def err_short(goal: float, cur: float) -> float:
    return ((goal - cur + 540) % 360) - 180

with can.interface.Bus(channel=BUS_CH, interface="socketcan") as bus:
    flush(bus)

    for nid in NODE_IDS:
        clear_errors(bus, nid)
        set_controller_mode(bus, nid)
        set_axis_state(bus, nid, AXIS_CLOSED_LOOP)
    wait_closed_loop(bus)

    print("\nEnter   X  Y  Z  speed_deg/s   (q to quit)")
    while True:
        try:
            line = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if line.lower().startswith("q"):
            break
        try:
            x_deg, y_deg, z_deg, spd_deg = map(float, line.split())
        except ValueError:
            print("Need exactly four numbers.")
            continue

        vel_rps  = spd_deg / 360.0
        acc_rps2 = vel_rps * ACCEL_FACTOR

        # read present position of every axis once
        cur_turns = {nid: read_turns(bus, nid) for nid in NODE_IDS}

        # send new trajectory limits and target
        for nid, goal_deg in zip(NODE_IDS, (x_deg, y_deg, z_deg)):
            tgt_turns = nearest_turns(cur_turns[nid], goal_deg)
            set_traj_limits(bus, nid, vel_rps, acc_rps2)
            set_input_pos(bus, nid, tgt_turns)

        # wait for trajectory_done bit
        done = set()
        while done != set(NODE_IDS):
            msg = bus.recv(timeout=0.1)
            if msg is None:
                continue
            if msg.arbitration_id & 0x1F != CMD_HEARTBEAT:
                continue
            nid = msg.arbitration_id >> 5
            if nid not in NODE_IDS:
                continue
            _, _, _, traj_done = struct.unpack('<IBBB', msg.data[:7])
            if traj_done:
                done.add(nid)
        print("move completed")

        #final error report
        for nid in NODE_IDS:
            pos_t = read_turns(bus, nid)
            cur_d = wrap_deg(pos_t * 360.0)
            goal_d = [x_deg, y_deg, z_deg][NODE_IDS.index(nid)]
            e = err_short(goal_d, cur_d)
            print(f"node {nid}: final error {e:+.2f}°")

    # idle on exit
    for nid in NODE_IDS:
        set_axis_state(bus, nid, AXIS_IDLE)
print("Axes idled – bye.")
