import * as can from "socketcan";
import { Message } from '*can.node'
import home_calibration from '../home-calibration.json';

import { getCmdId, getNodeId, initOdriveApi } from "./api-generator/odrive-api";
import { apiFunctions, HeartbeatMessage, inboundPacketsMap, Packets } from "./generated-api";

const simulateCircularMotion = true;

const channel = can.createRawChannel("can0", true);
channel.start();

const odriveApi = initOdriveApi(channel);
const odrive1 = apiFunctions(odriveApi, 1);
const odrive2 = apiFunctions(odriveApi, 2);
const odrive3 = apiFunctions(odriveApi, 3);
const odrives = [odrive1, odrive2, odrive3];

type Odrive = typeof odrives[0];

const sleep = (time: number) => new Promise(resolve => setTimeout(() => resolve(true), time));
const forEachController = async (call: (odrive: typeof odrive1) => Promise<void> | void) => {
    for (const odrive of odrives) {
        await call(odrive);
    }
}

const currentLimit = (odrive: Odrive, current: number) => {
    odrive.endpoints['config.dc_max_positive_current'].set(current)
    odrive.endpoints['config.dc_max_negative_current'].set(-12)
}

const initOdrive = async (odrive: Odrive) => {
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(10)
    odrive.endpoints['axis0.config.motor.phase_resistance'].set(0.037)
    odrive.endpoints['axis0.controller.config.vel_limit'].set(3)
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(3)
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(10)
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(10)
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

const goToRaw = async (odrive: Odrive, encoder_raw: number, timeout = 2000) => {
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 })
    await odrive.expect(Packets.GetEncoderEstimates, (encoder) => Math.abs(encoder.posEstimate - encoder_raw) % (Math.PI * 2) < 0.05, `Did not go to rot (raw), expected ${encoder_raw}`, timeout)
}

const goToAngle = async (axis: 0 | 1 | 2, angle: number) => {
    await goToRaw(odrives[axis], angle / (Math.PI * 2) + home_calibration[axis], 10000);
}


const goToAngles = async ({ x, y, z }: { x: number; y: number; z: number }) => {
    await Promise.all([
        goToAngle(2, z),
        goToAngle(1, y),
        goToAngle(0, x)
    ])
}

const goToHome = async () => {
    await Promise.all(odrives.map((odrive, index) => goToRaw(odrive, home_calibration[index], 10_000)))
}


const degToRad = (degrees: number) => (degrees * Math.PI) / 180;



(async () => {
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }))
    forEachController(initOdrive)
    currentLimit(odrive1, 7)
    currentLimit(odrive2, 7)
    currentLimit(odrive3, 7)
    await Promise.all(odrives.map(async (odrive) => {
        odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" })
        await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
        odrive.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'TRAP_TRAJ' })
        odrive.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" })
        await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in closed loop', 10_000);
    }))
    console.log('Going home~')
    await goToHome();
    console.log('Having fun~')

    for (let i = 0; i < 200; i++) {
        await sleep(1000)
        await goToAngles({x: degToRad(90), y: degToRad(90), z: degToRad(0)});
        await sleep(1000)
        await goToAngles({x: degToRad(90), y: degToRad(90), z: degToRad(90)});
        await sleep(1000)
        await goToAngles({x: degToRad(90), y: degToRad(90), z: degToRad(180)});
        await sleep(1000)
        await goToAngles({x: degToRad(90), y: degToRad(90), z: degToRad(270)});
    }

    /*
    for (let i = 0; i < 200; i++) {
        await goToHome();
        await sleep(1000)
        await goToAngles({ x: degToRad(90), y: degToRad(90), z: degToRad(90) })
        await sleep(1000)

    }*/
    console.log('DONE')
})();


process.on('SIGINT', function () {
    forEachController((odrive) => odrive.sendEstop({}))
});

process.on('unhandledRejection', (error, p) => {
    console.error(error);
    forEachController((odrive) => odrive.sendEstop({}))
});