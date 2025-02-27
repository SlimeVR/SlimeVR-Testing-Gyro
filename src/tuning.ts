import * as can from "socketcan";
import { number, confirm } from '@inquirer/prompts';

import { initOdriveApi } from "./api-generator/odrive-api";
import { apiFunctions, Packets } from "./generated-api";
import { writeFile } from "fs/promises";
import assert from "assert";

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
    odrive.endpoints['axis0.config.motor.phase_resistance'].set(0.037)
    odrive.endpoints['axis0.controller.config.vel_limit'].set(4)
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(4)
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(10)
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(10)
}

const currents = [10, 5, 5]
const currentLimit = (odrive: Odrive, current: number) => {
    odrive.endpoints['config.dc_max_positive_current'].set(current)
    odrive.endpoints['config.dc_max_negative_current'].set(-12)
}

process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}))
});

process.on('unhandledRejection', (error, p) => {
    console.error(error);
    forEachController((odrive) => odrive.sendEstop({}))
});

(async () => {
    const selectedOdrive = await number({ message: 'Select the Odrive you want to tune' });
    const odrive = odrives[selectedOdrive - 1];
    if (!odrive)
        throw 'invalid odrive selected'
    odrive.sendClearErrors({ identify: 0 })
    initOdrive(odrive)
    currentLimit(odrive, currents[selectedOdrive - 1])
    odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" })
    await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
    odrive.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'TRAP_TRAJ' })
    odrive.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" })
    await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in closed loop', 10_000);

    odrive.endpoints['axis0.controller.config.vel_integrator_gain'].set(0);
    assert(await odrive.endpoints['axis0.controller.config.vel_integrator_gain'].get() === 0, 'not to 0');
    odrive.endpoints['axis0.controller.config.vel_gain'].set(0.1);
    odrive.endpoints['axis0.controller.config.pos_gain'].set(1);

    let pos = 0;
    let tuned = false
    do {
        odrive.sendSetInputPos({ inputPos: pos++, torqueFf: 0, velFf: 0 })
        const current_vel_gain = await odrive.endpoints['axis0.controller.config.vel_gain'].get()
        odrive.endpoints['axis0.controller.config.vel_gain'].set(current_vel_gain * 1.3);
        console.log(`New vel_gain ${current_vel_gain} -> ${current_vel_gain * 1.3}`)
        if (await confirm({ message: 'Is the motor buzzing?' }))
            tuned = true;
    } while (!tuned)

    const current_vel_gain = await odrive.endpoints['axis0.controller.config.vel_gain'].get()
    odrive.endpoints['axis0.controller.config.vel_gain'].set(current_vel_gain / 2);
    console.log(`Final vel_gain ${current_vel_gain} -> ${current_vel_gain / 2}`)

    tuned = false
    do {
        odrive.sendSetInputPos({ inputPos: pos++, torqueFf: 0, velFf: 0 })
        const current_pos_gain = await odrive.endpoints['axis0.controller.config.pos_gain'].get()
        odrive.endpoints['axis0.controller.config.pos_gain'].set(current_pos_gain * 1.3);
        console.log(`New vel_gain ${current_pos_gain} -> ${current_pos_gain * 1.3}`)
        if (await confirm({ message: 'Is the controller overshooting?' }))
            tuned = true;
    } while (!tuned)

    const current_pos_gain = await odrive.endpoints['axis0.controller.config.pos_gain'].get()
    odrive.endpoints['axis0.controller.config.pos_gain'].set(current_pos_gain * 0.7);
    console.log(`New pos_gain ${current_pos_gain} -> ${current_pos_gain * 0.7}`)

    console.log(`Set integrator gain to ${current_vel_gain}`)
    odrive.endpoints['axis0.controller.config.vel_integrator_gain'].set(current_vel_gain);

    console.log('saving configuration')
    odrive.sendSetAxisState({ axisRequestedState: "IDLE" })
    await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'IDLE', 'Axis not in idle', 10_000);
    odrive.sendReboot({ action: "save_configuration" })
    channel.stop()
})()

