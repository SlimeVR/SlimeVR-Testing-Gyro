"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const sendMessage = async <T extends DownlinkPackets>(device: number, data: T) => {
//     const encodedData = encodePacket(device, data);
//     // Send the packet
//     channel.send({ id: device, data: encodedData, ext: false, rtr: false });
//     console.log(`Sent packet to device(${device})`);
//     // Wait for a confirmation response with a timeout
//     try {
//         const response = await firstValueFrom(
//             responseSubject.pipe(
//                 filter((msg: Message) => msg.id === device),  // Filter messages by device ID
//                 take(1),                                      // Take the first matching message
//                 timeout(2000),                                // Timeout if no response within 2 seconds
//                 catchError(() => throwError(() => new Error(`Timeout waiting for response from device(${device})`)))
//             )
//         );
//         console.log(`Confirmation received from device(${device}):`, decodePacket(response.id, response.data));
//     } catch (err) {
//         console.error(err);
//     }
// };
