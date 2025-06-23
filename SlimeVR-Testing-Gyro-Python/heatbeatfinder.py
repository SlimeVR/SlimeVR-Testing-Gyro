import can, struct, time

NODE_IDS = [0, 1, 2, 3, 4]
TIMEOUT  = 2.0

bus = can.interface.Bus("can0", bustype="socketcan")
seen = {}
deadline = time.time() + TIMEOUT
while time.time() < deadline and len(seen) < len(NODE_IDS):
    msg = bus.recv(timeout=0.1)
    if not msg:
        continue
    nid = msg.arbitration_id >> 5
    cmd = msg.arbitration_id & 0x1F
    if cmd == 0x01 and nid in NODE_IDS: # Heartbeat
        error, state, result, traj = struct.unpack('<IBBB', bytes(msg.data[:7]))
        seen[nid] = (error, state)
for nid in NODE_IDS:
    if nid in seen:
        err, st = seen[nid]
        print(f"Node {nid:2d}: state={st}  error=0x{err:08X}")
    else:
        print(f"Node {nid:2d}: **no heartbeat received**")
