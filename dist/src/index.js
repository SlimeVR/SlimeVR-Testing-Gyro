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
const simulateCircularMotion = true;
const channel = can.createRawChannel("can0", true);
channel.start();
const odriveApi = (0, odrive_api_1.initOdriveApi)(channel);
const odrive1 = (0, generated_api_1.apiFunctions)(odriveApi, 1);
const odrive2 = (0, generated_api_1.apiFunctions)(odriveApi, 2);
const odrive3 = (0, generated_api_1.apiFunctions)(odriveApi, 3);
const odrives = [odrive1, odrive2, odrive3];
const angles = [0, 0, 0];
home_calibration_json_1.default[1] += 0.5;
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
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(10);
    odrive.endpoints['axis0.config.motor.phase_resistance'].set(0.037);
    odrive.endpoints['axis0.controller.config.vel_limit'].set(3);
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(3);
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
    else {
    }
});
const goToRaw = async (odrive, encoder_raw, timeout = 2000) => {
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 });
    await odrive.expect(generated_api_1.Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - encoder_raw) % (Math.PI * 2) < 0.05, `Did not go to rot (raw), expected ${encoder_raw}`, timeout);
};
const goToAngle = async (axis, angle) => {
    if (simulateCircularMotion) {
        const currentAngle = angles[axis] % (Math.PI * 2);
        const angleDiff = angle - angles[axis];
        if (angleDiff >= Math.PI) {
            const targetAngle = angle - Math.PI;
            angle = currentAngle + targetAngle - angleDiff;
        }
        console.log('Axis %d going to %d', axis, angle);
    }
    await goToRaw(odrives[axis], angle / (Math.PI * 2) + home_calibration_json_1.default[0], 10000);
};
const goToAngles = async ({ x, y, z }) => {
    await Promise.all([
        goToAngle(2, z),
        goToAngle(1, y),
        goToAngle(0, x)
    ]);
};
const goToHome = async () => {
    await Promise.all(odrives.map((odrive, index) => goToRaw(odrive, home_calibration_json_1.default[index], 10_000)));
    angles[0] = 0;
    angles[1] = 0;
    angles[2] = 0;
};
const degToRad = (degrees) => (degrees * Math.PI) / 180;
(async () => {
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }));
    forEachController(initOdrive);
    currentLimit(odrive1, 7);
    currentLimit(odrive2, 7);
    currentLimit(odrive3, 7);
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
    for (let i = 0; i < 200; i++) {
        await sleep(1000);
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(0) });
        await sleep(1000);
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(90) });
        await sleep(1000);
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(180) });
        await sleep(1000);
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(270) });
    }
    /*
    for (let i = 0; i < 200; i++) {
        await goToHome();
        await sleep(1000)
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(90) })
        await sleep(1000)

    }*/
    console.log('DONE');
})();
process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}));
});
process.on('unhandledRejection', (error, p) => {
    console.error(error);
    forEachController((odrive) => odrive.sendEstop({}));
});
