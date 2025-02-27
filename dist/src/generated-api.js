"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outboundPacketsMap = exports.inboundPacketsMap = exports.Packets = void 0;
exports.parseGetVersion = parseGetVersion;
exports.createGetVersionBuffer = createGetVersionBuffer;
exports.parseHeartbeat = parseHeartbeat;
exports.createHeartbeatBuffer = createHeartbeatBuffer;
exports.parseEstop = parseEstop;
exports.createEstopBuffer = createEstopBuffer;
exports.parseGetError = parseGetError;
exports.createGetErrorBuffer = createGetErrorBuffer;
exports.parseRxSdo = parseRxSdo;
exports.createRxSdoBuffer = createRxSdoBuffer;
exports.parseTxSdo = parseTxSdo;
exports.createTxSdoBuffer = createTxSdoBuffer;
exports.parseAddress = parseAddress;
exports.createAddressBuffer = createAddressBuffer;
exports.parseSetAxisState = parseSetAxisState;
exports.createSetAxisStateBuffer = createSetAxisStateBuffer;
exports.parseGetEncoderEstimates = parseGetEncoderEstimates;
exports.createGetEncoderEstimatesBuffer = createGetEncoderEstimatesBuffer;
exports.parseSetControllerMode = parseSetControllerMode;
exports.createSetControllerModeBuffer = createSetControllerModeBuffer;
exports.parseSetInputPos = parseSetInputPos;
exports.createSetInputPosBuffer = createSetInputPosBuffer;
exports.parseSetInputVel = parseSetInputVel;
exports.createSetInputVelBuffer = createSetInputVelBuffer;
exports.parseSetInputTorque = parseSetInputTorque;
exports.createSetInputTorqueBuffer = createSetInputTorqueBuffer;
exports.parseSetLimits = parseSetLimits;
exports.createSetLimitsBuffer = createSetLimitsBuffer;
exports.parseSetTrajVelLimit = parseSetTrajVelLimit;
exports.createSetTrajVelLimitBuffer = createSetTrajVelLimitBuffer;
exports.parseSetTrajAccelLimits = parseSetTrajAccelLimits;
exports.createSetTrajAccelLimitsBuffer = createSetTrajAccelLimitsBuffer;
exports.parseSetTrajInertia = parseSetTrajInertia;
exports.createSetTrajInertiaBuffer = createSetTrajInertiaBuffer;
exports.parseGetIq = parseGetIq;
exports.createGetIqBuffer = createGetIqBuffer;
exports.parseGetTemperature = parseGetTemperature;
exports.createGetTemperatureBuffer = createGetTemperatureBuffer;
exports.parseReboot = parseReboot;
exports.createRebootBuffer = createRebootBuffer;
exports.parseGetBusVoltageCurrent = parseGetBusVoltageCurrent;
exports.createGetBusVoltageCurrentBuffer = createGetBusVoltageCurrentBuffer;
exports.parseClearErrors = parseClearErrors;
exports.createClearErrorsBuffer = createClearErrorsBuffer;
exports.parseSetAbsolutePosition = parseSetAbsolutePosition;
exports.createSetAbsolutePositionBuffer = createSetAbsolutePositionBuffer;
exports.parseSetPosGain = parseSetPosGain;
exports.createSetPosGainBuffer = createSetPosGainBuffer;
exports.parseSetVelGains = parseSetVelGains;
exports.createSetVelGainsBuffer = createSetVelGainsBuffer;
exports.parseGetTorques = parseGetTorques;
exports.createGetTorquesBuffer = createGetTorquesBuffer;
exports.parseGetPowers = parseGetPowers;
exports.createGetPowersBuffer = createGetPowersBuffer;
exports.parseEnterDFUMode = parseEnterDFUMode;
exports.createEnterDFUModeBuffer = createEnterDFUModeBuffer;
exports.apiFunctions = apiFunctions;
const odrive_api_1 = require("./api-generator/odrive-api");
function parseGetVersion(data) {
    return {
        fwVersionUnreleased: data.readUInt8(7),
        fwVersionRevision: data.readUInt8(6),
        fwVersionMinor: data.readUInt8(5),
        fwVersionMajor: data.readUInt8(4),
        hwVersionVariant: data.readUInt8(3),
        hwVersionMinor: data.readUInt8(2),
        hwVersionMajor: data.readUInt8(1),
        protocolVersion: data.readUInt8(0)
    };
}
function createGetVersionBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(message.fwVersionUnreleased, 7);
    buffer.writeUInt8(message.fwVersionRevision, 6);
    buffer.writeUInt8(message.fwVersionMinor, 5);
    buffer.writeUInt8(message.fwVersionMajor, 4);
    buffer.writeUInt8(message.hwVersionVariant, 3);
    buffer.writeUInt8(message.hwVersionMinor, 2);
    buffer.writeUInt8(message.hwVersionMajor, 1);
    buffer.writeUInt8(message.protocolVersion, 0);
    return buffer;
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
};
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
};
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
};
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
};
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
};
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
};
function parseHeartbeat(data) {
    return {
        trajectoryDoneFlag: (data.readUIntLE(6, 1) & 0x1) == 1,
        procedureResult: heartbeat_procedureResultMap[data.readUInt8(5)],
        axisState: heartbeat_axisStateMap[data.readUInt8(4)],
        axisError: heartbeat_axisErrorMap[data.readUInt32LE(0)]
    };
}
function createHeartbeatBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(message.trajectoryDoneFlag ? 1 : 0, 6, 1);
    buffer.writeUInt8(heartbeat_procedureResultMapFliped[message.procedureResult], 5);
    buffer.writeUInt8(heartbeat_axisStateMapFliped[message.axisState], 4);
    buffer.writeUInt32LE(heartbeat_axisErrorMapFliped[message.axisError], 0);
    return buffer;
}
function parseEstop(data) {
    return {};
}
function createEstopBuffer(message) {
    const buffer = Buffer.alloc(0);
    return buffer;
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
};
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
};
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
};
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
};
function parseGetError(data) {
    return {
        disarmReason: getError_disarmReasonMap[data.readUInt32LE(4)],
        activeErrors: getError_activeErrorsMap[data.readUInt32LE(0)]
    };
}
function createGetErrorBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(getError_disarmReasonMapFliped[message.disarmReason], 4);
    buffer.writeUInt32LE(getError_activeErrorsMapFliped[message.activeErrors], 0);
    return buffer;
}
const rxsdo_opcodeMap = {
    0: "READ",
    1: "WRITE"
};
const rxsdo_opcodeMapFliped = {
    "READ": 0,
    "WRITE": 1
};
function parseRxSdo(data) {
    return {
        value: data.readUInt32LE(4),
        reserved: data.readUInt8(3),
        endpointId: data.readUInt16LE(1),
        opcode: rxsdo_opcodeMap[data.readUInt8(0)]
    };
}
function createRxSdoBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value, 4);
    buffer.writeUInt8(message.reserved, 3);
    buffer.writeUInt16LE(message.endpointId, 1);
    buffer.writeUInt8(rxsdo_opcodeMapFliped[message.opcode], 0);
    return buffer;
}
function parseTxSdo(data) {
    return {
        value: data.readUInt32LE(4),
        reserved1: data.readUInt8(3),
        endpointId: data.readUInt16LE(1),
        reserved0: data.readUInt8(0)
    };
}
function createTxSdoBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value, 4);
    buffer.writeUInt8(message.reserved1, 3);
    buffer.writeUInt16LE(message.endpointId, 1);
    buffer.writeUInt8(message.reserved0, 0);
    return buffer;
}
function parseAddress(data) {
    return {
        serialNumber: data.readUIntLE(1, 6) & 0xffffffffffff,
        nodeId: data.readUInt8(0)
    };
}
function createAddressBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(message.serialNumber & 0xffffffffffff, 1, 6);
    buffer.writeUInt8(message.nodeId, 0);
    return buffer;
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
};
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
};
function parseSetAxisState(data) {
    return {
        axisRequestedState: setAxisState_axisRequestedStateMap[data.readUInt32LE(0)]
    };
}
function createSetAxisStateBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(setAxisState_axisRequestedStateMapFliped[message.axisRequestedState], 0);
    return buffer;
}
function parseGetEncoderEstimates(data) {
    return {
        velEstimate: data.readFloatLE(4),
        posEstimate: data.readFloatLE(0)
    };
}
function createGetEncoderEstimatesBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.velEstimate, 4);
    buffer.writeFloatLE(message.posEstimate, 0);
    return buffer;
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
};
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
};
const setControllerMode_controlModeMap = {
    0: "VOLTAGE_CONTROL",
    1: "TORQUE_CONTROL",
    2: "VELOCITY_CONTROL",
    3: "POSITION_CONTROL"
};
const setControllerMode_controlModeMapFliped = {
    "VOLTAGE_CONTROL": 0,
    "TORQUE_CONTROL": 1,
    "VELOCITY_CONTROL": 2,
    "POSITION_CONTROL": 3
};
function parseSetControllerMode(data) {
    return {
        inputMode: setControllerMode_inputModeMap[data.readUInt32LE(4)],
        controlMode: setControllerMode_controlModeMap[data.readUInt32LE(0)]
    };
}
function createSetControllerModeBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(setControllerMode_inputModeMapFliped[message.inputMode], 4);
    buffer.writeUInt32LE(setControllerMode_controlModeMapFliped[message.controlMode], 0);
    return buffer;
}
function parseSetInputPos(data) {
    return {
        torqueFf: data.readInt16LE(6),
        velFf: data.readInt16LE(4),
        inputPos: data.readFloatLE(0)
    };
}
function createSetInputPosBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeInt16LE(message.torqueFf, 6);
    buffer.writeInt16LE(message.velFf, 4);
    buffer.writeFloatLE(message.inputPos, 0);
    return buffer;
}
function parseSetInputVel(data) {
    return {
        inputTorqueFf: data.readFloatLE(4),
        inputVel: data.readFloatLE(0)
    };
}
function createSetInputVelBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.inputTorqueFf, 4);
    buffer.writeFloatLE(message.inputVel, 0);
    return buffer;
}
function parseSetInputTorque(data) {
    return {
        inputTorque: data.readFloatLE(0)
    };
}
function createSetInputTorqueBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.inputTorque, 0);
    return buffer;
}
function parseSetLimits(data) {
    return {
        currentLimit: data.readFloatLE(4),
        velocityLimit: data.readFloatLE(0)
    };
}
function createSetLimitsBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.currentLimit, 4);
    buffer.writeFloatLE(message.velocityLimit, 0);
    return buffer;
}
function parseSetTrajVelLimit(data) {
    return {
        trajVelLimit: data.readFloatLE(0)
    };
}
function createSetTrajVelLimitBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajVelLimit, 0);
    return buffer;
}
function parseSetTrajAccelLimits(data) {
    return {
        trajDecelLimit: data.readFloatLE(4),
        trajAccelLimit: data.readFloatLE(0)
    };
}
function createSetTrajAccelLimitsBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajDecelLimit, 4);
    buffer.writeFloatLE(message.trajAccelLimit, 0);
    return buffer;
}
function parseSetTrajInertia(data) {
    return {
        trajInertia: data.readFloatLE(0)
    };
}
function createSetTrajInertiaBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.trajInertia, 0);
    return buffer;
}
function parseGetIq(data) {
    return {
        iqMeasured: data.readFloatLE(4),
        iqSetpoint: data.readFloatLE(0)
    };
}
function createGetIqBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.iqMeasured, 4);
    buffer.writeFloatLE(message.iqSetpoint, 0);
    return buffer;
}
function parseGetTemperature(data) {
    return {
        motorTemperature: data.readFloatLE(4),
        fetTemperature: data.readFloatLE(0)
    };
}
function createGetTemperatureBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.motorTemperature, 4);
    buffer.writeFloatLE(message.fetTemperature, 0);
    return buffer;
}
const reboot_actionMap = {
    0: "reboot",
    1: "save_configuration",
    2: "erase_configuration",
    3: "enter_dfu_mode"
};
const reboot_actionMapFliped = {
    "reboot": 0,
    "save_configuration": 1,
    "erase_configuration": 2,
    "enter_dfu_mode": 3
};
function parseReboot(data) {
    return {
        action: reboot_actionMap[data.readUInt8(0)]
    };
}
function createRebootBuffer(message) {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(reboot_actionMapFliped[message.action], 0);
    return buffer;
}
function parseGetBusVoltageCurrent(data) {
    return {
        busCurrent: data.readFloatLE(4),
        busVoltage: data.readFloatLE(0)
    };
}
function createGetBusVoltageCurrentBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.busCurrent, 4);
    buffer.writeFloatLE(message.busVoltage, 0);
    return buffer;
}
function parseClearErrors(data) {
    return {
        identify: data.readUInt8(0)
    };
}
function createClearErrorsBuffer(message) {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(message.identify, 0);
    return buffer;
}
function parseSetAbsolutePosition(data) {
    return {
        position: data.readFloatLE(0)
    };
}
function createSetAbsolutePositionBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.position, 0);
    return buffer;
}
function parseSetPosGain(data) {
    return {
        posGain: data.readFloatLE(0)
    };
}
function createSetPosGainBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.posGain, 0);
    return buffer;
}
function parseSetVelGains(data) {
    return {
        velIntegratorGain: data.readFloatLE(4),
        velGain: data.readFloatLE(0)
    };
}
function createSetVelGainsBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.velIntegratorGain, 4);
    buffer.writeFloatLE(message.velGain, 0);
    return buffer;
}
function parseGetTorques(data) {
    return {
        torqueEstimate: data.readFloatLE(4),
        torqueTarget: data.readFloatLE(0)
    };
}
function createGetTorquesBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.torqueEstimate, 4);
    buffer.writeFloatLE(message.torqueTarget, 0);
    return buffer;
}
function parseGetPowers(data) {
    return {
        mechanicalPower: data.readFloatLE(4),
        electricalPower: data.readFloatLE(0)
    };
}
function createGetPowersBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeFloatLE(message.mechanicalPower, 4);
    buffer.writeFloatLE(message.electricalPower, 0);
    return buffer;
}
function parseEnterDFUMode(data) {
    return {};
}
function createEnterDFUModeBuffer(message) {
    const buffer = Buffer.alloc(0);
    return buffer;
}
var Packets;
(function (Packets) {
    Packets[Packets["GetVersion"] = 0] = "GetVersion";
    Packets[Packets["Heartbeat"] = 1] = "Heartbeat";
    Packets[Packets["Estop"] = 2] = "Estop";
    Packets[Packets["GetError"] = 3] = "GetError";
    Packets[Packets["RxSdo"] = 4] = "RxSdo";
    Packets[Packets["TxSdo"] = 5] = "TxSdo";
    Packets[Packets["Address"] = 6] = "Address";
    Packets[Packets["SetAxisState"] = 7] = "SetAxisState";
    Packets[Packets["GetEncoderEstimates"] = 9] = "GetEncoderEstimates";
    Packets[Packets["SetControllerMode"] = 11] = "SetControllerMode";
    Packets[Packets["SetInputPos"] = 12] = "SetInputPos";
    Packets[Packets["SetInputVel"] = 13] = "SetInputVel";
    Packets[Packets["SetInputTorque"] = 14] = "SetInputTorque";
    Packets[Packets["SetLimits"] = 15] = "SetLimits";
    Packets[Packets["SetTrajVelLimit"] = 17] = "SetTrajVelLimit";
    Packets[Packets["SetTrajAccelLimits"] = 18] = "SetTrajAccelLimits";
    Packets[Packets["SetTrajInertia"] = 19] = "SetTrajInertia";
    Packets[Packets["GetIq"] = 20] = "GetIq";
    Packets[Packets["GetTemperature"] = 21] = "GetTemperature";
    Packets[Packets["Reboot"] = 22] = "Reboot";
    Packets[Packets["GetBusVoltageCurrent"] = 23] = "GetBusVoltageCurrent";
    Packets[Packets["ClearErrors"] = 24] = "ClearErrors";
    Packets[Packets["SetAbsolutePosition"] = 25] = "SetAbsolutePosition";
    Packets[Packets["SetPosGain"] = 26] = "SetPosGain";
    Packets[Packets["SetVelGains"] = 27] = "SetVelGains";
    Packets[Packets["GetTorques"] = 28] = "GetTorques";
    Packets[Packets["GetPowers"] = 29] = "GetPowers";
    Packets[Packets["EnterDFUMode"] = 31] = "EnterDFUMode";
})(Packets || (exports.Packets = Packets = {}));
exports.inboundPacketsMap = {
    [Packets.GetVersion]: parseGetVersion,
    [Packets.Heartbeat]: parseHeartbeat,
    [Packets.Estop]: parseEstop,
    [Packets.GetError]: parseGetError,
    [Packets.RxSdo]: parseRxSdo,
    [Packets.TxSdo]: parseTxSdo,
    [Packets.Address]: parseAddress,
    [Packets.SetAxisState]: parseSetAxisState,
    [Packets.GetEncoderEstimates]: parseGetEncoderEstimates,
    [Packets.SetControllerMode]: parseSetControllerMode,
    [Packets.SetInputPos]: parseSetInputPos,
    [Packets.SetInputVel]: parseSetInputVel,
    [Packets.SetInputTorque]: parseSetInputTorque,
    [Packets.SetLimits]: parseSetLimits,
    [Packets.SetTrajVelLimit]: parseSetTrajVelLimit,
    [Packets.SetTrajAccelLimits]: parseSetTrajAccelLimits,
    [Packets.SetTrajInertia]: parseSetTrajInertia,
    [Packets.GetIq]: parseGetIq,
    [Packets.GetTemperature]: parseGetTemperature,
    [Packets.Reboot]: parseReboot,
    [Packets.GetBusVoltageCurrent]: parseGetBusVoltageCurrent,
    [Packets.ClearErrors]: parseClearErrors,
    [Packets.SetAbsolutePosition]: parseSetAbsolutePosition,
    [Packets.SetPosGain]: parseSetPosGain,
    [Packets.SetVelGains]: parseSetVelGains,
    [Packets.GetTorques]: parseGetTorques,
    [Packets.GetPowers]: parseGetPowers,
    [Packets.EnterDFUMode]: parseEnterDFUMode
};
exports.outboundPacketsMap = {
    [Packets.GetVersion]: createGetVersionBuffer,
    [Packets.Heartbeat]: createHeartbeatBuffer,
    [Packets.Estop]: createEstopBuffer,
    [Packets.GetError]: createGetErrorBuffer,
    [Packets.RxSdo]: createRxSdoBuffer,
    [Packets.TxSdo]: createTxSdoBuffer,
    [Packets.Address]: createAddressBuffer,
    [Packets.SetAxisState]: createSetAxisStateBuffer,
    [Packets.GetEncoderEstimates]: createGetEncoderEstimatesBuffer,
    [Packets.SetControllerMode]: createSetControllerModeBuffer,
    [Packets.SetInputPos]: createSetInputPosBuffer,
    [Packets.SetInputVel]: createSetInputVelBuffer,
    [Packets.SetInputTorque]: createSetInputTorqueBuffer,
    [Packets.SetLimits]: createSetLimitsBuffer,
    [Packets.SetTrajVelLimit]: createSetTrajVelLimitBuffer,
    [Packets.SetTrajAccelLimits]: createSetTrajAccelLimitsBuffer,
    [Packets.SetTrajInertia]: createSetTrajInertiaBuffer,
    [Packets.GetIq]: createGetIqBuffer,
    [Packets.GetTemperature]: createGetTemperatureBuffer,
    [Packets.Reboot]: createRebootBuffer,
    [Packets.GetBusVoltageCurrent]: createGetBusVoltageCurrentBuffer,
    [Packets.ClearErrors]: createClearErrorsBuffer,
    [Packets.SetAbsolutePosition]: createSetAbsolutePositionBuffer,
    [Packets.SetPosGain]: createSetPosGainBuffer,
    [Packets.SetVelGains]: createSetVelGainsBuffer,
    [Packets.GetTorques]: createGetTorquesBuffer,
    [Packets.GetPowers]: createGetPowersBuffer,
    [Packets.EnterDFUMode]: createEnterDFUModeBuffer
};
const endpointIdMap = {
    "vbus_voltage": { "id": 1, "type": "float" },
    "ibus": { "id": 2, "type": "float" },
    "ibus_report_filter_k": { "id": 3, "type": "float" },
    "control_loop_hz": { "id": 4, "type": "uint" },
    "serial_number": { "id": 5, "type": "uint" },
    "hw_version_major": { "id": 6, "type": "uint" },
    "hw_version_minor": { "id": 7, "type": "uint" },
    "hw_version_variant": { "id": 8, "type": "uint" },
    "hw_version_revision": { "id": 9, "type": "uint" },
    "fw_version_major": { "id": 10, "type": "uint" },
    "fw_version_minor": { "id": 11, "type": "uint" },
    "fw_version_revision": { "id": 12, "type": "uint" },
    "commit_hash": { "id": 13, "type": "uint" },
    "fw_version_unreleased": { "id": 14, "type": "uint" },
    "bootloader_version": { "id": 15, "type": "uint" },
    "n_evt_sampling": { "id": 16, "type": "uint" },
    "n_evt_control_loop": { "id": 17, "type": "uint" },
    "task_timers_armed": { "id": 18, "type": "boolean" },
    "task_times.sampling.start_time": { "id": 19, "type": "uint" },
    "task_times.sampling.end_time": { "id": 20, "type": "uint" },
    "task_times.sampling.length": { "id": 21, "type": "uint" },
    "task_times.sampling.max_length": { "id": 22, "type": "uint" },
    "task_times.encoder_update.start_time": { "id": 23, "type": "uint" },
    "task_times.encoder_update.end_time": { "id": 24, "type": "uint" },
    "task_times.encoder_update.length": { "id": 25, "type": "uint" },
    "task_times.encoder_update.max_length": { "id": 26, "type": "uint" },
    "task_times.control_loop_misc.start_time": { "id": 27, "type": "uint" },
    "task_times.control_loop_misc.end_time": { "id": 28, "type": "uint" },
    "task_times.control_loop_misc.length": { "id": 29, "type": "uint" },
    "task_times.control_loop_misc.max_length": { "id": 30, "type": "uint" },
    "task_times.control_loop_checks.start_time": { "id": 31, "type": "uint" },
    "task_times.control_loop_checks.end_time": { "id": 32, "type": "uint" },
    "task_times.control_loop_checks.length": { "id": 33, "type": "uint" },
    "task_times.control_loop_checks.max_length": { "id": 34, "type": "uint" },
    "task_times.current_sense_wait.start_time": { "id": 35, "type": "uint" },
    "task_times.current_sense_wait.end_time": { "id": 36, "type": "uint" },
    "task_times.current_sense_wait.length": { "id": 37, "type": "uint" },
    "task_times.current_sense_wait.max_length": { "id": 38, "type": "uint" },
    "task_times.dc_calib_wait.start_time": { "id": 39, "type": "uint" },
    "task_times.dc_calib_wait.end_time": { "id": 40, "type": "uint" },
    "task_times.dc_calib_wait.length": { "id": 41, "type": "uint" },
    "task_times.dc_calib_wait.max_length": { "id": 42, "type": "uint" },
    "system_stats.uptime": { "id": 43, "type": "uint" },
    "system_stats.min_heap_space": { "id": 44, "type": "uint" },
    "system_stats.max_stack_usage_axis": { "id": 45, "type": "uint" },
    "system_stats.max_stack_usage_comms": { "id": 46, "type": "uint" },
    "system_stats.max_stack_usage_uart": { "id": 47, "type": "uint" },
    "system_stats.max_stack_usage_startup": { "id": 48, "type": "uint" },
    "system_stats.stack_size_axis": { "id": 49, "type": "uint" },
    "system_stats.stack_size_comms": { "id": 50, "type": "uint" },
    "system_stats.stack_size_uart": { "id": 51, "type": "uint" },
    "system_stats.stack_size_startup": { "id": 52, "type": "uint" },
    "system_stats.prio_axis": { "id": 53, "type": "int" },
    "system_stats.prio_comms": { "id": 54, "type": "int" },
    "system_stats.prio_uart": { "id": 55, "type": "int" },
    "system_stats.prio_startup": { "id": 56, "type": "int" },
    "system_stats.usb.rx_cnt": { "id": 57, "type": "uint" },
    "system_stats.usb.tx_cnt": { "id": 58, "type": "uint" },
    "system_stats.usb.tx_overrun_cnt": { "id": 59, "type": "uint" },
    "system_stats.i2c.addr": { "id": 60, "type": "uint" },
    "system_stats.i2c.addr_match_cnt": { "id": 61, "type": "uint" },
    "system_stats.i2c.rx_cnt": { "id": 62, "type": "uint" },
    "system_stats.i2c.error_cnt": { "id": 63, "type": "uint" },
    "user_config_loaded": { "id": 64, "type": "uint" },
    "misconfigured": { "id": 65, "type": "boolean" },
    "oscilloscope.size": { "id": 66, "type": "uint" },
    "oscilloscope.pos": { "id": 67, "type": "uint" },
    "oscilloscope.rollover": { "id": 68, "type": "boolean" },
    "oscilloscope.recording": { "id": 69, "type": "boolean" },
    "debug.hal_ticks": { "id": 89, "type": "uint" },
    "can.error": { "id": 92, "type": "uint" },
    "can.n_restarts": { "id": 93, "type": "uint" },
    "can.n_rx": { "id": 94, "type": "uint" },
    "can.config.baud_rate": { "id": 95, "type": "uint" },
    "can.config.data_baud_rate": { "id": 96, "type": "uint" },
    "can.config.tx_brs": { "id": 97, "type": "uint" },
    "can.config.protocol": { "id": 98, "type": "uint" },
    "test_property": { "id": 99, "type": "uint" },
    "identify": { "id": 100, "type": "boolean" },
    "reboot_required": { "id": 101, "type": "boolean" },
    "issues.length": { "id": 102, "type": "uint" },
    "config.enable_uart_a": { "id": 137, "type": "boolean" },
    "config.uart_a_baudrate": { "id": 138, "type": "uint" },
    "config.usb_cdc_protocol": { "id": 139, "type": "uint" },
    "config.uart0_protocol": { "id": 140, "type": "uint" },
    "config.max_regen_current": { "id": 141, "type": "float" },
    "config.dc_bus_undervoltage_trip_level": { "id": 142, "type": "float" },
    "config.dc_bus_overvoltage_trip_level": { "id": 143, "type": "float" },
    "config.dc_max_positive_current": { "id": 144, "type": "float" },
    "config.dc_max_negative_current": { "id": 145, "type": "float" },
    "config.user_config_0": { "id": 146, "type": "uint" },
    "config.user_config_1": { "id": 147, "type": "uint" },
    "config.user_config_2": { "id": 148, "type": "uint" },
    "config.user_config_3": { "id": 149, "type": "uint" },
    "config.user_config_4": { "id": 150, "type": "uint" },
    "config.user_config_5": { "id": 151, "type": "uint" },
    "config.user_config_6": { "id": 152, "type": "uint" },
    "config.user_config_7": { "id": 153, "type": "uint" },
    "config.gpio0_mode": { "id": 154, "type": "uint" },
    "config.gpio1_mode": { "id": 155, "type": "uint" },
    "config.gpio2_mode": { "id": 156, "type": "uint" },
    "config.gpio3_mode": { "id": 157, "type": "uint" },
    "config.gpio4_mode": { "id": 158, "type": "uint" },
    "config.gpio5_mode": { "id": 159, "type": "uint" },
    "config.gpio6_mode": { "id": 160, "type": "uint" },
    "config.gpio7_mode": { "id": 161, "type": "uint" },
    "config.gpio5_analog_mapping.min": { "id": 163, "type": "float" },
    "config.gpio5_analog_mapping.max": { "id": 164, "type": "float" },
    "config.gpio6_analog_mapping.min": { "id": 166, "type": "float" },
    "config.gpio6_analog_mapping.max": { "id": 167, "type": "float" },
    "config.inverter0.current_soft_max": { "id": 168, "type": "float" },
    "config.inverter0.current_hard_max": { "id": 169, "type": "float" },
    "config.inverter0.temp_limit_lower": { "id": 170, "type": "float" },
    "config.inverter0.temp_limit_upper": { "id": 171, "type": "float" },
    "config.inverter0.mod_magn_max": { "id": 172, "type": "float" },
    "config.inverter0.shunt_conductance": { "id": 173, "type": "float" },
    "config.inverter0.drv_config": { "id": 174, "type": "uint" },
    "axis0.active_errors": { "id": 175, "type": "uint" },
    "axis0.disarm_reason": { "id": 176, "type": "uint" },
    "axis0.step_dir_active": { "id": 177, "type": "boolean" },
    "axis0.last_drv_fault": { "id": 178, "type": "uint" },
    "axis0.steps": { "id": 179, "type": "int" },
    "axis0.current_state": { "id": 180, "type": "uint" },
    "axis0.requested_state": { "id": 181, "type": "uint" },
    "axis0.pos_estimate": { "id": 182, "type": "float" },
    "axis0.vel_estimate": { "id": 183, "type": "float" },
    "axis0.is_homed": { "id": 184, "type": "boolean" },
    "axis0.config.startup_max_wait_for_ready": { "id": 185, "type": "float" },
    "axis0.config.startup_motor_calibration": { "id": 186, "type": "boolean" },
    "axis0.config.startup_encoder_index_search": { "id": 187, "type": "boolean" },
    "axis0.config.startup_encoder_offset_calibration": { "id": 188, "type": "boolean" },
    "axis0.config.startup_closed_loop_control": { "id": 189, "type": "boolean" },
    "axis0.config.startup_homing": { "id": 190, "type": "boolean" },
    "axis0.config.init_torque": { "id": 191, "type": "float" },
    "axis0.config.init_vel": { "id": 192, "type": "float" },
    "axis0.config.init_pos": { "id": 193, "type": "float" },
    "axis0.config.enable_step_dir": { "id": 194, "type": "boolean" },
    "axis0.config.step_dir_always_on": { "id": 195, "type": "boolean" },
    "axis0.config.calib_range": { "id": 196, "type": "float" },
    "axis0.config.calib_scan_distance": { "id": 197, "type": "float" },
    "axis0.config.calib_scan_vel": { "id": 198, "type": "float" },
    "axis0.config.index_search_at_target_vel_only": { "id": 199, "type": "boolean" },
    "axis0.config.watchdog_timeout": { "id": 200, "type": "float" },
    "axis0.config.enable_watchdog": { "id": 201, "type": "boolean" },
    "axis0.config.step_gpio_pin": { "id": 202, "type": "uint" },
    "axis0.config.dir_gpio_pin": { "id": 203, "type": "uint" },
    "axis0.config.error_gpio_pin": { "id": 204, "type": "uint" },
    "axis0.config.enable_error_gpio": { "id": 205, "type": "boolean" },
    "axis0.config.calibration_lockin.current": { "id": 206, "type": "float" },
    "axis0.config.calibration_lockin.ramp_time": { "id": 207, "type": "float" },
    "axis0.config.calibration_lockin.ramp_distance": { "id": 208, "type": "float" },
    "axis0.config.calibration_lockin.accel": { "id": 209, "type": "float" },
    "axis0.config.calibration_lockin.vel": { "id": 210, "type": "float" },
    "axis0.config.sensorless_ramp.initial_pos": { "id": 211, "type": "float" },
    "axis0.config.sensorless_ramp.current": { "id": 212, "type": "float" },
    "axis0.config.sensorless_ramp.ramp_time": { "id": 213, "type": "float" },
    "axis0.config.sensorless_ramp.ramp_distance": { "id": 214, "type": "float" },
    "axis0.config.sensorless_ramp.accel": { "id": 215, "type": "float" },
    "axis0.config.sensorless_ramp.vel": { "id": 216, "type": "float" },
    "axis0.config.sensorless_ramp.finish_distance": { "id": 217, "type": "float" },
    "axis0.config.sensorless_ramp.finish_on_vel": { "id": 218, "type": "boolean" },
    "axis0.config.sensorless_ramp.finish_on_distance": { "id": 219, "type": "boolean" },
    "axis0.config.general_lockin.initial_pos": { "id": 220, "type": "float" },
    "axis0.config.general_lockin.current": { "id": 221, "type": "float" },
    "axis0.config.general_lockin.ramp_time": { "id": 222, "type": "float" },
    "axis0.config.general_lockin.ramp_distance": { "id": 223, "type": "float" },
    "axis0.config.general_lockin.accel": { "id": 224, "type": "float" },
    "axis0.config.general_lockin.vel": { "id": 225, "type": "float" },
    "axis0.config.general_lockin.finish_distance": { "id": 226, "type": "float" },
    "axis0.config.general_lockin.finish_on_vel": { "id": 227, "type": "boolean" },
    "axis0.config.general_lockin.finish_on_distance": { "id": 228, "type": "boolean" },
    "axis0.config.can.node_id": { "id": 229, "type": "uint" },
    "axis0.config.can.version_msg_rate_ms": { "id": 230, "type": "uint" },
    "axis0.config.can.heartbeat_msg_rate_ms": { "id": 231, "type": "uint" },
    "axis0.config.can.encoder_msg_rate_ms": { "id": 232, "type": "uint" },
    "axis0.config.can.iq_msg_rate_ms": { "id": 233, "type": "uint" },
    "axis0.config.can.error_msg_rate_ms": { "id": 234, "type": "uint" },
    "axis0.config.can.temperature_msg_rate_ms": { "id": 235, "type": "uint" },
    "axis0.config.can.bus_voltage_msg_rate_ms": { "id": 236, "type": "uint" },
    "axis0.config.can.torques_msg_rate_ms": { "id": 237, "type": "uint" },
    "axis0.config.can.powers_msg_rate_ms": { "id": 238, "type": "uint" },
    "axis0.config.can.input_vel_scale": { "id": 239, "type": "uint" },
    "axis0.config.can.input_torque_scale": { "id": 240, "type": "uint" },
    "axis0.config.load_encoder": { "id": 241, "type": "uint" },
    "axis0.config.commutation_encoder": { "id": 242, "type": "uint" },
    "axis0.config.encoder_bandwidth": { "id": 243, "type": "float" },
    "axis0.config.commutation_encoder_bandwidth": { "id": 244, "type": "float" },
    "axis0.config.I_bus_hard_min": { "id": 245, "type": "float" },
    "axis0.config.I_bus_hard_max": { "id": 246, "type": "float" },
    "axis0.config.I_bus_soft_min": { "id": 247, "type": "float" },
    "axis0.config.I_bus_soft_max": { "id": 248, "type": "float" },
    "axis0.config.P_bus_soft_min": { "id": 249, "type": "float" },
    "axis0.config.P_bus_soft_max": { "id": 250, "type": "float" },
    "axis0.config.torque_soft_min": { "id": 251, "type": "float" },
    "axis0.config.torque_soft_max": { "id": 252, "type": "float" },
    "axis0.config.motor.motor_type": { "id": 253, "type": "uint" },
    "axis0.config.motor.pole_pairs": { "id": 254, "type": "uint" },
    "axis0.config.motor.phase_resistance": { "id": 255, "type": "float" },
    "axis0.config.motor.phase_inductance": { "id": 256, "type": "float" },
    "axis0.config.motor.phase_resistance_valid": { "id": 257, "type": "boolean" },
    "axis0.config.motor.phase_inductance_valid": { "id": 258, "type": "boolean" },
    "axis0.config.motor.torque_constant": { "id": 259, "type": "float" },
    "axis0.config.motor.direction": { "id": 260, "type": "float" },
    "axis0.config.motor.current_control_bandwidth": { "id": 261, "type": "float" },
    "axis0.config.motor.wL_FF_enable": { "id": 262, "type": "boolean" },
    "axis0.config.motor.bEMF_FF_enable": { "id": 263, "type": "boolean" },
    "axis0.config.motor.ff_pm_flux_linkage": { "id": 264, "type": "float" },
    "axis0.config.motor.ff_pm_flux_linkage_valid": { "id": 265, "type": "boolean" },
    "axis0.config.motor.motor_model_l_d": { "id": 266, "type": "float" },
    "axis0.config.motor.motor_model_l_q": { "id": 267, "type": "float" },
    "axis0.config.motor.motor_model_l_dq_valid": { "id": 268, "type": "boolean" },
    "axis0.config.motor.calibration_current": { "id": 269, "type": "float" },
    "axis0.config.motor.resistance_calib_max_voltage": { "id": 270, "type": "float" },
    "axis0.config.motor.current_soft_max": { "id": 271, "type": "float" },
    "axis0.config.motor.current_hard_max": { "id": 272, "type": "float" },
    "axis0.config.motor.current_slew_rate_limit": { "id": 273, "type": "float" },
    "axis0.config.motor.fw_enable": { "id": 274, "type": "boolean" },
    "axis0.config.motor.fw_mod_setpoint": { "id": 275, "type": "float" },
    "axis0.config.motor.fw_fb_bandwidth": { "id": 276, "type": "float" },
    "axis0.config.motor.acim_gain_min_flux": { "id": 277, "type": "float" },
    "axis0.config.motor.acim_autoflux_enable": { "id": 278, "type": "boolean" },
    "axis0.config.motor.acim_autoflux_min_Id": { "id": 279, "type": "float" },
    "axis0.config.motor.acim_autoflux_attack_gain": { "id": 280, "type": "float" },
    "axis0.config.motor.acim_autoflux_decay_gain": { "id": 281, "type": "float" },
    "axis0.config.motor.acim_nominal_slip_vel": { "id": 282, "type": "float" },
    "axis0.config.motor.sensorless_observer_gain": { "id": 283, "type": "float" },
    "axis0.config.motor.sensorless_pll_bandwidth": { "id": 284, "type": "float" },
    "axis0.config.motor.sensorless_pm_flux_linkage": { "id": 285, "type": "float" },
    "axis0.config.motor.sensorless_pm_flux_linkage_valid": { "id": 286, "type": "boolean" },
    "axis0.config.motor.power_torque_report_filter_bandwidth": { "id": 287, "type": "float" },
    "axis0.config.anticogging.enabled": { "id": 288, "type": "boolean" },
    "axis0.config.anticogging.max_torque": { "id": 289, "type": "float" },
    "axis0.config.anticogging.calib_start_vel": { "id": 290, "type": "float" },
    "axis0.config.anticogging.calib_end_vel": { "id": 291, "type": "float" },
    "axis0.config.anticogging.calib_coarse_tuning_duration": { "id": 292, "type": "float" },
    "axis0.config.anticogging.calib_fine_tuning_duration": { "id": 293, "type": "float" },
    "axis0.config.anticogging.calib_fine_dist_scale": { "id": 294, "type": "float" },
    "axis0.config.anticogging.calib_coarse_integrator_gain": { "id": 295, "type": "float" },
    "axis0.config.anticogging.calib_bidirectional": { "id": 296, "type": "boolean" },
    "axis0.motor.alpha_beta_controller.current_meas_phA": { "id": 303, "type": "float" },
    "axis0.motor.alpha_beta_controller.current_meas_phB": { "id": 304, "type": "float" },
    "axis0.motor.alpha_beta_controller.current_meas_phC": { "id": 305, "type": "float" },
    "axis0.motor.alpha_beta_controller.current_meas_status_phA": { "id": 306, "type": "uint" },
    "axis0.motor.alpha_beta_controller.current_meas_status_phB": { "id": 307, "type": "uint" },
    "axis0.motor.alpha_beta_controller.current_meas_status_phC": { "id": 308, "type": "uint" },
    "axis0.motor.alpha_beta_controller.I_bus": { "id": 309, "type": "float" },
    "axis0.motor.alpha_beta_controller.Ialpha_measured": { "id": 310, "type": "float" },
    "axis0.motor.alpha_beta_controller.Ibeta_measured": { "id": 311, "type": "float" },
    "axis0.motor.alpha_beta_controller.max_measurable_current": { "id": 312, "type": "float" },
    "axis0.motor.alpha_beta_controller.power": { "id": 313, "type": "float" },
    "axis0.motor.alpha_beta_controller.n_evt_current_measurement": { "id": 314, "type": "uint" },
    "axis0.motor.alpha_beta_controller.n_evt_pwm_update": { "id": 315, "type": "uint" },
    "axis0.motor.foc.p_gain": { "id": 316, "type": "float" },
    "axis0.motor.foc.i_gain": { "id": 317, "type": "float" },
    "axis0.motor.foc.I_measured_report_filter_k": { "id": 318, "type": "float" },
    "axis0.motor.foc.Id_setpoint": { "id": 319, "type": "float" },
    "axis0.motor.foc.Iq_setpoint": { "id": 320, "type": "float" },
    "axis0.motor.foc.Vd_setpoint": { "id": 321, "type": "float" },
    "axis0.motor.foc.Vq_setpoint": { "id": 322, "type": "float" },
    "axis0.motor.foc.phase": { "id": 323, "type": "float" },
    "axis0.motor.foc.phase_vel": { "id": 324, "type": "float" },
    "axis0.motor.foc.Id_measured": { "id": 325, "type": "float" },
    "axis0.motor.foc.Iq_measured": { "id": 326, "type": "float" },
    "axis0.motor.foc.v_current_control_integral_d": { "id": 327, "type": "float" },
    "axis0.motor.foc.v_current_control_integral_q": { "id": 328, "type": "float" },
    "axis0.motor.foc.mod_d": { "id": 329, "type": "float" },
    "axis0.motor.foc.mod_q": { "id": 330, "type": "float" },
    "axis0.motor.foc.final_v_alpha": { "id": 331, "type": "float" },
    "axis0.motor.foc.final_v_beta": { "id": 332, "type": "float" },
    "axis0.motor.fet_thermistor.temperature": { "id": 333, "type": "float" },
    "axis0.motor.motor_thermistor.temperature": { "id": 334, "type": "float" },
    "axis0.motor.motor_thermistor.config.gpio_pin": { "id": 335, "type": "uint" },
    "axis0.motor.motor_thermistor.config.r_ref": { "id": 336, "type": "float" },
    "axis0.motor.motor_thermistor.config.t_ref": { "id": 337, "type": "float" },
    "axis0.motor.motor_thermistor.config.beta": { "id": 338, "type": "float" },
    "axis0.motor.motor_thermistor.config.temp_limit_lower": { "id": 339, "type": "float" },
    "axis0.motor.motor_thermistor.config.temp_limit_upper": { "id": 340, "type": "float" },
    "axis0.motor.motor_thermistor.config.enabled": { "id": 341, "type": "boolean" },
    "axis0.motor.acim_estimator.rotor_flux": { "id": 342, "type": "float" },
    "axis0.motor.acim_estimator.slip_vel": { "id": 343, "type": "float" },
    "axis0.motor.acim_estimator.phase_offset": { "id": 344, "type": "float" },
    "axis0.motor.acim_estimator.stator_phase_vel": { "id": 345, "type": "float" },
    "axis0.motor.acim_estimator.stator_phase": { "id": 346, "type": "float" },
    "axis0.motor.sensorless_estimator.phase": { "id": 347, "type": "float" },
    "axis0.motor.sensorless_estimator.pll_pos": { "id": 348, "type": "float" },
    "axis0.motor.sensorless_estimator.phase_vel": { "id": 349, "type": "float" },
    "axis0.motor.torque_estimate": { "id": 350, "type": "float" },
    "axis0.motor.mechanical_power": { "id": 351, "type": "float" },
    "axis0.motor.electrical_power": { "id": 352, "type": "float" },
    "axis0.motor.loss_power": { "id": 353, "type": "float" },
    "axis0.motor.effective_current_lim": { "id": 354, "type": "float" },
    "axis0.motor.resistance_calibration_I_beta": { "id": 355, "type": "float" },
    "axis0.motor.input_id": { "id": 356, "type": "float" },
    "axis0.motor.input_iq": { "id": 357, "type": "float" },
    "axis0.motor.dc_calib.a_0": { "id": 358, "type": "float" },
    "axis0.motor.dc_calib.b_0": { "id": 359, "type": "float" },
    "axis0.motor.dc_calib.c_0": { "id": 360, "type": "float" },
    "axis0.motor.dc_calib.a_1": { "id": 361, "type": "float" },
    "axis0.motor.dc_calib.b_1": { "id": 362, "type": "float" },
    "axis0.motor.dc_calib.c_1": { "id": 363, "type": "float" },
    "axis0.motor.dc_calib.a_2": { "id": 364, "type": "float" },
    "axis0.motor.dc_calib.b_2": { "id": 365, "type": "float" },
    "axis0.motor.dc_calib.c_2": { "id": 366, "type": "float" },
    "axis0.controller.input_pos": { "id": 367, "type": "float" },
    "axis0.controller.input_vel": { "id": 368, "type": "float" },
    "axis0.controller.input_torque": { "id": 369, "type": "float" },
    "axis0.controller.pos_setpoint": { "id": 370, "type": "float" },
    "axis0.controller.vel_setpoint": { "id": 371, "type": "float" },
    "axis0.controller.torque_setpoint": { "id": 372, "type": "float" },
    "axis0.controller.effective_torque_setpoint": { "id": 373, "type": "float" },
    "axis0.controller.trajectory_done": { "id": 374, "type": "boolean" },
    "axis0.controller.vel_integrator_torque": { "id": 375, "type": "float" },
    "axis0.controller.autotuning_phase": { "id": 376, "type": "float" },
    "axis0.controller.config.enable_vel_limit": { "id": 377, "type": "boolean" },
    "axis0.controller.config.enable_torque_mode_vel_limit": { "id": 378, "type": "boolean" },
    "axis0.controller.config.enable_gain_scheduling": { "id": 379, "type": "boolean" },
    "axis0.controller.config.gain_scheduling_width": { "id": 380, "type": "float" },
    "axis0.controller.config.enable_overspeed_error": { "id": 381, "type": "boolean" },
    "axis0.controller.config.control_mode": { "id": 382, "type": "uint" },
    "axis0.controller.config.input_mode": { "id": 383, "type": "uint" },
    "axis0.controller.config.pos_gain": { "id": 384, "type": "float" },
    "axis0.controller.config.vel_gain": { "id": 385, "type": "float" },
    "axis0.controller.config.vel_integrator_gain": { "id": 386, "type": "float" },
    "axis0.controller.config.vel_integrator_limit": { "id": 387, "type": "float" },
    "axis0.controller.config.vel_limit": { "id": 388, "type": "float" },
    "axis0.controller.config.vel_limit_tolerance": { "id": 389, "type": "float" },
    "axis0.controller.config.vel_ramp_rate": { "id": 390, "type": "float" },
    "axis0.controller.config.torque_ramp_rate": { "id": 391, "type": "float" },
    "axis0.controller.config.circular_setpoints": { "id": 392, "type": "boolean" },
    "axis0.controller.config.circular_setpoint_range": { "id": 393, "type": "float" },
    "axis0.controller.config.absolute_setpoints": { "id": 394, "type": "boolean" },
    "axis0.controller.config.use_commutation_vel": { "id": 395, "type": "boolean" },
    "axis0.controller.config.use_load_encoder_for_commutation_vel": { "id": 396, "type": "boolean" },
    "axis0.controller.config.commutation_vel_scale": { "id": 397, "type": "float" },
    "axis0.controller.config.steps_per_circular_range": { "id": 398, "type": "int" },
    "axis0.controller.config.homing_speed": { "id": 399, "type": "float" },
    "axis0.controller.config.inertia": { "id": 400, "type": "float" },
    "axis0.controller.config.input_filter_bandwidth": { "id": 401, "type": "float" },
    "axis0.controller.config.spinout_mechanical_power_bandwidth": { "id": 402, "type": "float" },
    "axis0.controller.config.spinout_electrical_power_bandwidth": { "id": 403, "type": "float" },
    "axis0.controller.config.spinout_mechanical_power_threshold": { "id": 404, "type": "float" },
    "axis0.controller.config.spinout_electrical_power_threshold": { "id": 405, "type": "float" },
    "axis0.controller.autotuning.frequency": { "id": 406, "type": "float" },
    "axis0.controller.autotuning.pos_amplitude": { "id": 407, "type": "float" },
    "axis0.controller.autotuning.vel_amplitude": { "id": 408, "type": "float" },
    "axis0.controller.autotuning.torque_amplitude": { "id": 409, "type": "float" },
    "axis0.controller.autotuning.vel_burst_factor": { "id": 410, "type": "uint" },
    "axis0.controller.spinout_mechanical_power": { "id": 411, "type": "float" },
    "axis0.controller.spinout_electrical_power": { "id": 412, "type": "float" },
    "axis0.trap_traj.config.vel_limit": { "id": 416, "type": "float" },
    "axis0.trap_traj.config.accel_limit": { "id": 417, "type": "float" },
    "axis0.trap_traj.config.decel_limit": { "id": 418, "type": "float" },
    "axis0.min_endstop.state": { "id": 419, "type": "boolean" },
    "axis0.min_endstop.config.gpio_num": { "id": 420, "type": "uint" },
    "axis0.min_endstop.config.enabled": { "id": 421, "type": "boolean" },
    "axis0.min_endstop.config.offset": { "id": 422, "type": "float" },
    "axis0.min_endstop.config.is_active_high": { "id": 423, "type": "boolean" },
    "axis0.min_endstop.config.debounce_ms": { "id": 424, "type": "uint" },
    "axis0.max_endstop.state": { "id": 425, "type": "boolean" },
    "axis0.max_endstop.config.gpio_num": { "id": 426, "type": "uint" },
    "axis0.max_endstop.config.enabled": { "id": 427, "type": "boolean" },
    "axis0.max_endstop.config.offset": { "id": 428, "type": "float" },
    "axis0.max_endstop.config.is_active_high": { "id": 429, "type": "boolean" },
    "axis0.max_endstop.config.debounce_ms": { "id": 430, "type": "uint" },
    "axis0.enable_pin.state": { "id": 431, "type": "boolean" },
    "axis0.enable_pin.config.gpio_num": { "id": 432, "type": "uint" },
    "axis0.enable_pin.config.enabled": { "id": 433, "type": "boolean" },
    "axis0.enable_pin.config.offset": { "id": 434, "type": "float" },
    "axis0.enable_pin.config.is_active_high": { "id": 435, "type": "boolean" },
    "axis0.enable_pin.config.debounce_ms": { "id": 436, "type": "uint" },
    "axis0.mechanical_brake.config.gpio_num": { "id": 437, "type": "uint" },
    "axis0.mechanical_brake.config.is_active_low": { "id": 438, "type": "boolean" },
    "axis0.pos_vel_mapper.status": { "id": 441, "type": "uint" },
    "axis0.pos_vel_mapper.pos_rel": { "id": 442, "type": "float" },
    "axis0.pos_vel_mapper.pos_abs": { "id": 443, "type": "float" },
    "axis0.pos_vel_mapper.vel": { "id": 444, "type": "float" },
    "axis0.pos_vel_mapper.working_offset": { "id": 445, "type": "float" },
    "axis0.pos_vel_mapper.n_index_events": { "id": 446, "type": "uint" },
    "axis0.pos_vel_mapper.config.circular": { "id": 447, "type": "boolean" },
    "axis0.pos_vel_mapper.config.circular_output_range": { "id": 448, "type": "float" },
    "axis0.pos_vel_mapper.config.scale": { "id": 449, "type": "float" },
    "axis0.pos_vel_mapper.config.offset_valid": { "id": 450, "type": "boolean" },
    "axis0.pos_vel_mapper.config.offset": { "id": 451, "type": "float" },
    "axis0.pos_vel_mapper.config.approx_init_pos_valid": { "id": 452, "type": "boolean" },
    "axis0.pos_vel_mapper.config.approx_init_pos": { "id": 453, "type": "float" },
    "axis0.pos_vel_mapper.config.index_offset_valid": { "id": 454, "type": "boolean" },
    "axis0.pos_vel_mapper.config.index_offset": { "id": 455, "type": "float" },
    "axis0.pos_vel_mapper.config.use_index_gpio": { "id": 456, "type": "boolean" },
    "axis0.pos_vel_mapper.config.passive_index_search": { "id": 457, "type": "boolean" },
    "axis0.pos_vel_mapper.config.index_gpio": { "id": 458, "type": "uint" },
    "axis0.pos_vel_mapper.config.use_endstop": { "id": 459, "type": "boolean" },
    "axis0.commutation_mapper.status": { "id": 463, "type": "uint" },
    "axis0.commutation_mapper.pos_rel": { "id": 464, "type": "float" },
    "axis0.commutation_mapper.pos_abs": { "id": 465, "type": "float" },
    "axis0.commutation_mapper.vel": { "id": 466, "type": "float" },
    "axis0.commutation_mapper.working_offset": { "id": 467, "type": "float" },
    "axis0.commutation_mapper.n_index_events": { "id": 468, "type": "uint" },
    "axis0.commutation_mapper.config.circular": { "id": 469, "type": "boolean" },
    "axis0.commutation_mapper.config.circular_output_range": { "id": 470, "type": "float" },
    "axis0.commutation_mapper.config.scale": { "id": 471, "type": "float" },
    "axis0.commutation_mapper.config.offset_valid": { "id": 472, "type": "boolean" },
    "axis0.commutation_mapper.config.offset": { "id": 473, "type": "float" },
    "axis0.commutation_mapper.config.approx_init_pos_valid": { "id": 474, "type": "boolean" },
    "axis0.commutation_mapper.config.approx_init_pos": { "id": 475, "type": "float" },
    "axis0.commutation_mapper.config.index_offset_valid": { "id": 476, "type": "boolean" },
    "axis0.commutation_mapper.config.index_offset": { "id": 477, "type": "float" },
    "axis0.commutation_mapper.config.use_index_gpio": { "id": 478, "type": "boolean" },
    "axis0.commutation_mapper.config.passive_index_search": { "id": 479, "type": "boolean" },
    "axis0.commutation_mapper.config.index_gpio": { "id": 480, "type": "uint" },
    "axis0.commutation_mapper.config.use_endstop": { "id": 481, "type": "boolean" },
    "axis0.interpolator.status": { "id": 485, "type": "uint" },
    "axis0.interpolator.interpolation": { "id": 486, "type": "float" },
    "axis0.interpolator.config.dynamic": { "id": 487, "type": "boolean" },
    "axis0.task_times.thermistor_update.start_time": { "id": 488, "type": "uint" },
    "axis0.task_times.thermistor_update.end_time": { "id": 489, "type": "uint" },
    "axis0.task_times.thermistor_update.length": { "id": 490, "type": "uint" },
    "axis0.task_times.thermistor_update.max_length": { "id": 491, "type": "uint" },
    "axis0.task_times.sensorless_estimator_update.start_time": { "id": 492, "type": "uint" },
    "axis0.task_times.sensorless_estimator_update.end_time": { "id": 493, "type": "uint" },
    "axis0.task_times.sensorless_estimator_update.length": { "id": 494, "type": "uint" },
    "axis0.task_times.sensorless_estimator_update.max_length": { "id": 495, "type": "uint" },
    "axis0.task_times.endstop_update.start_time": { "id": 496, "type": "uint" },
    "axis0.task_times.endstop_update.end_time": { "id": 497, "type": "uint" },
    "axis0.task_times.endstop_update.length": { "id": 498, "type": "uint" },
    "axis0.task_times.endstop_update.max_length": { "id": 499, "type": "uint" },
    "axis0.task_times.can_heartbeat.start_time": { "id": 500, "type": "uint" },
    "axis0.task_times.can_heartbeat.end_time": { "id": 501, "type": "uint" },
    "axis0.task_times.can_heartbeat.length": { "id": 502, "type": "uint" },
    "axis0.task_times.can_heartbeat.max_length": { "id": 503, "type": "uint" },
    "axis0.task_times.controller_update.start_time": { "id": 504, "type": "uint" },
    "axis0.task_times.controller_update.end_time": { "id": 505, "type": "uint" },
    "axis0.task_times.controller_update.length": { "id": 506, "type": "uint" },
    "axis0.task_times.controller_update.max_length": { "id": 507, "type": "uint" },
    "axis0.task_times.open_loop_vector_generator_update.start_time": { "id": 508, "type": "uint" },
    "axis0.task_times.open_loop_vector_generator_update.end_time": { "id": 509, "type": "uint" },
    "axis0.task_times.open_loop_vector_generator_update.length": { "id": 510, "type": "uint" },
    "axis0.task_times.open_loop_vector_generator_update.max_length": { "id": 511, "type": "uint" },
    "axis0.task_times.acim_estimator_update.start_time": { "id": 512, "type": "uint" },
    "axis0.task_times.acim_estimator_update.end_time": { "id": 513, "type": "uint" },
    "axis0.task_times.acim_estimator_update.length": { "id": 514, "type": "uint" },
    "axis0.task_times.acim_estimator_update.max_length": { "id": 515, "type": "uint" },
    "axis0.task_times.motor_update.start_time": { "id": 516, "type": "uint" },
    "axis0.task_times.motor_update.end_time": { "id": 517, "type": "uint" },
    "axis0.task_times.motor_update.length": { "id": 518, "type": "uint" },
    "axis0.task_times.motor_update.max_length": { "id": 519, "type": "uint" },
    "axis0.task_times.current_controller_update.start_time": { "id": 520, "type": "uint" },
    "axis0.task_times.current_controller_update.end_time": { "id": 521, "type": "uint" },
    "axis0.task_times.current_controller_update.length": { "id": 522, "type": "uint" },
    "axis0.task_times.current_controller_update.max_length": { "id": 523, "type": "uint" },
    "axis0.task_times.current_sense.start_time": { "id": 524, "type": "uint" },
    "axis0.task_times.current_sense.end_time": { "id": 525, "type": "uint" },
    "axis0.task_times.current_sense.length": { "id": 526, "type": "uint" },
    "axis0.task_times.current_sense.max_length": { "id": 527, "type": "uint" },
    "axis0.task_times.pwm_update.start_time": { "id": 528, "type": "uint" },
    "axis0.task_times.pwm_update.end_time": { "id": 529, "type": "uint" },
    "axis0.task_times.pwm_update.length": { "id": 530, "type": "uint" },
    "axis0.task_times.pwm_update.max_length": { "id": 531, "type": "uint" },
    "axis0.procedure_result": { "id": 532, "type": "uint" },
    "axis0.disarm_time": { "id": 533, "type": "float" },
    "axis0.is_armed": { "id": 534, "type": "boolean" },
    "axis0.observed_encoder_scale_factor": { "id": 535, "type": "float" },
    "onboard_encoder0.status": { "id": 540, "type": "uint" },
    "onboard_encoder0.raw": { "id": 541, "type": "float" },
    "inc_encoder0.status": { "id": 544, "type": "uint" },
    "inc_encoder0.pos_min": { "id": 545, "type": "float" },
    "inc_encoder0.pos_max": { "id": 546, "type": "float" },
    "inc_encoder0.pos_residual": { "id": 547, "type": "float" },
    "inc_encoder0.raw": { "id": 548, "type": "uint" },
    "inc_encoder0.config.enabled": { "id": 549, "type": "boolean" },
    "inc_encoder0.config.cpr": { "id": 550, "type": "uint" },
    "hall_encoder0.status": { "id": 551, "type": "uint" },
    "hall_encoder0.hall_cnt": { "id": 552, "type": "uint" },
    "hall_encoder0.raw_hall_state": { "id": 553, "type": "uint" },
    "hall_encoder0.abs_pos_min": { "id": 554, "type": "float" },
    "hall_encoder0.abs_pos_max": { "id": 555, "type": "float" },
    "hall_encoder0.config.enabled": { "id": 556, "type": "boolean" },
    "hall_encoder0.config.hall_polarity": { "id": 557, "type": "uint" },
    "hall_encoder0.config.hall_polarity_calibrated": { "id": 558, "type": "boolean" },
    "hall_encoder0.config.ignore_illegal_hall_state": { "id": 559, "type": "boolean" },
    "hall_encoder0.config.edges_calibrated": { "id": 560, "type": "boolean" },
    "hall_encoder0.config.edge0": { "id": 561, "type": "float" },
    "hall_encoder0.config.edge1": { "id": 562, "type": "float" },
    "hall_encoder0.config.edge2": { "id": 563, "type": "float" },
    "hall_encoder0.config.edge3": { "id": 564, "type": "float" },
    "hall_encoder0.config.edge4": { "id": 565, "type": "float" },
    "hall_encoder0.config.edge5": { "id": 566, "type": "float" },
    "spi_encoder0.status": { "id": 567, "type": "uint" },
    "spi_encoder0.raw": { "id": 568, "type": "float" },
    "spi_encoder0.warning": { "id": 569, "type": "boolean" },
    "spi_encoder0.n_errors": { "id": 570, "type": "uint" },
    "spi_encoder0.inject_errors": { "id": 571, "type": "boolean" },
    "spi_encoder0.config.ncs_gpio": { "id": 572, "type": "uint" },
    "spi_encoder0.config.mode": { "id": 573, "type": "uint" },
    "spi_encoder0.config.delay": { "id": 574, "type": "float" },
    "spi_encoder0.config.max_error_rate": { "id": 575, "type": "float" },
    "spi_encoder0.config.baudrate": { "id": 576, "type": "uint" },
    "spi_encoder0.config.biss_c_bits": { "id": 577, "type": "uint" },
    "spi_encoder1.status": { "id": 580, "type": "uint" },
    "spi_encoder1.raw": { "id": 581, "type": "float" },
    "spi_encoder1.warning": { "id": 582, "type": "boolean" },
    "spi_encoder1.n_errors": { "id": 583, "type": "uint" },
    "spi_encoder1.inject_errors": { "id": 584, "type": "boolean" },
    "spi_encoder1.config.ncs_gpio": { "id": 585, "type": "uint" },
    "spi_encoder1.config.mode": { "id": 586, "type": "uint" },
    "spi_encoder1.config.delay": { "id": 587, "type": "float" },
    "spi_encoder1.config.max_error_rate": { "id": 588, "type": "float" },
    "spi_encoder1.config.baudrate": { "id": 589, "type": "uint" },
    "spi_encoder1.config.biss_c_bits": { "id": 590, "type": "uint" },
    "encoder_estimator0.status": { "id": 593, "type": "uint" },
    "encoder_estimator0.pos_estimate": { "id": 594, "type": "float" },
    "encoder_estimator0.vel_estimate": { "id": 595, "type": "float" },
    "encoder_estimator1.status": { "id": 596, "type": "uint" },
    "encoder_estimator1.pos_estimate": { "id": 597, "type": "float" },
    "encoder_estimator1.vel_estimate": { "id": 598, "type": "float" },
    "thermistor0": { "id": 599, "type": "float" }
};
function apiFunctions(api, node_id, axis = 0) {
    const canId = (node_id, cmd_id) => node_id << 5 | cmd_id + axis * 32;
    const functions = {
        askVersion: () => {
            const can_id = canId(node_id, Packets.GetVersion);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendEstop: (message) => {
            api.channel.send({ data: createEstopBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.Estop) });
        },
        askError: () => {
            const can_id = canId(node_id, Packets.GetError);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendRxSdo: (message) => {
            api.channel.send({ data: createRxSdoBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.RxSdo) });
        },
        sendAddress: (message) => {
            api.channel.send({ data: createAddressBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.Address) });
        },
        sendSetAxisState: (message) => {
            api.channel.send({ data: createSetAxisStateBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetAxisState) });
        },
        askEncoderEstimates: () => {
            const can_id = canId(node_id, Packets.GetEncoderEstimates);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendSetControllerMode: (message) => {
            api.channel.send({ data: createSetControllerModeBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetControllerMode) });
        },
        sendSetInputPos: (message) => {
            api.channel.send({ data: createSetInputPosBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetInputPos) });
        },
        sendSetInputVel: (message) => {
            api.channel.send({ data: createSetInputVelBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetInputVel) });
        },
        sendSetInputTorque: (message) => {
            api.channel.send({ data: createSetInputTorqueBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetInputTorque) });
        },
        sendSetLimits: (message) => {
            api.channel.send({ data: createSetLimitsBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetLimits) });
        },
        sendSetTrajVelLimit: (message) => {
            api.channel.send({ data: createSetTrajVelLimitBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetTrajVelLimit) });
        },
        sendSetTrajAccelLimits: (message) => {
            api.channel.send({ data: createSetTrajAccelLimitsBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetTrajAccelLimits) });
        },
        sendSetTrajInertia: (message) => {
            api.channel.send({ data: createSetTrajInertiaBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetTrajInertia) });
        },
        askIq: () => {
            const can_id = canId(node_id, Packets.GetIq);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        askTemperature: () => {
            const can_id = canId(node_id, Packets.GetTemperature);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendReboot: (message) => {
            api.channel.send({ data: createRebootBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.Reboot) });
        },
        askBusVoltageCurrent: () => {
            const can_id = canId(node_id, Packets.GetBusVoltageCurrent);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendClearErrors: (message) => {
            api.channel.send({ data: createClearErrorsBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.ClearErrors) });
        },
        sendSetAbsolutePosition: (message) => {
            api.channel.send({ data: createSetAbsolutePositionBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetAbsolutePosition) });
        },
        sendSetPosGain: (message) => {
            api.channel.send({ data: createSetPosGainBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetPosGain) });
        },
        sendSetVelGains: (message) => {
            api.channel.send({ data: createSetVelGainsBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.SetVelGains) });
        },
        askTorques: () => {
            const can_id = canId(node_id, Packets.GetTorques);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        askPowers: () => {
            const can_id = canId(node_id, Packets.GetPowers);
            api.channel.send({ data: Buffer.alloc(0), ext: false, rtr: true, id: can_id });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendEnterDFUMode: (message) => {
            api.channel.send({ data: createEnterDFUModeBuffer(message), ext: false, rtr: false, id: canId(node_id, Packets.EnterDFUMode) });
        }
    };
    async function waitFor(cmd_id, condition, timeout = 2000) {
        return (0, odrive_api_1.waitForCondition)(api, exports.inboundPacketsMap, node_id, cmd_id, condition, timeout);
    }
    async function expect(cmd_id, condition, error, timeout = 2000) {
        if (!await waitFor(cmd_id, condition, timeout)) {
            throw error;
        }
    }
    return {
        waitFor: waitFor,
        expect: expect,
        ...functions,
        endpoints: new Proxy({}, {
            get(target, prop) {
                return {
                    get: async () => {
                        const endpointId = endpointIdMap[prop].id;
                        functions.sendRxSdo({ value: 0, endpointId: endpointId, opcode: "READ", reserved: 0 });
                        const result = await (0, odrive_api_1.waitForCondition)(api, exports.inboundPacketsMap, node_id, Packets.TxSdo + axis * 32, res => res.endpointId === endpointId);
                        if (result === null) {
                            throw "could not read endpoint " + prop;
                        }
                        return (0, odrive_api_1.valueToEndpointType)(result.value, endpointIdMap[prop].type);
                    },
                    set: (value) => {
                        const endpointId = endpointIdMap[prop].id;
                        functions.sendRxSdo({ value: (0, odrive_api_1.typedToEndpoint)(value, endpointIdMap[prop].type), endpointId: endpointId, opcode: "WRITE", reserved: 0 });
                        return true;
                    }
                };
            }
        })
    };
}
