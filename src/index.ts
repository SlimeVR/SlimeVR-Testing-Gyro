import * as can from "socketcan";
import { Message } from '*can.node'

import { getCmdId, getNodeId, initOdriveApi } from "./api-generator/odrive-api";
import { apiFunctions, HeartbeatMessage, inboundPacketsMap, Packets } from "./generated-api";

const channel = can.createRawChannel("can0", true);
channel.start();

const odriveApi = initOdriveApi(channel);
const odrive1 = apiFunctions(odriveApi, 1);
const odrive2 = apiFunctions(odriveApi, 2);
const odrives = [odrive1, odrive2];

type Odrive = typeof odrives[0];

const sleep = (time: number) => new Promise(resolve => setTimeout(() => resolve(true), time));
const forEachController = async (call: (odrive: typeof odrive1) => Promise<void> | void) => {
    for (const odrive of odrives) {
        await call(odrive);
    }
}


const initOdrive = async (odrive: Odrive) => {
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(10)
    odrive.endpoints['config.inverter0.current_soft_max'].set(3)
    odrive.endpoints['config.inverter0.current_hard_max'].set(5)
    odrive.endpoints['axis0.controller.config.vel_limit'].set(5)
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(4)
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(20)
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(20)
    odrive.endpoints['axis0.controller.config.vel_gain'].set(10)
    odrive.endpoints['axis0.controller.config.pos_gain'].set(3)
    odrive.endpoints['axis0.controller.config.vel_integrator_gain'].set(10)
    odrive.endpoints['inc_encoder0.config.enabled'].set(true)
    odrive.endpoints['axis0.config.load_encoder'].set(1)
    odrive.endpoints['axis0.config.commutation_encoder'].set(1)
    odrive.endpoints['inc_encoder0.config.cpr'].set(20480)
    odrive.endpoints['axis0.commutation_mapper.config.use_index_gpio'].set(true)
    odrive.endpoints['axis0.pos_vel_mapper.config.use_index_gpio'].set(true)
    odrive.endpoints['config.gpio4_mode'].set(0)
    odrive.endpoints['axis0.pos_vel_mapper.config.index_gpio'].set(4)
    odrive.endpoints['axis0.pos_vel_mapper.config.index_offset'].set(0)
    odrive.endpoints['axis0.commutation_mapper.config.index_gpio'].set(4)
    odrive.endpoints['axis0.pos_vel_mapper.config.index_offset_valid'].set(true)
}

channel.addListener('onMessage', (msg: Message) => {
    const cmdId = getCmdId(msg.id);
    const nodeId = getNodeId(msg.id);
    const inPacket = inboundPacketsMap[cmdId as keyof typeof inboundPacketsMap];
    if (!inPacket) {
        throw 'invalid id'
    }
    const res = inPacket(msg.data);
    if (cmdId === Packets.Heartbeat) {
        const hearbeat = res as HeartbeatMessage;
        if (hearbeat.axisError !== 'NONE') {
            forEachController((odrive) => odrive.sendEstop({}))
            throw { nodeId, error: hearbeat.axisError }
        }
    } else {
    }
});



(async () => {
    const temperature = await odrive1.endpoints["thermistor0"].get()
    console.log(temperature)


    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }))
    forEachController(initOdrive)
    // forEachController(async (odrive) => {
    odrive2.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" })
    odrive2.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'POS_FILTER' })
    await odrive2.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in idle')
    for (let i = 0; i < 200; i++) {
        odrive2.sendSetInputPos({ inputPos: 415, torqueFf: 0, velFf: 0 })
        await odrive2.expect(Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - 415) < 0.05, 'Did not go to trajectory', 10000)
        odrive2.sendSetInputPos({ inputPos: 420, torqueFf: 0, velFf: 0 })
        await odrive2.expect(Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - 420) < 0.05, 'Did not go to trajectory', 10000)
        console.log(await odrive2.endpoints["axis0.pos_estimate"].get(), await odrive2.endpoints["axis0.controller.input_pos"].get())
    }
    // })
})();


process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}))
});