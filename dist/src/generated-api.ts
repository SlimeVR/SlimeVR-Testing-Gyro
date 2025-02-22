import * as can from "socketcan";
type RawChannel = ReturnType<typeof can.createRawChannel>;
export interface GetVersionMessage {
    fwVersionUnreleased: number;
    fwVersionRevision: number;
    fwVersionMinor: number;
    fwVersionMajor: number;
    hwVersionVariant: number;
    hwVersionMinor: number;
    hwVersionMajor: number;
    protocolVersion: number;
    id: 0;
}
export function parseGetVersion(data: Buffer): Omit<GetVersionMessage, "id"> {
    return {
        fwVersionUnreleased: data.readUInt8(7) & 0xff,
        fwVersionRevision: data.readUInt8(6) & 0xff,
        fwVersionMinor: data.readUInt8(5) & 0xff,
        fwVersionMajor: data.readUInt8(4) & 0xff,
        hwVersionVariant: data.readUInt8(3) & 0xff,
        hwVersionMinor: data.readUInt8(2) & 0xff,
        hwVersionMajor: data.readUInt8(1) & 0xff,
        protocolVersion: data.readUInt8(0) & 0xff
    };
}
export function createGetVersionBuffer(message: GetVersionMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(message.fwVersionUnreleased & 0xff, 7);
    buffer.writeUInt8(message.fwVersionRevision & 0xff, 6);
    buffer.writeUInt8(message.fwVersionMinor & 0xff, 5);
    buffer.writeUInt8(message.fwVersionMajor & 0xff, 4);
    buffer.writeUInt8(message.hwVersionVariant & 0xff, 3);
    buffer.writeUInt8(message.hwVersionMinor & 0xff, 2);
    buffer.writeUInt8(message.hwVersionMajor & 0xff, 1);
    buffer.writeUInt8(message.protocolVersion & 0xff, 0);
    return buffer;
}
export interface HeartbeatMessage {
    trajectoryDoneFlag: boolean;
    procedureResult: "SUCCESS" | "BUSY" | "CANCELLED" | "DISARMED" | "NO_RESPONSE" | "POLE_PAIR_CPR_MISMATCH" | "PHASE_RESISTANCE_OUT_OF_RANGE" | "PHASE_INDUCTANCE_OUT_OF_RANGE" | "UNBALANCED_PHASES" | "INVALID_MOTOR_TYPE" | "ILLEGAL_HALL_STATE" | "TIMEOUT" | "HOMING_WITHOUT_ENDSTOP" | "INVALID_STATE" | "NOT_CALIBRATED" | "NOT_CONVERGING";
    axisState: "UNDEFINED" | "IDLE" | "STARTUP_SEQUENCE" | "FULL_CALIBRATION_SEQUENCE" | "MOTOR_CALIBRATION" | "ENCODER_INDEX_SEARCH" | "ENCODER_OFFSET_CALIBRATION" | "CLOSED_LOOP_CONTROL" | "LOCKIN_SPIN" | "ENCODER_DIR_FIND" | "HOMING" | "ENCODER_HALL_POLARITY_CALIBRATION" | "ENCODER_HALL_PHASE_CALIBRATION" | "ANTICOGGING_CALIBRATION" | "SENSORLESS_CONTROL";
    axisError: "NONE" | "INITIALIZING" | "SYSTEM_LEVEL" | "TIMING_ERROR" | "MISSING_ESTIMATE" | "BAD_CONFIG" | "DRV_FAULT" | "MISSING_INPUT" | "DC_BUS_OVER_VOLTAGE" | "DC_BUS_UNDER_VOLTAGE" | "DC_BUS_OVER_CURRENT" | "DC_BUS_OVER_REGEN_CURRENT" | "CURRENT_LIMIT_VIOLATION" | "MOTOR_OVER_TEMP" | "INVERTER_OVER_TEMP" | "VELOCITY_LIMIT_VIOLATION" | "POSITION_LIMIT_VIOLATION" | "WATCHDOG_TIMER_EXPIRED" | "ESTOP_REQUESTED" | "SPINOUT_DETECTED" | "BRAKE_RESISTOR_DISARMED" | "THERMISTOR_DISCONNECTED" | "CALIBRATION_ERROR";
    id: 1;
}
const heartbeat_procedureResultMap = {
    0: "SUCCESS",
    1: "BUSY",
    2: "CANCELLED",
    3: "DISARMED",
    4: "NO_RESPONSE",
    5: "POLE_PAIR_CPR_MISMATCH",
    6: "PHASE_RESISTANCE_OUT_OF_RANGE",
    7: "PHASE_INDUCTANCE_OUT_OF_RANGE",
    8: "UNBALANCED_PHASES",
    9: "INVALID_MOTOR_TYPE",
    10: "ILLEGAL_HALL_STATE",
    11: "TIMEOUT",
    12: "HOMING_WITHOUT_ENDSTOP",
    13: "INVALID_STATE",
    14: "NOT_CALIBRATED",
    15: "NOT_CONVERGING"
} as Record<number, HeartbeatMessage["procedureResult"]>;
const heartbeat_procedureResultMapFliped = {
    "SUCCESS": 0,
    "BUSY": 1,
    "CANCELLED": 2,
    "DISARMED": 3,
    "NO_RESPONSE": 4,
    "POLE_PAIR_CPR_MISMATCH": 5,
    "PHASE_RESISTANCE_OUT_OF_RANGE": 6,
    "PHASE_INDUCTANCE_OUT_OF_RANGE": 7,
    "UNBALANCED_PHASES": 8,
    "INVALID_MOTOR_TYPE": 9,
    "ILLEGAL_HALL_STATE": 10,
    "TIMEOUT": 11,
    "HOMING_WITHOUT_ENDSTOP": 12,
    "INVALID_STATE": 13,
    "NOT_CALIBRATED": 14,
    "NOT_CONVERGING": 15
} as Record<HeartbeatMessage["procedureResult"], number>;
const heartbeat_axisStateMap = {
    0: "UNDEFINED",
    1: "IDLE",
    2: "STARTUP_SEQUENCE",
    3: "FULL_CALIBRATION_SEQUENCE",
    4: "MOTOR_CALIBRATION",
    6: "ENCODER_INDEX_SEARCH",
    7: "ENCODER_OFFSET_CALIBRATION",
    8: "CLOSED_LOOP_CONTROL",
    9: "LOCKIN_SPIN",
    10: "ENCODER_DIR_FIND",
    11: "HOMING",
    12: "ENCODER_HALL_POLARITY_CALIBRATION",
    13: "ENCODER_HALL_PHASE_CALIBRATION",
    14: "ANTICOGGING_CALIBRATION",
    5: "SENSORLESS_CONTROL"
} as Record<number, HeartbeatMessage["axisState"]>;
const heartbeat_axisStateMapFliped = {
    "UNDEFINED": 0,
    "IDLE": 1,
    "STARTUP_SEQUENCE": 2,
    "FULL_CALIBRATION_SEQUENCE": 3,
    "MOTOR_CALIBRATION": 4,
    "ENCODER_INDEX_SEARCH": 6,
    "ENCODER_OFFSET_CALIBRATION": 7,
    "CLOSED_LOOP_CONTROL": 8,
    "LOCKIN_SPIN": 9,
    "ENCODER_DIR_FIND": 10,
    "HOMING": 11,
    "ENCODER_HALL_POLARITY_CALIBRATION": 12,
    "ENCODER_HALL_PHASE_CALIBRATION": 13,
    "ANTICOGGING_CALIBRATION": 14,
    "SENSORLESS_CONTROL": 5
} as Record<HeartbeatMessage["axisState"], number>;
const heartbeat_axisErrorMap = {
    0: "NONE",
    1: "INITIALIZING",
    2: "SYSTEM_LEVEL",
    4: "TIMING_ERROR",
    8: "MISSING_ESTIMATE",
    16: "BAD_CONFIG",
    32: "DRV_FAULT",
    64: "MISSING_INPUT",
    256: "DC_BUS_OVER_VOLTAGE",
    512: "DC_BUS_UNDER_VOLTAGE",
    1024: "DC_BUS_OVER_CURRENT",
    2048: "DC_BUS_OVER_REGEN_CURRENT",
    4096: "CURRENT_LIMIT_VIOLATION",
    8192: "MOTOR_OVER_TEMP",
    16384: "INVERTER_OVER_TEMP",
    32768: "VELOCITY_LIMIT_VIOLATION",
    65536: "POSITION_LIMIT_VIOLATION",
    16777216: "WATCHDOG_TIMER_EXPIRED",
    33554432: "ESTOP_REQUESTED",
    67108864: "SPINOUT_DETECTED",
    134217728: "BRAKE_RESISTOR_DISARMED",
    268435456: "THERMISTOR_DISCONNECTED",
    1073741824: "CALIBRATION_ERROR"
} as Record<number, HeartbeatMessage["axisError"]>;
const heartbeat_axisErrorMapFliped = {
    "NONE": 0,
    "INITIALIZING": 1,
    "SYSTEM_LEVEL": 2,
    "TIMING_ERROR": 4,
    "MISSING_ESTIMATE": 8,
    "BAD_CONFIG": 16,
    "DRV_FAULT": 32,
    "MISSING_INPUT": 64,
    "DC_BUS_OVER_VOLTAGE": 256,
    "DC_BUS_UNDER_VOLTAGE": 512,
    "DC_BUS_OVER_CURRENT": 1024,
    "DC_BUS_OVER_REGEN_CURRENT": 2048,
    "CURRENT_LIMIT_VIOLATION": 4096,
    "MOTOR_OVER_TEMP": 8192,
    "INVERTER_OVER_TEMP": 16384,
    "VELOCITY_LIMIT_VIOLATION": 32768,
    "POSITION_LIMIT_VIOLATION": 65536,
    "WATCHDOG_TIMER_EXPIRED": 16777216,
    "ESTOP_REQUESTED": 33554432,
    "SPINOUT_DETECTED": 67108864,
    "BRAKE_RESISTOR_DISARMED": 134217728,
    "THERMISTOR_DISCONNECTED": 268435456,
    "CALIBRATION_ERROR": 1073741824
} as Record<HeartbeatMessage["axisError"], number>;
export function parseHeartbeat(data: Buffer): Omit<HeartbeatMessage, "id"> {
    return {
        trajectoryDoneFlag: (data.readUIntLE(6, 1) & 0x1) == 1,
        procedureResult: heartbeat_procedureResultMap[data.readUInt8(5) & 0xff],
        axisState: heartbeat_axisStateMap[data.readUInt8(4) & 0xff],
        axisError: heartbeat_axisErrorMap[data.readUInt32LE(0) & 0xffffffff]
    };
}
export function createHeartbeatBuffer(message: HeartbeatMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(message.trajectoryDoneFlag == true ? 1 : 0, 6, 1);
    buffer.writeUInt8(heartbeat_procedureResultMapFliped[message.procedureResult] & 0xff, 5);
    buffer.writeUInt8(heartbeat_axisStateMapFliped[message.axisState] & 0xff, 4);
    buffer.writeUInt32LE(heartbeat_axisErrorMapFliped[message.axisError] & 0xffffffff, 0);
    return buffer;
}
export interface EstopMessage {
    id: 2;
}
export function parseEstop(data: Buffer): Omit<EstopMessage, "id"> {
    return {};
}
export function createEstopBuffer(message: EstopMessage): Buffer {
    const buffer = Buffer.alloc(0);
    return buffer;
}
export function sendEstop(can: RawChannel, node_id: number, message: EstopMessage) {
    can.send({
        data: createEstopBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 2
    });
}
export interface GetErrorMessage {
    disarmReason: "NONE" | "INITIALIZING" | "SYSTEM_LEVEL" | "TIMING_ERROR" | "MISSING_ESTIMATE" | "BAD_CONFIG" | "DRV_FAULT" | "MISSING_INPUT" | "DC_BUS_OVER_VOLTAGE" | "DC_BUS_UNDER_VOLTAGE" | "DC_BUS_OVER_CURRENT" | "DC_BUS_OVER_REGEN_CURRENT" | "CURRENT_LIMIT_VIOLATION" | "MOTOR_OVER_TEMP" | "INVERTER_OVER_TEMP" | "VELOCITY_LIMIT_VIOLATION" | "POSITION_LIMIT_VIOLATION" | "WATCHDOG_TIMER_EXPIRED" | "ESTOP_REQUESTED" | "SPINOUT_DETECTED" | "BRAKE_RESISTOR_DISARMED" | "THERMISTOR_DISCONNECTED" | "CALIBRATION_ERROR";
    activeErrors: "NONE" | "INITIALIZING" | "SYSTEM_LEVEL" | "TIMING_ERROR" | "MISSING_ESTIMATE" | "BAD_CONFIG" | "DRV_FAULT" | "MISSING_INPUT" | "DC_BUS_OVER_VOLTAGE" | "DC_BUS_UNDER_VOLTAGE" | "DC_BUS_OVER_CURRENT" | "DC_BUS_OVER_REGEN_CURRENT" | "CURRENT_LIMIT_VIOLATION" | "MOTOR_OVER_TEMP" | "INVERTER_OVER_TEMP" | "VELOCITY_LIMIT_VIOLATION" | "POSITION_LIMIT_VIOLATION" | "WATCHDOG_TIMER_EXPIRED" | "ESTOP_REQUESTED" | "SPINOUT_DETECTED" | "BRAKE_RESISTOR_DISARMED" | "THERMISTOR_DISCONNECTED" | "CALIBRATION_ERROR";
    id: 3;
}
const getError_disarmReasonMap = {
    0: "NONE",
    1: "INITIALIZING",
    2: "SYSTEM_LEVEL",
    4: "TIMING_ERROR",
    8: "MISSING_ESTIMATE",
    16: "BAD_CONFIG",
    32: "DRV_FAULT",
    64: "MISSING_INPUT",
    256: "DC_BUS_OVER_VOLTAGE",
    512: "DC_BUS_UNDER_VOLTAGE",
    1024: "DC_BUS_OVER_CURRENT",
    2048: "DC_BUS_OVER_REGEN_CURRENT",
    4096: "CURRENT_LIMIT_VIOLATION",
    8192: "MOTOR_OVER_TEMP",
    16384: "INVERTER_OVER_TEMP",
    32768: "VELOCITY_LIMIT_VIOLATION",
    65536: "POSITION_LIMIT_VIOLATION",
    16777216: "WATCHDOG_TIMER_EXPIRED",
    33554432: "ESTOP_REQUESTED",
    67108864: "SPINOUT_DETECTED",
    134217728: "BRAKE_RESISTOR_DISARMED",
    268435456: "THERMISTOR_DISCONNECTED",
    1073741824: "CALIBRATION_ERROR"
} as Record<number, GetErrorMessage["disarmReason"]>;
const getError_disarmReasonMapFliped = {
    "NONE": 0,
    "INITIALIZING": 1,
    "SYSTEM_LEVEL": 2,
    "TIMING_ERROR": 4,
    "MISSING_ESTIMATE": 8,
    "BAD_CONFIG": 16,
    "DRV_FAULT": 32,
    "MISSING_INPUT": 64,
    "DC_BUS_OVER_VOLTAGE": 256,
    "DC_BUS_UNDER_VOLTAGE": 512,
    "DC_BUS_OVER_CURRENT": 1024,
    "DC_BUS_OVER_REGEN_CURRENT": 2048,
    "CURRENT_LIMIT_VIOLATION": 4096,
    "MOTOR_OVER_TEMP": 8192,
    "INVERTER_OVER_TEMP": 16384,
    "VELOCITY_LIMIT_VIOLATION": 32768,
    "POSITION_LIMIT_VIOLATION": 65536,
    "WATCHDOG_TIMER_EXPIRED": 16777216,
    "ESTOP_REQUESTED": 33554432,
    "SPINOUT_DETECTED": 67108864,
    "BRAKE_RESISTOR_DISARMED": 134217728,
    "THERMISTOR_DISCONNECTED": 268435456,
    "CALIBRATION_ERROR": 1073741824
} as Record<GetErrorMessage["disarmReason"], number>;
const getError_activeErrorsMap = {
    0: "NONE",
    1: "INITIALIZING",
    2: "SYSTEM_LEVEL",
    4: "TIMING_ERROR",
    8: "MISSING_ESTIMATE",
    16: "BAD_CONFIG",
    32: "DRV_FAULT",
    64: "MISSING_INPUT",
    256: "DC_BUS_OVER_VOLTAGE",
    512: "DC_BUS_UNDER_VOLTAGE",
    1024: "DC_BUS_OVER_CURRENT",
    2048: "DC_BUS_OVER_REGEN_CURRENT",
    4096: "CURRENT_LIMIT_VIOLATION",
    8192: "MOTOR_OVER_TEMP",
    16384: "INVERTER_OVER_TEMP",
    32768: "VELOCITY_LIMIT_VIOLATION",
    65536: "POSITION_LIMIT_VIOLATION",
    16777216: "WATCHDOG_TIMER_EXPIRED",
    33554432: "ESTOP_REQUESTED",
    67108864: "SPINOUT_DETECTED",
    134217728: "BRAKE_RESISTOR_DISARMED",
    268435456: "THERMISTOR_DISCONNECTED",
    1073741824: "CALIBRATION_ERROR"
} as Record<number, GetErrorMessage["activeErrors"]>;
const getError_activeErrorsMapFliped = {
    "NONE": 0,
    "INITIALIZING": 1,
    "SYSTEM_LEVEL": 2,
    "TIMING_ERROR": 4,
    "MISSING_ESTIMATE": 8,
    "BAD_CONFIG": 16,
    "DRV_FAULT": 32,
    "MISSING_INPUT": 64,
    "DC_BUS_OVER_VOLTAGE": 256,
    "DC_BUS_UNDER_VOLTAGE": 512,
    "DC_BUS_OVER_CURRENT": 1024,
    "DC_BUS_OVER_REGEN_CURRENT": 2048,
    "CURRENT_LIMIT_VIOLATION": 4096,
    "MOTOR_OVER_TEMP": 8192,
    "INVERTER_OVER_TEMP": 16384,
    "VELOCITY_LIMIT_VIOLATION": 32768,
    "POSITION_LIMIT_VIOLATION": 65536,
    "WATCHDOG_TIMER_EXPIRED": 16777216,
    "ESTOP_REQUESTED": 33554432,
    "SPINOUT_DETECTED": 67108864,
    "BRAKE_RESISTOR_DISARMED": 134217728,
    "THERMISTOR_DISCONNECTED": 268435456,
    "CALIBRATION_ERROR": 1073741824
} as Record<GetErrorMessage["activeErrors"], number>;
export function parseGetError(data: Buffer): Omit<GetErrorMessage, "id"> {
    return {
        disarmReason: getError_disarmReasonMap[data.readUInt32LE(4) & 0xffffffff],
        activeErrors: getError_activeErrorsMap[data.readUInt32LE(0) & 0xffffffff]
    };
}
export function createGetErrorBuffer(message: GetErrorMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(getError_disarmReasonMapFliped[message.disarmReason] & 0xffffffff, 4);
    buffer.writeUInt32LE(getError_activeErrorsMapFliped[message.activeErrors] & 0xffffffff, 0);
    return buffer;
}
export interface RxSdoMessage {
    value: number;
    reserved: number;
    opcode: "READ" | "WRITE";
    id: 4;
}
const rxsdo_opcodeMap = {
    0: "READ",
    1: "WRITE"
} as Record<number, RxSdoMessage["opcode"]>;
const rxsdo_opcodeMapFliped = {
    "READ": 0,
    "WRITE": 1
} as Record<RxSdoMessage["opcode"], number>;
export function parseRxSdo(data: Buffer): Omit<RxSdoMessage, "id"> {
    return {
        value: data.readUInt32LE(4) & 0xffffffff,
        reserved: data.readUInt8(3) & 0xff,
        opcode: rxsdo_opcodeMap[data.readUInt8(0) & 0xff]
    };
}
export function createRxSdoBuffer(message: RxSdoMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value & 0xffffffff, 4);
    buffer.writeUInt8(message.reserved & 0xff, 3);
    buffer.writeUInt8(rxsdo_opcodeMapFliped[message.opcode] & 0xff, 0);
    return buffer;
}
export function sendRxSdo(can: RawChannel, node_id: number, message: RxSdoMessage) {
    can.send({
        data: createRxSdoBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 4
    });
}
export interface TxSdoMessage {
    value: number;
    reserved1: number;
    reserved0: number;
    id: 5;
}
export function parseTxSdo(data: Buffer): Omit<TxSdoMessage, "id"> {
    return {
        value: data.readUInt32LE(4) & 0xffffffff,
        reserved1: data.readUInt8(3) & 0xff,
        reserved0: data.readUInt8(0) & 0xff
    };
}
export function createTxSdoBuffer(message: TxSdoMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value & 0xffffffff, 4);
    buffer.writeUInt8(message.reserved1 & 0xff, 3);
    buffer.writeUInt8(message.reserved0 & 0xff, 0);
    return buffer;
}
export interface AddressMessage {
    serialNumber: number;
    nodeId: number;
    id: 6;
}
export function parseAddress(data: Buffer): Omit<AddressMessage, "id"> {
    return {
        serialNumber: data.readUIntLE(1, 6) & 0xffffffffffff,
        nodeId: data.readUInt8(0) & 0xff
    };
}
export function createAddressBuffer(message: AddressMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(message.serialNumber & 0xffffffffffff, 1, 6);
    buffer.writeUInt8(message.nodeId & 0xff, 0);
    return buffer;
}
export function sendAddress(can: RawChannel, node_id: number, message: AddressMessage) {
    can.send({
        data: createAddressBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 6
    });
}
export interface SetAxisStateMessage {
    axisRequestedState: "UNDEFINED" | "IDLE" | "STARTUP_SEQUENCE" | "FULL_CALIBRATION_SEQUENCE" | "MOTOR_CALIBRATION" | "ENCODER_INDEX_SEARCH" | "ENCODER_OFFSET_CALIBRATION" | "CLOSED_LOOP_CONTROL" | "LOCKIN_SPIN" | "ENCODER_DIR_FIND" | "HOMING" | "ENCODER_HALL_POLARITY_CALIBRATION" | "ENCODER_HALL_PHASE_CALIBRATION" | "ANTICOGGING_CALIBRATION" | "SENSORLESS_CONTROL";
    id: 7;
}
const setAxisState_axisRequestedStateMap = {
    0: "UNDEFINED",
    1: "IDLE",
    2: "STARTUP_SEQUENCE",
    3: "FULL_CALIBRATION_SEQUENCE",
    4: "MOTOR_CALIBRATION",
    6: "ENCODER_INDEX_SEARCH",
    7: "ENCODER_OFFSET_CALIBRATION",
    8: "CLOSED_LOOP_CONTROL",
    9: "LOCKIN_SPIN",
    10: "ENCODER_DIR_FIND",
    11: "HOMING",
    12: "ENCODER_HALL_POLARITY_CALIBRATION",
    13: "ENCODER_HALL_PHASE_CALIBRATION",
    14: "ANTICOGGING_CALIBRATION",
    5: "SENSORLESS_CONTROL"
} as Record<number, SetAxisStateMessage["axisRequestedState"]>;
const setAxisState_axisRequestedStateMapFliped = {
    "UNDEFINED": 0,
    "IDLE": 1,
    "STARTUP_SEQUENCE": 2,
    "FULL_CALIBRATION_SEQUENCE": 3,
    "MOTOR_CALIBRATION": 4,
    "ENCODER_INDEX_SEARCH": 6,
    "ENCODER_OFFSET_CALIBRATION": 7,
    "CLOSED_LOOP_CONTROL": 8,
    "LOCKIN_SPIN": 9,
    "ENCODER_DIR_FIND": 10,
    "HOMING": 11,
    "ENCODER_HALL_POLARITY_CALIBRATION": 12,
    "ENCODER_HALL_PHASE_CALIBRATION": 13,
    "ANTICOGGING_CALIBRATION": 14,
    "SENSORLESS_CONTROL": 5
} as Record<SetAxisStateMessage["axisRequestedState"], number>;
export function parseSetAxisState(data: Buffer): Omit<SetAxisStateMessage, "id"> {
    return {
        axisRequestedState: setAxisState_axisRequestedStateMap[data.readUInt32LE(0) & 0xffffffff]
    };
}
export function createSetAxisStateBuffer(message: SetAxisStateMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(setAxisState_axisRequestedStateMapFliped[message.axisRequestedState] & 0xffffffff, 0);
    return buffer;
}
export function sendSetAxisState(can: RawChannel, node_id: number, message: SetAxisStateMessage) {
    can.send({
        data: createSetAxisStateBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 7
    });
}
export interface GetEncoderEstimatesMessage {
    velEstimate: number;
    posEstimate: number;
    id: 9;
}
export function parseGetEncoderEstimates(data: Buffer): Omit<GetEncoderEstimatesMessage, "id"> {
    return {
        velEstimate: data.readFloatLE(4) & 0xffffffff,
        posEstimate: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetEncoderEstimatesBuffer(message: GetEncoderEstimatesMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.velEstimate & 0xffffffff, 4);
    buffer.writeFloatLE(message.posEstimate & 0xffffffff, 0);
    return buffer;
}
export interface SetControllerModeMessage {
    inputMode: "INACTIVE" | "PASSTHROUGH" | "VEL_RAMP" | "POS_FILTER" | "MIX_CHANNELS" | "TRAP_TRAJ" | "TORQUE_RAMP" | "MIRROR" | "TUNING";
    controlMode: "VOLTAGE_CONTROL" | "TORQUE_CONTROL" | "VELOCITY_CONTROL" | "POSITION_CONTROL";
    id: 11;
}
const setControllerMode_inputModeMap = {
    0: "INACTIVE",
    1: "PASSTHROUGH",
    2: "VEL_RAMP",
    3: "POS_FILTER",
    4: "MIX_CHANNELS",
    5: "TRAP_TRAJ",
    6: "TORQUE_RAMP",
    7: "MIRROR",
    8: "TUNING"
} as Record<number, SetControllerModeMessage["inputMode"]>;
const setControllerMode_inputModeMapFliped = {
    "INACTIVE": 0,
    "PASSTHROUGH": 1,
    "VEL_RAMP": 2,
    "POS_FILTER": 3,
    "MIX_CHANNELS": 4,
    "TRAP_TRAJ": 5,
    "TORQUE_RAMP": 6,
    "MIRROR": 7,
    "TUNING": 8
} as Record<SetControllerModeMessage["inputMode"], number>;
const setControllerMode_controlModeMap = {
    0: "VOLTAGE_CONTROL",
    1: "TORQUE_CONTROL",
    2: "VELOCITY_CONTROL",
    3: "POSITION_CONTROL"
} as Record<number, SetControllerModeMessage["controlMode"]>;
const setControllerMode_controlModeMapFliped = {
    "VOLTAGE_CONTROL": 0,
    "TORQUE_CONTROL": 1,
    "VELOCITY_CONTROL": 2,
    "POSITION_CONTROL": 3
} as Record<SetControllerModeMessage["controlMode"], number>;
export function parseSetControllerMode(data: Buffer): Omit<SetControllerModeMessage, "id"> {
    return {
        inputMode: setControllerMode_inputModeMap[data.readUInt32LE(4) & 0xffffffff],
        controlMode: setControllerMode_controlModeMap[data.readUInt32LE(0) & 0xffffffff]
    };
}
export function createSetControllerModeBuffer(message: SetControllerModeMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(setControllerMode_inputModeMapFliped[message.inputMode] & 0xffffffff, 4);
    buffer.writeUInt32LE(setControllerMode_controlModeMapFliped[message.controlMode] & 0xffffffff, 0);
    return buffer;
}
export function sendSetControllerMode(can: RawChannel, node_id: number, message: SetControllerModeMessage) {
    can.send({
        data: createSetControllerModeBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 11
    });
}
export interface SetInputPosMessage {
    torqueFf: number;
    velFf: number;
    inputPos: number;
    id: 12;
}
export function parseSetInputPos(data: Buffer): Omit<SetInputPosMessage, "id"> {
    return {
        torqueFf: data.readInt16LE(6) & 0xffff,
        velFf: data.readInt16LE(4) & 0xffff,
        inputPos: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetInputPosBuffer(message: SetInputPosMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeInt16LE(message.torqueFf & 0xffff, 6);
    buffer.writeInt16LE(message.velFf & 0xffff, 4);
    buffer.writeFloatLE(message.inputPos & 0xffffffff, 0);
    return buffer;
}
export function sendSetInputPos(can: RawChannel, node_id: number, message: SetInputPosMessage) {
    can.send({
        data: createSetInputPosBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 12
    });
}
export interface SetInputVelMessage {
    inputTorqueFf: number;
    inputVel: number;
    id: 13;
}
export function parseSetInputVel(data: Buffer): Omit<SetInputVelMessage, "id"> {
    return {
        inputTorqueFf: data.readFloatLE(4) & 0xffffffff,
        inputVel: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetInputVelBuffer(message: SetInputVelMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.inputTorqueFf & 0xffffffff, 4);
    buffer.writeFloatLE(message.inputVel & 0xffffffff, 0);
    return buffer;
}
export function sendSetInputVel(can: RawChannel, node_id: number, message: SetInputVelMessage) {
    can.send({
        data: createSetInputVelBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 13
    });
}
export interface SetInputTorqueMessage {
    inputTorque: number;
    id: 14;
}
export function parseSetInputTorque(data: Buffer): Omit<SetInputTorqueMessage, "id"> {
    return {
        inputTorque: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetInputTorqueBuffer(message: SetInputTorqueMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.inputTorque & 0xffffffff, 0);
    return buffer;
}
export function sendSetInputTorque(can: RawChannel, node_id: number, message: SetInputTorqueMessage) {
    can.send({
        data: createSetInputTorqueBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 14
    });
}
export interface SetLimitsMessage {
    currentLimit: number;
    velocityLimit: number;
    id: 15;
}
export function parseSetLimits(data: Buffer): Omit<SetLimitsMessage, "id"> {
    return {
        currentLimit: data.readFloatLE(4) & 0xffffffff,
        velocityLimit: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetLimitsBuffer(message: SetLimitsMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.currentLimit & 0xffffffff, 4);
    buffer.writeFloatLE(message.velocityLimit & 0xffffffff, 0);
    return buffer;
}
export function sendSetLimits(can: RawChannel, node_id: number, message: SetLimitsMessage) {
    can.send({
        data: createSetLimitsBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 15
    });
}
export interface SetTrajVelLimitMessage {
    trajVelLimit: number;
    id: 17;
}
export function parseSetTrajVelLimit(data: Buffer): Omit<SetTrajVelLimitMessage, "id"> {
    return {
        trajVelLimit: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetTrajVelLimitBuffer(message: SetTrajVelLimitMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajVelLimit & 0xffffffff, 0);
    return buffer;
}
export function sendSetTrajVelLimit(can: RawChannel, node_id: number, message: SetTrajVelLimitMessage) {
    can.send({
        data: createSetTrajVelLimitBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 17
    });
}
export interface SetTrajAccelLimitsMessage {
    trajDecelLimit: number;
    trajAccelLimit: number;
    id: 18;
}
export function parseSetTrajAccelLimits(data: Buffer): Omit<SetTrajAccelLimitsMessage, "id"> {
    return {
        trajDecelLimit: data.readFloatLE(4) & 0xffffffff,
        trajAccelLimit: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetTrajAccelLimitsBuffer(message: SetTrajAccelLimitsMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajDecelLimit & 0xffffffff, 4);
    buffer.writeFloatLE(message.trajAccelLimit & 0xffffffff, 0);
    return buffer;
}
export function sendSetTrajAccelLimits(can: RawChannel, node_id: number, message: SetTrajAccelLimitsMessage) {
    can.send({
        data: createSetTrajAccelLimitsBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 18
    });
}
export interface SetTrajInertiaMessage {
    trajInertia: number;
    id: 19;
}
export function parseSetTrajInertia(data: Buffer): Omit<SetTrajInertiaMessage, "id"> {
    return {
        trajInertia: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetTrajInertiaBuffer(message: SetTrajInertiaMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajInertia & 0xffffffff, 0);
    return buffer;
}
export function sendSetTrajInertia(can: RawChannel, node_id: number, message: SetTrajInertiaMessage) {
    can.send({
        data: createSetTrajInertiaBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 19
    });
}
export interface GetIqMessage {
    iqMeasured: number;
    iqSetpoint: number;
    id: 20;
}
export function parseGetIq(data: Buffer): Omit<GetIqMessage, "id"> {
    return {
        iqMeasured: data.readFloatLE(4) & 0xffffffff,
        iqSetpoint: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetIqBuffer(message: GetIqMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.iqMeasured & 0xffffffff, 4);
    buffer.writeFloatLE(message.iqSetpoint & 0xffffffff, 0);
    return buffer;
}
export interface GetTemperatureMessage {
    motorTemperature: number;
    fetTemperature: number;
    id: 21;
}
export function parseGetTemperature(data: Buffer): Omit<GetTemperatureMessage, "id"> {
    return {
        motorTemperature: data.readFloatLE(4) & 0xffffffff,
        fetTemperature: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetTemperatureBuffer(message: GetTemperatureMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.motorTemperature & 0xffffffff, 4);
    buffer.writeFloatLE(message.fetTemperature & 0xffffffff, 0);
    return buffer;
}
export interface RebootMessage {
    action: "reboot" | "save_configuration" | "erase_configuration" | "enter_dfu_mode";
    id: 22;
}
const reboot_actionMap = {
    0: "reboot",
    1: "save_configuration",
    2: "erase_configuration",
    3: "enter_dfu_mode"
} as Record<number, RebootMessage["action"]>;
const reboot_actionMapFliped = {
    "reboot": 0,
    "save_configuration": 1,
    "erase_configuration": 2,
    "enter_dfu_mode": 3
} as Record<RebootMessage["action"], number>;
export function parseReboot(data: Buffer): Omit<RebootMessage, "id"> {
    return {
        action: reboot_actionMap[data.readUInt8(0) & 0xff]
    };
}
export function createRebootBuffer(message: RebootMessage): Buffer {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(reboot_actionMapFliped[message.action] & 0xff, 0);
    return buffer;
}
export function sendReboot(can: RawChannel, node_id: number, message: RebootMessage) {
    can.send({
        data: createRebootBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 22
    });
}
export interface GetBusVoltageCurrentMessage {
    busCurrent: number;
    busVoltage: number;
    id: 23;
}
export function parseGetBusVoltageCurrent(data: Buffer): Omit<GetBusVoltageCurrentMessage, "id"> {
    return {
        busCurrent: data.readFloatLE(4) & 0xffffffff,
        busVoltage: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetBusVoltageCurrentBuffer(message: GetBusVoltageCurrentMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.busCurrent & 0xffffffff, 4);
    buffer.writeFloatLE(message.busVoltage & 0xffffffff, 0);
    return buffer;
}
export interface ClearErrorsMessage {
    identify: number;
    id: 24;
}
export function parseClearErrors(data: Buffer): Omit<ClearErrorsMessage, "id"> {
    return {
        identify: data.readUInt8(0) & 0xff
    };
}
export function createClearErrorsBuffer(message: ClearErrorsMessage): Buffer {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(message.identify & 0xff, 0);
    return buffer;
}
export function sendClearErrors(can: RawChannel, node_id: number, message: ClearErrorsMessage) {
    can.send({
        data: createClearErrorsBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 24
    });
}
export interface SetAbsolutePositionMessage {
    position: number;
    id: 25;
}
export function parseSetAbsolutePosition(data: Buffer): Omit<SetAbsolutePositionMessage, "id"> {
    return {
        position: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetAbsolutePositionBuffer(message: SetAbsolutePositionMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.position & 0xffffffff, 0);
    return buffer;
}
export function sendSetAbsolutePosition(can: RawChannel, node_id: number, message: SetAbsolutePositionMessage) {
    can.send({
        data: createSetAbsolutePositionBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 25
    });
}
export interface SetPosGainMessage {
    posGain: number;
    id: 26;
}
export function parseSetPosGain(data: Buffer): Omit<SetPosGainMessage, "id"> {
    return {
        posGain: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetPosGainBuffer(message: SetPosGainMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.posGain & 0xffffffff, 0);
    return buffer;
}
export function sendSetPosGain(can: RawChannel, node_id: number, message: SetPosGainMessage) {
    can.send({
        data: createSetPosGainBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 26
    });
}
export interface SetVelGainsMessage {
    velIntegratorGain: number;
    velGain: number;
    id: 27;
}
export function parseSetVelGains(data: Buffer): Omit<SetVelGainsMessage, "id"> {
    return {
        velIntegratorGain: data.readFloatLE(4) & 0xffffffff,
        velGain: data.readFloatLE(0) & 0xffffffff
    };
}
export function createSetVelGainsBuffer(message: SetVelGainsMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.velIntegratorGain & 0xffffffff, 4);
    buffer.writeFloatLE(message.velGain & 0xffffffff, 0);
    return buffer;
}
export function sendSetVelGains(can: RawChannel, node_id: number, message: SetVelGainsMessage) {
    can.send({
        data: createSetVelGainsBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 27
    });
}
export interface GetTorquesMessage {
    torqueEstimate: number;
    torqueTarget: number;
    id: 28;
}
export function parseGetTorques(data: Buffer): Omit<GetTorquesMessage, "id"> {
    return {
        torqueEstimate: data.readFloatLE(4) & 0xffffffff,
        torqueTarget: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetTorquesBuffer(message: GetTorquesMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.torqueEstimate & 0xffffffff, 4);
    buffer.writeFloatLE(message.torqueTarget & 0xffffffff, 0);
    return buffer;
}
export interface GetPowersMessage {
    mechanicalPower: number;
    electricalPower: number;
    id: 29;
}
export function parseGetPowers(data: Buffer): Omit<GetPowersMessage, "id"> {
    return {
        mechanicalPower: data.readFloatLE(4) & 0xffffffff,
        electricalPower: data.readFloatLE(0) & 0xffffffff
    };
}
export function createGetPowersBuffer(message: GetPowersMessage): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.mechanicalPower & 0xffffffff, 4);
    buffer.writeFloatLE(message.electricalPower & 0xffffffff, 0);
    return buffer;
}
export interface EnterDFUModeMessage {
    id: 31;
}
export function parseEnterDFUMode(data: Buffer): Omit<EnterDFUModeMessage, "id"> {
    return {};
}
export function createEnterDFUModeBuffer(message: EnterDFUModeMessage): Buffer {
    const buffer = Buffer.alloc(0);
    return buffer;
}
export function sendEnterDFUMode(can: RawChannel, node_id: number, message: EnterDFUModeMessage) {
    can.send({
        data: createEnterDFUModeBuffer(message),
        ext: false,
        rtr: false,
        id: node_id << 5 | 31
    });
}
export const inboundPackets = {
    0: parseGetVersion,
    1: parseHeartbeat,
    3: parseGetError,
    5: parseTxSdo,
    9: parseGetEncoderEstimates,
    20: parseGetIq,
    21: parseGetTemperature,
    23: parseGetBusVoltageCurrent,
    28: parseGetTorques,
    29: parseGetPowers
};
export const inboundPackets = {
    2: parseEstop,
    4: parseRxSdo,
    6: parseAddress,
    7: parseSetAxisState,
    11: parseSetControllerMode,
    12: parseSetInputPos,
    13: parseSetInputVel,
    14: parseSetInputTorque,
    15: parseSetLimits,
    17: parseSetTrajVelLimit,
    18: parseSetTrajAccelLimits,
    19: parseSetTrajInertia,
    22: parseReboot,
    24: parseClearErrors,
    25: parseSetAbsolutePosition,
    26: parseSetPosGain,
    27: parseSetVelGains,
    31: parseEnterDFUMode
};
