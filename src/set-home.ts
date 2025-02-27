import * as can from "socketcan";
import { confirm } from '@inquirer/prompts';

import { initOdriveApi } from "./api-generator/odrive-api";
import { apiFunctions, Packets } from "./generated-api";
import { writeFile } from "fs/promises";

const channel = can.createRawChannel("can0", true);
channel.start();

const odriveApi = initOdriveApi(channel);
const odrive1 = apiFunctions(odriveApi, 1);
const odrive2 = apiFunctions(odriveApi, 2);
const odrive3 = apiFunctions(odriveApi, 3);
const odrives = [odrive1, odrive2, odrive3];

type Odrive = typeof odrives[0];

const forEachController = async (call: (odrive: typeof odrive1) => Promise<void> | void) => {
    for (const odrive of odrives) {
        await call(odrive);
    }
}


const initOdrive = async (odrive: Odrive) => {
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(10)
    odrive.endpoints['axis0.controller.config.vel_limit'].set(2)
    odrive.endpoints['axis0.controller.config.circular_setpoints'].set(true)
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(1)
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(20)
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(20)
}

process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}))
});

process.on('unhandledRejection', (error, p) => {
    console.error(error);
    forEachController((odrive) => odrive.sendEstop({}))
});

(async () => {
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }))
    forEachController(initOdrive)
    await Promise.all(odrives.map(async (odrive) => {
        odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" })
        await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
    }))


    const answer = await confirm({ message: 'Place the jig in the home position and press Enter' });
    if (!answer) throw 'aborted'

    const positions = await Promise.all(odrives.map((odrive) => odrive.endpoints['axis0.pos_estimate'].get()))
    for (let i = 0; i < positions.length; i++) {
        positions[0] = positions[i] % 1;
    }
    await writeFile('./home-calibration.json', JSON.stringify(positions, null, 2), { encoding: 'utf-8' });
    console.log(positions);
    console.log('homing calibration complete')
    channel.stop()
})()

