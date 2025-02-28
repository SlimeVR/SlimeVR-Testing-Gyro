"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const can = __importStar(require("socketcan"));
const home_calibration_json_1 = __importDefault(require("../home-calibration.json"));
const odrive_api_1 = require("./api-generator/odrive-api");
const generated_api_1 = require("./generated-api");
const udp_server_1 = require("./udp-server");
const _3dmath_1 = require("./3dmath");
const node_util_1 = __importDefault(require("node:util"));
const simulateCircularMotion = true;
const targetPrecision = 0.01;
const channel = can.createRawChannel("can0", true);
channel.start();
const odriveApi = (0, odrive_api_1.initOdriveApi)(channel);
const odrive1 = (0, generated_api_1.apiFunctions)(odriveApi, 1);
const odrive2 = (0, generated_api_1.apiFunctions)(odriveApi, 2);
const odrive3 = (0, generated_api_1.apiFunctions)(odriveApi, 3);
const odrives = [odrive1, odrive2, odrive3];
const positions = [0, 0, 0];
const sleep = (time) => new Promise(resolve => setTimeout(() => resolve(true), time));
const forEachController = async (call) => {
    for (const odrive of odrives) {
        await call(odrive);
    }
};
const currentLimit = (odrive, current) => {
    odrive.endpoints['config.dc_max_positive_current'].set(current);
    odrive.endpoints['config.dc_max_negative_current'].set(-12);
};
const initOdrive = async (odrive) => {
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(5);
    odrive.endpoints['axis0.config.motor.phase_resistance'].set(0.037);
    odrive.endpoints['axis0.controller.config.vel_limit'].set(4);
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(4);
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(10);
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(10);
};
channel.addListener('onMessage', (msg) => {
    const cmdId = (0, odrive_api_1.getCmdId)(msg.id);
    const nodeId = (0, odrive_api_1.getNodeId)(msg.id);
    const inPacket = generated_api_1.inboundPacketsMap[cmdId];
    if (!inPacket) {
        throw 'invalid id';
    }
    const res = inPacket(msg.data);
    if (cmdId === generated_api_1.Packets.Heartbeat) {
        const hearbeat = res;
        if (hearbeat.axisError !== 'NONE') {
            forEachController((odrive) => odrive.sendEstop({}));
            throw { nodeId, error: hearbeat.axisError };
        }
    }
    else if (cmdId == generated_api_1.Packets.GetEncoderEstimates) {
        const encoderEstimates = res;
        positions[nodeId - 1] = encoderEstimates.posEstimate;
    }
    else {
    }
});
const wrapToCircle = (num) => {
    return num - Math.trunc(num);
};
const isInPosition = (currentPosition, expectedPosition) => {
    return Math.abs(currentPosition - expectedPosition) < targetPrecision;
};
const goToRaw = async (axis, encoder_raw, timeout = 2000) => {
    const odrive = odrives[axis];
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 });
    await odrive.expect(generated_api_1.Packets.GetEncoderEstimates, (encoder) => isInPosition(encoder.posEstimate, encoder_raw), `Did not go to rot (raw), expected ${encoder_raw}, got ${positions[axis]}`, timeout);
};
const sendToRaw = (axis, encoder_raw) => {
    const odrive = odrives[axis];
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 });
};
const goToAngle = async (axis, angle, wait = true) => {
    var circularPosition = angle / (Math.PI * 2);
    if (simulateCircularMotion) {
        const currentAngle = wrapToCircle(positions[axis]);
        var diff = circularPosition - currentAngle;
        if (diff < -0.5)
            diff += 1;
        circularPosition = positions[axis] + diff;
    }
    if (wait)
        await goToRaw(axis, circularPosition, 10000);
    else
        sendToRaw(axis, circularPosition);
};
const goToAngles = async ({ x, y, z }, wait = true) => {
    await Promise.all([
        goToAngle(2, z, wait),
        goToAngle(1, y, wait),
        goToAngle(0, x, wait)
    ]);
};
const goToHome = async () => {
    await Promise.all(odrives.map((odrive, index) => goToRaw(index, home_calibration_json_1.default[index], 10_000)));
    positions.forEach((v, i) => positions[i] = 0);
};
const degToRad = (degrees) => (degrees * Math.PI) / 180;
const radToDeg = (rad) => rad * 180 / Math.PI;
const AXIS_OFFSET = _3dmath_1.Quaternion.fromRotationVector(-Math.PI / 2, 0, 0);
(async () => {
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }));
    forEachController(initOdrive);
    currentLimit(odrive1, 8);
    currentLimit(odrive2, 8);
    currentLimit(odrive3, 8);
    await Promise.all(odrives.map(async (odrive) => {
        odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" });
        await odrive.expect(generated_api_1.Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
        odrive.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'TRAP_TRAJ' });
        odrive.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" });
        await odrive.expect(generated_api_1.Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in closed loop', 10_000);
    }));
    console.log('Going home~');
    await goToHome();
    console.log('Having fun~');
    const server = (0, udp_server_1.createSever)(6969, '0.0.0.0');
    var lastUpdateTime = Date.now();
    server.onPacketReceived(udp_server_1.PacketRotationDataBuilder.id, {
        onPacket: (rinfo, packet) => {
            if (packet.sensorId == 0 && packet.dataType == 1) {
                const time = Date.now();
                if (time - lastUpdateTime > 50) {
                    lastUpdateTime = time;
                    const quat = new _3dmath_1.Quaternion(packet.rotation.w, packet.rotation.x, packet.rotation.y, packet.rotation.z);
                    const ofseted = AXIS_OFFSET.timesQuat(quat);
                    const euler = ofseted.toEulerAngles(_3dmath_1.EulerOrder.XYZ);
                    console.log(node_util_1.default.format('Angles: %5.2d, %5.2d, %5.2d', radToDeg(euler.x), radToDeg(euler.y), radToDeg(euler.z)));
                    //goToAngles({x: euler.x, y: euler.y, z: euler.z}, false)
                }
            }
        }
    });
    server.onPacketReceived(udp_server_1.PacketHandshakeBuilder.id, {
        onPacket: (rinfo, packet) => {
            server.sendPacket(udp_server_1.PacketHandshakeBuilder, {}, rinfo.address, rinfo.port);
        }
    });
    console.log('DONE');
})();
