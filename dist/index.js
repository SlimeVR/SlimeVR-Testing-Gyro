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
Object.defineProperty(exports, "__esModule", { value: true });
const can = __importStar(require("socketcan"));
const odrive_api_1 = require("./api-generator/odrive-api");
const generated_api_1 = require("./generated-api");
const channel = can.createRawChannel("can0", true);
channel.start();
const odriveApi = (0, odrive_api_1.initOdriveApi)(channel);
const odrive1 = (0, generated_api_1.apiFunctions)(odriveApi, 1);
const odrive2 = (0, generated_api_1.apiFunctions)(odriveApi, 2);
const odrives = [odrive1, odrive2];
const sleep = (time) => new Promise(resolve => setTimeout(() => resolve(true), time));
const forEachController = async (call) => {
    for (const odrive of odrives) {
        await call(odrive);
    }
};
const initOdrive = async (odrive) => {
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(10);
    odrive.endpoints['config.inverter0.current_soft_max'].set(3);
    odrive.endpoints['config.inverter0.current_hard_max'].set(5);
    odrive.endpoints['axis0.controller.config.vel_limit'].set(5);
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(4);
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(20);
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(20);
    odrive.endpoints['axis0.controller.config.vel_gain'].set(10);
    odrive.endpoints['axis0.controller.config.pos_gain'].set(3);
    odrive.endpoints['axis0.controller.config.vel_integrator_gain'].set(10);
    odrive.endpoints['inc_encoder0.config.enabled'].set(true);
    odrive.endpoints['axis0.config.load_encoder'].set(1);
    odrive.endpoints['axis0.config.commutation_encoder'].set(1);
    odrive.endpoints['inc_encoder0.config.cpr'].set(20480);
    odrive.endpoints['axis0.commutation_mapper.config.use_index_gpio'].set(true);
    odrive.endpoints['axis0.pos_vel_mapper.config.use_index_gpio'].set(true);
    odrive.endpoints['config.gpio4_mode'].set(0);
    odrive.endpoints['axis0.pos_vel_mapper.config.index_gpio'].set(4);
    odrive.endpoints['axis0.pos_vel_mapper.config.index_offset'].set(0);
    odrive.endpoints['axis0.commutation_mapper.config.index_gpio'].set(4);
    odrive.endpoints['axis0.pos_vel_mapper.config.index_offset_valid'].set(true);
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
(async () => {
    const temperature = await odrive1.endpoints["thermistor0"].get();
    console.log(temperature);
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }));
    forEachController(initOdrive);
    // forEachController(async (odrive) => {
    odrive2.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" });
    odrive2.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'POS_FILTER' });
    await odrive2.expect(generated_api_1.Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in idle');
    for (let i = 0; i < 200; i++) {
        odrive2.sendSetInputPos({ inputPos: 415, torqueFf: 0, velFf: 0 });
        await odrive2.expect(generated_api_1.Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - 415) < 0.05, 'Did not go to trajectory', 10000);
        odrive2.sendSetInputPos({ inputPos: 420, torqueFf: 0, velFf: 0 });
        await odrive2.expect(generated_api_1.Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - 420) < 0.05, 'Did not go to trajectory', 10000);
        console.log(await odrive2.endpoints["axis0.pos_estimate"].get(), await odrive2.endpoints["axis0.controller.input_pos"].get());
    }
    // })
})();
process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}));
});
