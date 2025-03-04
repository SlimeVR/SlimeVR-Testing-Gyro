import { decodeOutgoingServerMessage, encodeOutgoingClientMessage, OutgoingClientMessage, OutgoingServerMessage, OutgoingServerMessageTypeMap, OutgoingServerMessageTypes } from "@slimevr/gyro-ws";
import { Socket, io } from "socket.io-client";

export interface SocketInputs {
    request: (data: ArrayBuffer, cb?: (data: ArrayBufferLike) => void) => void;
}

export type MessageEvent = {
    res: OutgoingServerMessage['data'];
    reply: (msg: OutgoingClientMessage['data']) => void;
}

const getWsApiUrl = () => {
    const url = new URL(window.origin);
    const baseUrl = `${url.hostname}:3000`;
    return baseUrl;
}

export const createWebsocketClient = () => {
    const socket: Socket<SocketInputs> = io(getWsApiUrl(), { transports: ['websocket'] });
    const eventlistener = new EventTarget();

    const send = (msg: OutgoingClientMessage['data']) => {
        socket.send("request", encodeOutgoingClientMessage({ data: msg }))
    };

    const sendWithAck = async (msg: OutgoingClientMessage['data']) => {
        const res = await socket.timeout(5000).emitWithAck("request", encodeOutgoingClientMessage({ data: msg }))
        return decodeOutgoingServerMessage(new Uint8Array(res)).data;
    };

    const close = () => {
        socket.close();
    }

    socket.on('connect', () => {
        console.log('Connected')
    })

    socket.on('request', (data: ArrayBuffer, cb) => {
        const res = decodeOutgoingServerMessage(new Uint8Array(data));

        const reply = (msg: OutgoingClientMessage['data']) => {
            if (cb) cb(encodeOutgoingClientMessage({ data: msg }).buffer)
            else send(msg);
        }

        eventlistener.dispatchEvent(new CustomEvent<MessageEvent>(res.data.type, {
            detail: { res: res.data, reply }
        }));
    })

    socket.on('disconnect', (reason) => {
        console.error(reason);
    })

    return {
        socket,
        close,
        send,
        sendWithAck,
        onMessage: <T extends OutgoingServerMessageTypes>(type: T, cb: (data: OutgoingServerMessageTypeMap[T]) => void | OutgoingClientMessage['data']): { destroy: () => void } => {
            const internalCb = (ev: CustomEventInit<MessageEvent>) => {
                if (!ev.detail)
                    return;
                const res = cb(ev.detail.res as OutgoingServerMessageTypeMap[typeof type]);
                if (res) ev.detail.reply(res)
            };

            eventlistener.addEventListener(type, internalCb)
            return {
                destroy() {
                    eventlistener.removeEventListener(type, internalCb)
                },
            }
        }
    }
}