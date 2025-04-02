import * as can from "socketcan"
import { Message } from '*can.node'
import home_calibration from '../home-calibration.json'

import { getCmdId, getNodeId, initOdriveApi } from "./api-generator/odrive-api"
import { apiFunctions, GetEncoderEstimatesMessage, HeartbeatMessage, inboundPacketsMap, Packets } from "./generated-api"
import { createSever, PacketHandshakeBuilder, PacketReturnType, PacketRotationData, PacketRotationDataBuilder } from "./udp-server"
import { Quaternion, Euler } from 'three'
import util from "node:util"
import { createWebsocketConnection, createWebsocketServer } from "./websockets"
import { debounce, debounceTime, Subject } from "rxjs"
import { confirm } from '@inquirer/prompts';

const startGyro = true
const simulateCircularMotion = true
const targetPrecision = 0.01

const angleSubject = new Subject<{ x: number; y: number; z: number }>();


const channel = can.createRawChannel("can0", true)
channel.start()

const odriveApi = initOdriveApi(channel)
const odrive1 = apiFunctions(odriveApi, 1)
const odrive2 = apiFunctions(odriveApi, 2)
const odrive3 = apiFunctions(odriveApi, 3)
const odrives = [odrive1, odrive2, odrive3]
const positions = [0, 0, 0]
const angles = [0, 0, 0]
const lastSentPosition = [0, 0, 0]

interface AxisState {
    targetAngle: number,
    targetDiff: number,
    targetCircularPosition: number,
    targetPosition: number
}

const axisStates: AxisState[] = Array.from({ length: 3 }, () => ({targetAngle: 0, targetDiff: 0, targetCircularPosition: 0, targetPosition: 0}))

type Odrive = typeof odrives[0]

const sleep = (time: number) => new Promise(resolve => setTimeout(() => resolve(true), time))
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
    odrive.endpoints['axis0.config.can.encoder_msg_rate_ms'].set(5)
    odrive.endpoints['axis0.config.motor.phase_resistance'].set(0.037)
    odrive.endpoints['axis0.controller.config.vel_limit'].set(4)
    odrive.endpoints['axis0.trap_traj.config.vel_limit'].set(4)
    odrive.endpoints['axis0.trap_traj.config.accel_limit'].set(10)
    odrive.endpoints['axis0.trap_traj.config.decel_limit'].set(10)
}

channel.addListener('onMessage', (msg: Message) => {
    const cmdId = getCmdId(msg.id)
    const nodeId = getNodeId(msg.id)
    const inPacket = inboundPacketsMap[cmdId as keyof typeof inboundPacketsMap]
    if (!inPacket) {
        throw 'Invalid packet id ${cmdId}'
    }
    const res = inPacket(msg.data)
    if (cmdId === Packets.Heartbeat) {
        const hearbeat = res as HeartbeatMessage
        if (hearbeat.axisError !== 'NONE') {
            forEachController((odrive) => odrive.sendEstop({}))
            throw { nodeId, error: hearbeat.axisError }
        }
    } else if (cmdId == Packets.GetEncoderEstimates) {
        const encoderEstimates = res as GetEncoderEstimatesMessage
        positions[nodeId - 1] = encoderEstimates.posEstimate;
    } else {
    }
});

const wrapToCircle = (num: number) => {
    return num - Math.trunc(num);
}

const isInPosition = (currentPosition: number, expectedPosition: number) => {
    return Math.abs(currentPosition - expectedPosition) < targetPrecision
}

const goToRaw = async (axis: number, encoder_raw: number, timeout = 2000) => {
    if (!startGyro)
        return
    const odrive = odrives[axis]
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 })
    await odrive.expect(Packets.GetEncoderEstimates, (encoder) => isInPosition(encoder.posEstimate, encoder_raw), `Did not go to rot (raw), expected ${encoder_raw}, got ${positions[axis]}, axis ${axis}`, timeout)
}

const sendToRaw = (axis: number, encoder_raw: number) => {
    if (!startGyro)
        return
    const odrive = odrives[axis]
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 })
}

const updateConsole = () => {
    // TODO Display all 3 axis state
    process.stdout.moveCursor(0, -3)
    for(var axis = 0; axis < 3; ++axis) {
        process.stdout.cursorTo(0)
        process.stdout.clearLine(0)
        process.stdout.write(util.format('Axis %d going to %s (%s), diff %s, target circular pos %s, target absolute pos %s\n',
            axis, axisStates[axis].targetAngle.toFixed(2), radToDeg(axisStates[axis].targetAngle).toFixed(2),
            axisStates[axis].targetDiff.toFixed(4), axisStates[axis].targetCircularPosition.toFixed(4), axisStates[axis].targetPosition.toFixed(4)))
    }
}

const goToAngle = async (axis: 0 | 1 | 2, angle: number, wait = true) => {
    angles[axis] = angle
    var circularPosition = angle / (Math.PI * 2)
    if (circularPosition < 0 || circularPosition > 1) {
        console.log('Axis %d can\'t go to angle %d (%d), violates circularity at %d', axis, angle.toFixed(4), radToDeg(angle).toFixed(2), circularPosition.toFixed(4))
        return
    }
    if (simulateCircularMotion) {
        const currentAngle = wrapToCircle(lastSentPosition[axis])
        var diff = circularPosition - currentAngle
        if (diff < -0.5)
            diff += 1
        const targetPosition = lastSentPosition[axis] + diff
        axisStates[axis] = {targetAngle: angle, targetCircularPosition: circularPosition, targetDiff: diff, targetPosition: targetPosition}
        updateConsole()
        circularPosition = targetPosition
        lastSentPosition[axis] = targetPosition
    }

    if (wait)
        await goToRaw(axis, circularPosition, 10000)
    else
        sendToRaw(axis, circularPosition)
    // TODO axis mismatch
    angleSubject.next({ x: angles[2], y: angles[1], z: angles[0] });
}



const goToAngles = async ({ x, y, z }: { x: number; y: number; z: number }, wait = true) => {
    await Promise.all([
        goToAngle(0, y, wait),
        goToAngle(1, z, wait),
        goToAngle(2, x, wait)
    ])
}

const goToHome = async () => {
    await Promise.all(odrives.map((odrive, index) => sendToRaw(index, home_calibration[index])))
    positions.forEach((v, i) => positions[i] = 0)
    lastSentPosition.forEach((v, i) => lastSentPosition[i] = 0)
}

const degToRad = (degrees: number) => (degrees * Math.PI) / 180;
const radToDeg = (rad: number) => rad * 180 / Math.PI;

const AXIS_OFFSET = new Quaternion().setFromAxisAngle({ x: -1, y: 0, z: 0 }, Math.PI / 2);


const wsServer = createWebsocketServer();

wsServer.server.on('connection', (socket) => {
    console.log("new socket connection")
    const { send, onMessage } = createWebsocketConnection(socket);

    angleSubject
        // .pipe(debounceTime(10)) // just an example / can be removed
        .subscribe((angles) => {
            send({ type: 'server/gyro/angles', angles })
        })

    onMessage('client/gyro/angles', ({ angles }) => {
        console.log('received angle command from frontent', angles)
    })
});

(async () => {
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }))
    if (startGyro) {
        forEachController(initOdrive)
        currentLimit(odrive1, 8)
        currentLimit(odrive2, 8)
        currentLimit(odrive3, 8)
        await Promise.all(odrives.map(async (odrive) => {
            odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" })
            await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
        }))
        //console.log('Going home~')
        //await goToHome();
        
        const answer = await confirm({ message: 'Place the jig in the home position and press Enter' });
        if (!answer) throw 'aborted'
        forEachController((odrive) => odrive.endpoints['axis0.pos_estimate'].set(0))
        await Promise.all(odrives.map(async (odrive) => {
            odrive.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'TRAP_TRAJ' })
            odrive.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" })
            await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in closed loop', 10_000);
        }))

        console.log('Having fun~')
    }

    const server = createSever(6969, '0.0.0.0');

    var lastUpdateTime = Date.now()

    server.onPacketReceived<typeof PacketRotationDataBuilder>(PacketRotationDataBuilder.id, {
        onPacket: (rinfo, packet) => {
            if (packet.sensorId == 0 && packet.dataType == 1) {
                const time = Date.now()
                //if (time - lastUpdateTime > 100) {
                    lastUpdateTime = time
                    const quat = new Quaternion(packet.rotation.x, packet.rotation.y, packet.rotation.z, packet.rotation.w)
                    const ofseted = AXIS_OFFSET.clone().multiply(quat)
                    const euler = new Euler().setFromQuaternion(ofseted, "YZX")
                    goToAngles({ x: Math.PI - euler.x, y: Math.PI - euler.y, z: Math.PI - euler.z }, false)
               //}
            }
        }
    })

    server.onPacketReceived<typeof PacketHandshakeBuilder>(PacketHandshakeBuilder.id, {
        onPacket: (rinfo, packet) => {
            server.sendPacket(PacketHandshakeBuilder, {} as never, rinfo.address, rinfo.port)
        }
    })


    console.log('DONE')
})();