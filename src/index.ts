import { Message } from "*can.node";
import * as can from "socketcan";
import { decodePacket, DownlinkPackets, encodePacket, PacketType, SetHome } from "./packets";
import { fromEvent, Subject, timeout, firstValueFrom, throwError, of, Observable } from 'rxjs';
import { filter, map, take, catchError } from 'rxjs/operators';

const channel = can.createRawChannel("can0", true);

// Create an observable for CAN messages
const message$ = new Observable<Message>((subscriber) => {
  channel.addListener("onMessage", (msg: Message) => {
    subscriber.next(msg);
  });
});

// Subject to track sent messages and their corresponding responses
const responseSubject = new Subject<Message>();

// Subscribe to messages and push them to the subject
message$.subscribe((msg: Message) => {
  // console.log(`Received message from device(${msg.id}):`, decodePacket(msg.id, msg.data));
  responseSubject.next(msg);  // Push received message to the subject
});

const sendMessage = async <T extends DownlinkPackets>(device: number, data: T) => {
  const encodedData = encodePacket(device, data);

  // Send the packet
  channel.send({ id: device, data: encodedData, ext: false, rtr: false });
  console.log(`Sent packet to device(${device})`);

  // Wait for a confirmation response with a timeout
  try {
    const response = await firstValueFrom(
      responseSubject.pipe(
        filter((msg: Message) => msg.id === device),  // Filter messages by device ID
        take(1),                                      // Take the first matching message
        timeout(2000),                                // Timeout if no response within 2 seconds
        catchError(() => throwError(() => new Error(`Timeout waiting for response from device(${device})`)))
      )
    );

    console.log(`Confirmation received from device(${device}):`, decodePacket(response.id, response.data));
  } catch (err) {
    console.error(err);
  }
};

const initMotor = async (device: number, current: number) => {
  await sendMessage(device, { id: PacketType.SetWorkMode, mode: 'SR_OPEN' });
  await sendMessage(device, { id: PacketType.WorkingCurrent, ma: current });
  await sendMessage(device, { id: PacketType.HoldingCurrentParcent, holdMa: 8 })
  await sendMessage(device, { id: PacketType.Mplyer, enable: true })
  await sendMessage(device, { id: PacketType.Protect, enable: true })
  await sendMessage(device, { id: PacketType.ReadShaftProtection, protected: true })
  await sendMessage(device, { id: PacketType.Enable, enable: 'low' })
  await sendMessage(device, { id: PacketType.Subdivision, micstep: 16 })
  await sendMessage(device, { id: PacketType.SetMode0, enable: true, dir: 'cw', mode_0: 'near_mode', speed: 1 })
}

// Start the CAN channel
channel.start();

const sleep = async (time: number) => new Promise<boolean>((resolve, reject) => setTimeout(() => resolve(true), time));

// Send messages and handle responses
(async () => {
  await initMotor(1, 2000)
  await initMotor(2, 1500)
  // await initMotor(3)

  for (var i = 0; i < 200; i++) {
    await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: (0x2000 / 360) * 20, accel: 1, speed: 10 })
    await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: (0x2000 / 360) * 20, accel: 1, speed: 10 })
    // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: 0x2000 * 4, accel: 10, speed: 30 })
    // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: 0x2000 * 20, accel: 20, speed: 30 })
    // await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: -5000, accel: 20, speed: 40 })
    // await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: 1000, accel: 1, speed: 1 })
    await sleep(1000);
    await sendMessage(1, { id: PacketType.AbsoluteMotionAxis, absAxis: -(0x2000 / 360) * 20, accel: 1, speed: 10 })
    await sendMessage(2, { id: PacketType.AbsoluteMotionAxis, absAxis: -(0x2000 / 360) * 20, accel: 1, speed: 10 })
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