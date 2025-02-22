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
const odrive = (0, generated_api_1.apiFunctions)(odriveApi);
const waitFor = async (node_id, cmd_id, condition, timeout = 2000) => {
    return (0, odrive_api_1.waitForCondition)(odriveApi, generated_api_1.inboundPacketsMap, node_id, cmd_id, condition, timeout);
};
const expect = async (node_id, cmd_id, condition, error, timeout = 2000) => {
    if (!await waitFor(node_id, cmd_id, condition, timeout))
        throw error;
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
        if (hearbeat.axisError !== 'NONE')
            throw { nodeId, error: hearbeat.axisError };
    }
    else {
        console.log(res);
    }
});
const sleep = (time) => new Promise(resolve => setTimeout(() => resolve(true), time));
const forEachController = async (call) => {
    for (let i = 0; i < 3; i++) {
        await call(i + 1);
    }
};
(async () => {
    // odrive.sendSetControllerMode(1, { controlMode: 'POSITION_CONTROL', inputMode: 'PASSTHROUGH' });
    // odrive.sendSetAxisState(1, { axisRequestedState: "ENCODER_INDEX_SEARCH" })
    // await expect(1, Packets.Heartbeat, (hearbeat) => hearbeat.axisState === 'IDLE' && hearbeat.procedureResult === 'SUCCESS', 'Encoder calibration', 20_000)
    // odrive.sendSetAxisState(1, { axisRequestedState: "CLOSED_LOOP_CONTROL" })
    // await expect(1, Packets.Heartbeat, (hearbeat) => hearbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Not in closed loop')
    // odrive.sendSetAxisState(1, { axisRequestedState: "IDLE" })
    // const newPos = Math.random() * (Math.PI * 2);
    // odrive.sendSetInputVel(1, { inputVel: 1, inputTorqueFf: 0 })
    // odrive.sendSetAbsolutePosition(1, { position: newPos })
    // await expect(1, Packets.Heartbeat, (hearbeat) => hearbeat.procedureResult === 'SUCCESS', 'trajectory not done')
    // console.log('DONE')
    // throw 'end'
    forEachController((node_id) => {
        odrive.sendClearErrors(node_id, { identify: 0 });
    });
    await forEachController(async (node_id) => {
        odrive.sendSetControllerMode(node_id, { controlMode: 'VELOCITY_CONTROL', inputMode: 'PASSTHROUGH' });
        odrive.sendSetAxisState(node_id, { axisRequestedState: "IDLE" });
        await expect(node_id, generated_api_1.Packets.Heartbeat, (hearbeat) => hearbeat.axisState === 'IDLE', 'Not in idle');
    });
    // await forEachController(async (node_id) => {
    //     odrive.sendSetControllerMode(node_id, { controlMode: 'VELOCITY_CONTROL', inputMode: 'PASSTHROUGH' });
    //     odrive.sendSetAxisState(node_id, { axisRequestedState: "CLOSED_LOOP_CONTROL" })
    //     await expect(node_id, Packets.Heartbeat, (hearbeat) => hearbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Not in closed loop')
    // })
    // forEachController((node_id) => {
    //     odrive.sendSetInputVel(node_id, { inputVel: 0.5, inputTorqueFf: 0 })
    // })
    // await sleep(5000)
    // forEachController((node_id) => {
    //     odrive.sendSetInputVel(node_id, { inputVel: 0, inputTorqueFf: 0 })
    //     odrive.sendSetAxisState(node_id, { axisRequestedState: "IDLE" })
    // })
})();
