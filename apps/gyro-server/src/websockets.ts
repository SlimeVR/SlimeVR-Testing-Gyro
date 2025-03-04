import { decodeOutgoingClientMessage, decodeOutgoingServerMessage, encodeOutgoingClientMessage, encodeOutgoingServerMessage, OutgoingClientMessage, OutgoingClientMessageTypeMap, OutgoingClientMessageTypes, OutgoingServerMessage, OutgoingServerMessageTypeMap, OutgoingServerMessageTypes } from "@slimevr/gyro-ws";
import { Server, Socket } from "socket.io";

export interface SocketInputs {
    request: (data: ArrayBufferLike, cb?: ((data: ArrayBufferLike) => void)) => void;
}

export interface SocketInputsWithAck {
    request: (data: ArrayBufferLike, cb: ((data: ArrayBufferLike) => void)) => void;
}

export type MessageEvent = {
    res: OutgoingClientMessage['data'];
    reply: (msg: OutgoingServerMessage['data']) => void;
}

export const createWebsocketConnection = (socket: Socket<SocketInputs>) => {
    const eventlistener = new EventTarget();


    const send = (msg: OutgoingServerMessage['data']) => {
        socket.emit("request", encodeOutgoingServerMessage({ data: msg }).buffer)
    };

    const sendWithAck = async (msg: OutgoingServerMessage['data']) => {
        const res = await (socket as Socket<SocketInputsWithAck> /** FUCK YOU */).timeout(5000).emitWithAck("request", encodeOutgoingServerMessage({ data: msg }).buffer)
        return decodeOutgoingServerMessage(new Uint8Array(res)).data;
    };

    socket.on('disconnect', (reason) => {
        console.error(reason);
    })

    socket.on('request', (data: ArrayBufferLike, cb) => {
        const res = decodeOutgoingClientMessage(new Uint8Array(data));

        const reply = (msg: OutgoingServerMessage['data']) => {
            if (cb) cb(encodeOutgoingServerMessage({ data: msg }).buffer)
            else send(msg);
        }

        eventlistener.dispatchEvent(new CustomEvent<MessageEvent>(res.data.type, {
            detail: { res: res.data, reply }
        }));
    })

    return {
        socket,
        send,
        sendWithAck,
        onMessage: <T extends OutgoingClientMessageTypes>(type: T, cb: (data: OutgoingClientMessageTypeMap[T]) => void | OutgoingServerMessage['data']): { destroy: () => void } => {
            const internalCb = (ev: CustomEventInit<MessageEvent>) => {
                if (!ev.detail)
                    return;
                const res = cb(ev.detail.res as OutgoingClientMessageTypeMap[typeof type]);
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

export const createWebsocketServer = () => {
    const server: Server<SocketInputs> = new Server();

    const close = () => {
        server.close();
    }

    server.listen(3000)

    return {
        server,
        close,
    }
}