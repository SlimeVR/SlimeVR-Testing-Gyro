import can, struct, time

NODE = 1
bus = can.interface.Bus("can0", interface="socketcan")

while bus.recv(timeout=0): pass

bus.send(can.Message(
    arbitration_id=(NODE << 5) | 0x07, # Set_Axis_State
    data=struct.pack('<I', 3), # 3 = FULL_CALIBRATION_SEQUENCE
    is_extended_id=False
))

print("Full-cal sequence started")
while True:
    msg = bus.recv(timeout=5)
    if not msg:
        raise RuntimeError("Timeout while waiting for heartbeat")
    if msg.arbitration_id != ((NODE << 5) | 0x01): # Heartbeat?
        continue
    error, state, _, _ = struct.unpack('<IBBB', bytes(msg.data[:7]))
    if error:
        raise RuntimeError(f"Calibration failed, error 0x{error:08X}")
    if state == 1: # back in IDLE
        break

print("Calibration succeeded, saving …")
bus.send(can.Message(
    arbitration_id=(NODE << 5) | 0x04, # RxSdo
    data=struct.pack('<BHB', 0x01, 0x0253, 0), # OPCODE_WRITE, endpoint 'save_configuration'
    is_extended_id=False
))
print("Saved, you can now switch to CLOSED_LOOP_CONTROL.")
