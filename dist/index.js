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
const packets_1 = require("./packets");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const channel = can.createRawChannel("can0", true);
// Create an observable for CAN messages
const message$ = new rxjs_1.Observable((subscriber) => {
    channel.addListener("onMessage", (msg) => {
        subscriber.next(msg);
    });
});
// Subject to track sent messages and their corresponding responses
const responseSubject = new rxjs_1.Subject();
// Subscribe to messages and push them to the subject
message$.subscribe((msg) => {
    // console.log(`Received message from device(${msg.id}):`, decodePacket(msg.id, msg.data));
    responseSubject.next(msg); // Push received message to the subject
});
const sendMessage = async (device, data) => {
    const encodedData = (0, packets_1.encodePacket)(device, data);
    // Send the packet
    channel.send({ id: device, data: encodedData, ext: false, rtr: false });
    console.log(`Sent packet to device(${device})`);
    // Wait for a confirmation response with a timeout
    try {
        const response = await (0, rxjs_1.firstValueFrom)(responseSubject.pipe((0, operators_1.filter)((msg) => msg.id === device), // Filter messages by device ID
        (0, operators_1.take)(1), // Take the first matching message
        (0, rxjs_1.timeout)(2000), // Timeout if no response within 2 seconds
        (0, operators_1.catchError)(() => (0, rxjs_1.throwError)(() => new Error(`Timeout waiting for response from device(${device})`)))));
        console.log(`Confirmation received from device(${device}):`, (0, packets_1.decodePacket)(response.id, response.data));
    }
    catch (err) {
        console.error(err);
    }
};
const initMotor = async (device, current) => {
    await sendMessage(device, { id: packets_1.PacketType.SetWorkMode, mode: 'SR_OPEN' });
    await sendMessage(device, { id: packets_1.PacketType.WorkingCurrent, ma: current });
    await sendMessage(device, { id: packets_1.PacketType.HoldingCurrentParcent, holdMa: 8 });
    await sendMessage(device, { id: packets_1.PacketType.Mplyer, enable: true });
    await sendMessage(device, { id: packets_1.PacketType.Protect, enable: true });
    await sendMessage(device, { id: packets_1.PacketType.ReadShaftProtection, protected: true });
    await sendMessage(device, { id: packets_1.PacketType.Enable, enable: 'low' });
    await sendMessage(device, { id: packets_1.PacketType.Subdivision, micstep: 16 });
    await sendMessage(device, { id: packets_1.PacketType.SetMode0, enable: true, dir: 'cw', mode_0: 'near_mode', speed: 1 });
};
// Start the CAN channel
channel.start();
const sleep = async (time) => new Promise((resolve, reject) => setTimeout(() => resolve(true), time));
// Send messages and handle responses
(async () => {
    await initMotor(1, 2000);
    await initMotor(2, 1500);
    // await initMotor(3)
    for (var i = 0; i < 200; i++) {
        await sendMessage(1, { id: packets_1.PacketType.AbsoluteMotionAxis, absAxis: (0x2000 / 360) * 20, accel: 1, speed: 10 });
        await sendMessage(2, { id: packets_1.PacketType.AbsoluteMotionAxis, absAxis: (0x2000 / 360) * 20, accel: 1, speed: 10 });
        // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: 0x2000 * 4, accel: 10, speed: 30 })
        // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: 0x2000 * 20, accel: 20, speed: 30 })
        // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: -5000, accel: 20, speed: 40 })
        // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: 1000, accel: 1, speed: 1 })
        await sleep(1000);
        await sendMessage(1, { id: packets_1.PacketType.AbsoluteMotionAxis, absAxis: -(0x2000 / 360) * 20, accel: 1, speed: 10 });
        await sendMessage(2, { id: packets_1.PacketType.AbsoluteMotionAxis, absAxis: -(0x2000 / 360) * 20, accel: 1, speed: 10 });
        // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: -0x2000 * 4, accel: 10, speed: 30 })
        // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: -0x2000 * 20, accel: 10, speed: 30 })
        // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: 5000, accel: 20, speed: 40 })
        // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: -1000, accel: 1, speed: 1 })
        await sleep(1000);
    }
    // await sendMessage(1, { endlimit: false, endstop: false, homeDir: 'ccw', homeSpeed: 2000, id: PacketType.SetHome });
    // await sendMessage(2, { endlimit: false, endstop: false, homeDir: 'ccw', homeSpeed: 400, id: PacketType.SetHome });
    // await sendMessage(3, { endlimit: false, endstop: false, homeDir: 'ccw', homeSpeed: 400, id: PacketType.SetHome });
    console.log("All messages sent and handled.");
})();
