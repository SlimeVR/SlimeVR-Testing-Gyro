import { Message } from "*can.node";
import { catchError, filter, firstValueFrom, map, Observable, Subject, take, throwError, timeout } from "rxjs";
import * as can from "socketcan";

type RawChannel = ReturnType<typeof can.createRawChannel>;

export type Endpoint<T> = { set: (value: T) => void, get: () => Promise<T> }

export interface OdriveAPI {
    responseSubject: Subject<Message>
    channel: RawChannel,
}

export const getCmdId = (canid: number) => canid & 0x1F
export const getNodeId = (canid: number) => canid >> 5

export async function expectResponse<T>(api: OdriveAPI, inboundPacketsMap: Record<number, Function>, can_id: number): Promise<T> {
    const response = await firstValueFrom(
        api.responseSubject.pipe(
            filter((msg: Message) => msg.id === can_id),
            take(1),
            timeout(2000),
            catchError(() => throwError(() => new Error(`Timeout waiting for response`)))
        )
    );

    const cmdId = getCmdId(response.id);
    const inPacket = inboundPacketsMap[cmdId as keyof typeof inboundPacketsMap];
    if (!inPacket) {
        throw 'invalid id'
    }
    return inPacket(response.data);
};

export async function waitForResponse<T>(api: OdriveAPI, inboundPacketsMap: Record<number, Function>, can_id: number): Promise<T | null> {
    return expectResponse<T>(api, inboundPacketsMap, can_id).catch(() => null)
};


export async function waitForCondition<T>(api: OdriveAPI, inboundPacketsMap: Record<number, Function>, node_id: number, cmd_id: number, condition: (res: T) => boolean, t: number = 2000): Promise<null | T> {
    try {
        const can_id = node_id << 5 | cmd_id;
        return await firstValueFrom(
            api.responseSubject.pipe(
                filter((msg: Message) => msg.id === can_id),
                map((msg) => {
                    const cmdId = getCmdId(msg.id);
                    const inPacket = inboundPacketsMap[cmdId as keyof typeof inboundPacketsMap];
                    if (!inPacket) {
                        throw 'invalid id'
                    }
                    return inPacket(msg.data);
                }),
                filter((packet: T) => condition(packet)),
                take(1),
                timeout(t),
                catchError(() => throwError(() => new Error(`Timeout waiting for response`)))
            )
        );
    } catch (err) {
        return null;
    }
}

export function valueToEndpointType(value: number, type: 'float' | 'uint' | 'int' | 'boolean') {
    if (type === 'float') {
        var sign = (value & 0x80000000) ? -1 : 1;
        var exponent = ((value >> 23) & 0xFF) - 127;
        var significand = (value & ~(-1 << 23));

        if (exponent == 128)
            return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

        if (exponent == -127) {
            if (significand == 0) return sign * 0.0;
            exponent = -126;
            significand /= (1 << 22);
        } else significand = (significand | (1 << 23)) / (1 << 23);

        return sign * significand * Math.pow(2, exponent);
    }

    if (type === 'boolean') {
        return value === 1 ? true : false
    }

    return value;
}

export function typedToEndpoint(value: number | boolean, type: 'float' | 'uint' | 'int' | 'boolean') {
    if (typeof value === 'boolean')
        return value ? 1 : 0;
    if (typeof value === 'number' && type === 'float') {
        var bytes = 0;
        switch (value) {
            case Number.POSITIVE_INFINITY: bytes = 0x7F800000; break;
            case Number.NEGATIVE_INFINITY: bytes = 0xFF800000; break;
            case +0.0: bytes = 0x40000000; break;
            case -0.0: bytes = 0xC0000000; break;
            default:
                if (Number.isNaN(value)) { bytes = 0x7FC00000; break; }

                if (value <= -0.0) {
                    bytes = 0x80000000;
                    value = -value;
                }

                var exponent = Math.floor(Math.log(value) / Math.log(2));
                var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;

                exponent += 127;
                if (exponent >= 0xFF) {
                    exponent = 0xFF;
                    significand = 0;
                } else if (exponent < 0) exponent = 0;

                bytes = bytes | (exponent << 23);
                bytes = bytes | (significand & ~(-1 << 23));
                break;
        }
        return bytes;
    }
    return value;
}

export function initOdriveApi(channel: RawChannel): OdriveAPI {
    const message$ = new Observable<Message>((subscriber) => {
        channel.addListener("onMessage", (msg: Message) => {
            subscriber.next(msg);
        });
    });

    // Subject to track sent messages and their corresponding responses
    const responseSubject = new Subject<Message>();

    // Subscribe to messages and push them to the subject
    message$.subscribe((msg: Message) => responseSubject.next(msg));

    return {
        responseSubject,
        channel,
    }
}