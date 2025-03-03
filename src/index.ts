import * as can from "socketcan"
import { Message } from '*can.node'
import home_calibration from '../home-calibration.json'

import { getCmdId, getNodeId, initOdriveApi } from "./api-generator/odrive-api"
import { apiFunctions, GetEncoderEstimatesMessage, HeartbeatMessage, inboundPacketsMap, Packets } from "./generated-api"
import { createSever, PacketHandshakeBuilder, PacketReturnType, PacketRotationData, PacketRotationDataBuilder } from "./udp-server"
import { Quaternion, Euler } from 'three'


const simulateCircularMotion = true
const targetPrecision = 0.01

const channel = can.createRawChannel("can0", true)
channel.start()

const odriveApi = initOdriveApi(channel)
const odrive1 = apiFunctions(odriveApi, 1)
const odrive2 = apiFunctions(odriveApi, 2)
const odrive3 = apiFunctions(odriveApi, 3)
const odrives = [odrive1, odrive2, odrive3]
const positions = [0, 0, 0]

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
        throw 'invalid id'
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
    const odrive = odrives[axis]
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 })
    await odrive.expect(Packets.GetEncoderEstimates, (encoder) => isInPosition(encoder.posEstimate, encoder_raw), `Did not go to rot (raw), expected ${encoder_raw}, got ${positions[axis]}`, timeout)
}

const sendToRaw = (axis: number, encoder_raw: number) => {
    const odrive = odrives[axis]
    odrive.sendSetInputPos({ inputPos: encoder_raw, torqueFf: 0, velFf: 0 })
}

const goToAngle = async (axis: 0 | 1 | 2, angle: number, wait = true) => {
    var circularPosition = angle / (Math.PI * 2)
    if(circularPosition < 0 || circularPosition > 1) {
        console.log('Axis %d can\'t go to angle %d (%d), violates circularity at %d', axis, angle.toFixed(4), radToDeg(angle).toFixed(2), circularPosition.toFixed(4))
        return
    }
    if (simulateCircularMotion) {
        const currentAngle = wrapToCircle(positions[axis])
        var diff = circularPosition - currentAngle
        if (diff < -0.5)
            diff += 1
        console.log('Axis %d going to %s (%s), target pos %s', axis, angle.toFixed(2), radToDeg(angle).toFixed(2), circularPosition.toFixed(4))
        circularPosition = positions[axis] + diff
    }
   // if (wait)
    //    await goToRaw(axis, circularPosition, 10000)
    //else
   //     sendToRaw(axis, circularPosition)
}

const goToAngles = async ({ x, y, z }: { x: number; y: number; z: number }, wait = true) => {
    await Promise.all([
        goToAngle(2, z, wait),
        goToAngle(1, y, wait),
        goToAngle(0, x, wait)
    ])
}

const goToHome = async () => {
    await Promise.all(odrives.map((odrive, index) => goToRaw(index, home_calibration[index], 10_000)))
    positions.forEach((v, i) => positions[i] = 0)
}

const degToRad = (degrees: number) => (degrees * Math.PI) / 180;
const radToDeg = (rad: number) => rad * 180 / Math.PI;

const AXIS_OFFSET = new Quaternion().setFromAxisAngle({ x: -1, y: 0, z: 0 }, Math.PI / 2);

(async () => {
    //console.log(AXIS_OFFSET)
    forEachController((odrive) => odrive.sendClearErrors({ identify: 0 }))
    forEachController(initOdrive)
    currentLimit(odrive1, 8)
    currentLimit(odrive2, 8)
    currentLimit(odrive3, 8)
    await Promise.all(odrives.map(async (odrive) => {
        odrive.sendSetAxisState({ axisRequestedState: "ENCODER_INDEX_SEARCH" })
        await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.procedureResult === 'SUCCESS', 'Did not finish encoder index', 10_000);
        odrive.sendSetControllerMode({ controlMode: 'POSITION_CONTROL', inputMode: 'TRAP_TRAJ' })
        odrive.sendSetAxisState({ axisRequestedState: "CLOSED_LOOP_CONTROL" })
        await odrive.expect(Packets.Heartbeat, (heartbeat) => heartbeat.axisState === 'CLOSED_LOOP_CONTROL', 'Axis not in closed loop', 10_000);
    }))
    console.log('Going home~')
    await goToHome(); console.log('Having fun~')

    const server = createSever(6969, '0.0.0.0');

    var lastUpdateTime = Date.now()

    server.onPacketReceived<typeof PacketRotationDataBuilder>(PacketRotationDataBuilder.id, {
        onPacket: (rinfo, packet) => {
            if (packet.sensorId == 0 && packet.dataType == 1) {
                const time = Date.now()
                if (time - lastUpdateTime > 100) {
                    lastUpdateTime = time
                    const quat = new Quaternion(packet.rotation.x, packet.rotation.y, packet.rotation.z, packet.rotation.w)
                    const ofseted = AXIS_OFFSET.clone().multiply(quat)
                    const euler = new Euler().setFromQuaternion(ofseted)
                    console.log('Angles: %s, %s, %s', radToDeg(euler.x).toFixed(2), radToDeg(euler.y).toFixed(2), radToDeg(euler.z).toFixed(2))
                    //goToAngles({ x: euler.y, y: euler.z, z: euler.x }, false)
                    goToAngle(0, euler.y + Math.PI, false)
                }
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