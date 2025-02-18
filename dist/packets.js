"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketType = exports.swapFn = void 0;
exports.decodePacket = decodePacket;
exports.encodePacket = encodePacket;
const bit_buffer_1 = require("bit-buffer");
const console_1 = require("console");
const swapFn = (obj) => {
    const res = {};
    Object.entries(obj).forEach(([key, value]) => {
        res[value] = key;
    });
    return res;
};
exports.swapFn = swapFn;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["Calibrate"] = 128] = "Calibrate";
    PacketType[PacketType["SetWorkMode"] = 130] = "SetWorkMode";
    PacketType[PacketType["WorkingCurrent"] = 131] = "WorkingCurrent";
    PacketType[PacketType["HoldingCurrentParcent"] = 155] = "HoldingCurrentParcent";
    PacketType[PacketType["Subdivision"] = 132] = "Subdivision";
    PacketType[PacketType["Enable"] = 133] = "Enable";
    PacketType[PacketType["Direction"] = 134] = "Direction";
    PacketType[PacketType["AutoTurnOffScreen"] = 135] = "AutoTurnOffScreen";
    PacketType[PacketType["Protect"] = 136] = "Protect";
    PacketType[PacketType["Mplyer"] = 137] = "Mplyer";
    PacketType[PacketType["SetCanRate"] = 138] = "SetCanRate";
    PacketType[PacketType["CanID"] = 139] = "CanID";
    PacketType[PacketType["SlaveRespondActive"] = 140] = "SlaveRespondActive";
    PacketType[PacketType["KeyLock"] = 143] = "KeyLock";
    PacketType[PacketType["SetHome"] = 144] = "SetHome";
    PacketType[PacketType["GoHome"] = 145] = "GoHome";
    PacketType[PacketType["ZeroAxis"] = 146] = "ZeroAxis";
    PacketType[PacketType["SetMode0"] = 154] = "SetMode0";
    PacketType[PacketType["Reset"] = 63] = "Reset";
    PacketType[PacketType["MotorStatus"] = 241] = "MotorStatus";
    PacketType[PacketType["Encoder"] = 48] = "Encoder";
    PacketType[PacketType["MotorSpeed"] = 50] = "MotorSpeed";
    PacketType[PacketType["EncoderPulses"] = 51] = "EncoderPulses";
    PacketType[PacketType["IOPorts"] = 52] = "IOPorts";
    PacketType[PacketType["EncoderError"] = 57] = "EncoderError";
    PacketType[PacketType["EnPinStatus"] = 58] = "EnPinStatus";
    PacketType[PacketType["GoToZeroStatus"] = 59] = "GoToZeroStatus";
    PacketType[PacketType["ReleaseShaft"] = 61] = "ReleaseShaft";
    PacketType[PacketType["ReadShaftProtection"] = 62] = "ReadShaftProtection";
    PacketType[PacketType["EnableMotor"] = 243] = "EnableMotor";
    PacketType[PacketType["EmergencyStop"] = 247] = "EmergencyStop";
    PacketType[PacketType["SpeedMode"] = 246] = "SpeedMode";
    PacketType[PacketType["SaveSpeedMode"] = 255] = "SaveSpeedMode";
    PacketType[PacketType["RelativeMotion"] = 253] = "RelativeMotion";
    PacketType[PacketType["AbsoluteMotion"] = 254] = "AbsoluteMotion";
    PacketType[PacketType["RelativeMotionAxis"] = 244] = "RelativeMotionAxis";
    PacketType[PacketType["AbsoluteMotionAxis"] = 245] = "AbsoluteMotionAxis";
})(PacketType || (exports.PacketType = PacketType = {}));
const frameStatusMap = { 1: "success", 0: "fail" };
const calibrationStatusMap = {
    0: "calibarating",
    1: "success",
    2: "fail",
};
const calibrationStatusMapFliped = (0, exports.swapFn)(calibrationStatusMap);
const workModeMap = {
    0: "CR_OPEN",
    1: "CR_CLOSE",
    2: "CR_vFOC",
    3: "SR_OPEN",
    4: "SR_CLOSE",
    5: "SR_vFOC",
};
const workModeMapFliped = (0, exports.swapFn)(workModeMap);
const enableTypeMap = {
    0: "high",
    1: "low",
    2: "hold",
};
const enableTypeMapFliped = (0, exports.swapFn)(enableTypeMap);
const directionTypeMap = { 0: "cw", 1: "ccw" };
const directionTypeMapFliped = (0, exports.swapFn)(directionTypeMap);
const canRateTypeMap = {
    0: "125K",
    1: "250K",
    2: "500K",
    3: "1M",
};
const canRateTypeMapFliped = (0, exports.swapFn)(canRateTypeMap);
const homeStatusTypeMap = {
    0: "fail",
    1: "start",
    2: "success",
};
const homeStatusTypeMapFliped = (0, exports.swapFn)(homeStatusTypeMap);
const mode0TypeMap = {
    0: "disable",
    1: "dir_mode",
    2: "near_mode",
};
const mode0TypeMapFliped = (0, exports.swapFn)(mode0TypeMap);
const statusTypeMap = {
    0: "fail",
    1: "stop",
    2: "speed_up",
    3: "speed_down",
    4: "full_speed",
    5: "homing",
    6: "calibrating",
};
const statusTypeMapFliped = (0, exports.swapFn)(statusTypeMap);
const goToZeroStatusMap = {
    0: "going",
    1: "success",
    2: "fail",
};
const goToZeroStatusMapFliped = (0, exports.swapFn)(goToZeroStatusMap);
const saveModeMap = { 0xc8: "save", 0xca: "clean" };
const saveModeMapFliped = (0, exports.swapFn)(saveModeMap);
const relativeMotionStatusMap = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const relativeMotionStatusMapFliped = (0, exports.swapFn)(relativeMotionStatusMap);
const absoluteMotionStatusMap = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const absoluteMotionStatusMapFliped = (0, exports.swapFn)(absoluteMotionStatusMap);
const relativeMotionAxisStatusMap = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const relativeMotionAxisStatusMapFliped = (0, exports.swapFn)(relativeMotionAxisStatusMap);
const absoluteMotionAxisStatusMap = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const absoluteMotionAxisStatusMapFliped = (0, exports.swapFn)(absoluteMotionAxisStatusMap);
const packetRegistry = {
    [PacketType.Calibrate]: {
        parseData(data) {
            return { status: calibrationStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.SetWorkMode]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(workModeMapFliped[packet.mode]);
            return buff;
        },
    },
    [PacketType.WorkingCurrent]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(2);
            buff.writeUint16BE(packet.ma);
            return buff;
        },
    },
    [PacketType.HoldingCurrentParcent]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.holdMa);
            return buff;
        },
    },
    [PacketType.Subdivision]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.micstep);
            return buff;
        },
    },
    [PacketType.Enable]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(enableTypeMapFliped[packet.enable]);
            return buff;
        },
    },
    [PacketType.Direction]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(directionTypeMapFliped[packet.direction]);
            return buff;
        },
    },
    [PacketType.AutoTurnOffScreen]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.Protect]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.Mplyer]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.SetCanRate]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(canRateTypeMapFliped[packet.rate]);
            return buff;
        },
    },
    [PacketType.CanID]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(2);
            buff.writeInt16BE(packet.canId);
            return buff;
        },
    },
    [PacketType.SlaveRespondActive]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(2);
            buff.writeUint8(packet.respond ? 1 : 0, 0);
            buff.writeUint8(packet.active ? 1 : 0, 1);
            return buff;
        },
    },
    [PacketType.KeyLock]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.SetHome]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(5);
            buff.writeUint8(packet.endstop ? 1 : 0);
            buff.writeUint8(directionTypeMapFliped[packet.homeDir], 1);
            buff.writeUint16BE(packet.homeSpeed, 2);
            buff.writeUint8(packet.endlimit ? 1 : 0, 4);
            return buff;
        },
    },
    [PacketType.GoHome]: {
        parseData(data) {
            return { status: homeStatusTypeMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.ZeroAxis]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.SetMode0]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(4);
            buff.writeUint8(mode0TypeMapFliped[packet.mode_0]);
            buff.writeUint8(packet.enable ? 1 : 0, 1);
            buff.writeUint8(packet.speed, 2);
            buff.writeUint8(directionTypeMapFliped[packet.dir], 3);
            return buff;
        },
    },
    [PacketType.Reset]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.MotorStatus]: {
        parseData(data) {
            return { status: statusTypeMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.Encoder]: {
        parseData(data) {
            return {
                carry: data.readUInt32BE(),
                value: data.readUInt32BE(5),
            };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.MotorSpeed]: {
        parseData(data) {
            return { speed: data.readUIntBE(0, 6) };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EncoderPulses]: {
        parseData(data) {
            return { pulses: data.readUInt32BE() };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.IOPorts]: {
        parseData(data) {
            const status = data.readUint8();
            return {
                in_1: Boolean(status & 0b0000_0001),
                in_2: Boolean(status & 0b0000_0010),
                out_1: Boolean(status & 0b0000_0100),
                out_2: Boolean(status & 0b0000_1000),
            };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EncoderError]: {
        parseData(data) {
            return { error: data.readUint32BE() };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EnPinStatus]: {
        parseData(data) {
            return { enable: data.readUint8() === 1 };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.GoToZeroStatus]: {
        parseData(data) {
            return { status: goToZeroStatusMap[data.readUint8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.ReleaseShaft]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUint8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.ReadShaftProtection]: {
        parseData(data) {
            return { protected: data.readUint8() == 1 };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EnableMotor]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.EmergencyStop]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.SpeedMode]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            (0, console_1.assert)(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(3);
            const view = new bit_buffer_1.BitView(buff);
            buff.writeUint8(3, packet.accel);
            view.setBits(0, directionTypeMapFliped[packet.dir], 1);
            view.setBits(1, 0, 3);
            view.setBits(4, packet.speed, 10);
            return buff;
        },
    },
    [PacketType.SaveSpeedMode]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(saveModeMapFliped[packet.state]);
            return buff;
        },
    },
    [PacketType.RelativeMotion]: {
        parseData(data) {
            return { status: relativeMotionStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            (0, console_1.assert)(packet.speed >= 0 && packet.speed <= 3000);
            (0, console_1.assert)(packet.pulses > 0 && packet.pulses <= 0xffffff);
            const buff = Buffer.alloc(6);
            const view = new bit_buffer_1.BitView(buff);
            buff.writeUint8(3, packet.accel); // acc
            buff.writeUintBE(packet.pulses, 4, 3); // pulses
            view.setBits(0, directionTypeMapFliped[packet.dir], 1); // dir
            view.setBits(1, 0, 3); // rev
            view.setBits(4, packet.speed, 10); // speed
            return buff;
        },
    },
    [PacketType.AbsoluteMotion]: {
        parseData(data) {
            return { status: absoluteMotionStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            (0, console_1.assert)(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.pulses, 3, 3);
            return buff;
        },
    },
    [PacketType.RelativeMotionAxis]: {
        parseData(data) {
            return { status: relativeMotionAxisStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            (0, console_1.assert)(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.relAxis, 3, 3);
            return buff;
        },
    },
    [PacketType.AbsoluteMotionAxis]: {
        parseData(data) {
            return { status: absoluteMotionAxisStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            (0, console_1.assert)(packet.speed > 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.absAxis, 3, 3);
            return buff;
        },
    },
};
const checksum = (deviceId, data) => (deviceId + data.reduce((sum, byte) => sum + byte, 0)) & 0xff;
const decodePacketData = (deviceId, data) => {
    const crc = data[data.length - 1];
    const dataArray = data.subarray(0, -1); // Remove CRC
    const dataSum = checksum(deviceId, dataArray);
    // if (dataSum !== crc) throw new Error(`Invalid checksum: ${dataSum}`);
    // console.log('res', dataArray);
    return Buffer.from(dataArray);
};
const buildPacketData = (deviceId, packetId, dataFields) => {
    const out = Buffer.alloc(dataFields.length + 2);
    out.writeUint8(packetId);
    dataFields.copy(out, 1);
    const c = checksum(deviceId, out);
    out.writeUint8(c, out.length - 1);
    // console.log("encoding", out);
    return out;
};
function decodePacket(deviceId, data) {
    const validatedData = decodePacketData(deviceId, data);
    if (!validatedData)
        return null;
    const id = validatedData[0];
    if (!isValidPacketId(id)) {
        throw new Error(`Invalid packet ID: ${id}`);
    }
    const handler = packetRegistry[id];
    if (!handler) {
        throw new Error(`No handler found for packet ID: ${id}`);
    }
    return {
        id: id,
        ...handler.parseData(validatedData.subarray(1)),
    };
}
function isValidPacketId(id) {
    return id in packetRegistry;
}
function encodePacket(deviceId, packet) {
    if (!isValidPacketId(packet.id)) {
        throw new Error(`Invalid packet ID: ${packet.id}`);
    }
    const handler = packetRegistry[packet.id];
    const rawDataFields = handler.buildData(packet);
    return buildPacketData(deviceId, packet.id, rawDataFields);
}
