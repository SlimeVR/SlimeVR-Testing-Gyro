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
        opcode: rxsdo_opcodeMap[data.readUInt8(0)]
    };
}
function createRxSdoBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value, 4);
    buffer.writeUInt8(message.reserved, 3);
    buffer.writeUInt8(rxsdo_opcodeMapFliped[message.opcode], 0);
    return buffer;
}
function parseTxSdo(data) {
    return {
        value: data.readUInt32LE(4),
        reserved1: data.readUInt8(3),
        reserved0: data.readUInt8(0)
    };
}
function createTxSdoBuffer(message) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(message.value, 4);
    buffer.writeUInt8(message.reserved1, 3);
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
function apiFunctions(api) {
    return {
        askVersion: (node_id) => {
            const can_id = node_id << 5 | Packets.GetVersion;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendEstop: (node_id, message) => {
            api.channel.send({
                data: createEstopBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.Estop
            });
        },
        askError: (node_id) => {
            const can_id = node_id << 5 | Packets.GetError;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendRxSdo: (node_id, message) => {
            api.channel.send({
                data: createRxSdoBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.RxSdo
            });
        },
        sendAddress: (node_id, message) => {
            api.channel.send({
                data: createAddressBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.Address
            });
        },
        sendSetAxisState: (node_id, message) => {
            api.channel.send({
                data: createSetAxisStateBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetAxisState
            });
        },
        askEncoderEstimates: (node_id) => {
            const can_id = node_id << 5 | Packets.GetEncoderEstimates;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendSetControllerMode: (node_id, message) => {
            api.channel.send({
                data: createSetControllerModeBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetControllerMode
            });
        },
        sendSetInputPos: (node_id, message) => {
            api.channel.send({
                data: createSetInputPosBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetInputPos
            });
        },
        sendSetInputVel: (node_id, message) => {
            api.channel.send({
                data: createSetInputVelBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetInputVel
            });
        },
        sendSetInputTorque: (node_id, message) => {
            api.channel.send({
                data: createSetInputTorqueBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetInputTorque
            });
        },
        sendSetLimits: (node_id, message) => {
            api.channel.send({
                data: createSetLimitsBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetLimits
            });
        },
        sendSetTrajVelLimit: (node_id, message) => {
            api.channel.send({
                data: createSetTrajVelLimitBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetTrajVelLimit
            });
        },
        sendSetTrajAccelLimits: (node_id, message) => {
            api.channel.send({
                data: createSetTrajAccelLimitsBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetTrajAccelLimits
            });
        },
        sendSetTrajInertia: (node_id, message) => {
            api.channel.send({
                data: createSetTrajInertiaBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetTrajInertia
            });
        },
        askIq: (node_id) => {
            const can_id = node_id << 5 | Packets.GetIq;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        askTemperature: (node_id) => {
            const can_id = node_id << 5 | Packets.GetTemperature;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendReboot: (node_id, message) => {
            api.channel.send({
                data: createRebootBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.Reboot
            });
        },
        askBusVoltageCurrent: (node_id) => {
            const can_id = node_id << 5 | Packets.GetBusVoltageCurrent;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendClearErrors: (node_id, message) => {
            api.channel.send({
                data: createClearErrorsBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.ClearErrors
            });
        },
        sendSetAbsolutePosition: (node_id, message) => {
            api.channel.send({
                data: createSetAbsolutePositionBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetAbsolutePosition
            });
        },
        sendSetPosGain: (node_id, message) => {
            api.channel.send({
                data: createSetPosGainBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetPosGain
            });
        },
        sendSetVelGains: (node_id, message) => {
            api.channel.send({
                data: createSetVelGainsBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.SetVelGains
            });
        },
        askTorques: (node_id) => {
            const can_id = node_id << 5 | Packets.GetTorques;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        askPowers: (node_id) => {
            const can_id = node_id << 5 | Packets.GetPowers;
            api.channel.send({
                data: Buffer.alloc(0),
                ext: false,
                rtr: true,
                id: can_id
            });
            return (0, odrive_api_1.waitForResponse)(api, exports.inboundPacketsMap, can_id);
        },
        sendEnterDFUMode: (node_id, message) => {
            api.channel.send({
                data: createEnterDFUModeBuffer(message),
                ext: false,
                rtr: false,
                id: node_id << 5 | Packets.EnterDFUMode
            });
        }
    };
}
