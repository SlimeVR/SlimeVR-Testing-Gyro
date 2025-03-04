export interface MessageBase {
    type: string;
}
export type MessageTypeToDataMap<Data extends MessageBase> = {
    [K in Data['type']]: Extract<Data, {
        type: K;
    }>;
};
export interface ClientGyroSetAngles extends MessageBase {
    type: 'client/gyro/angles';
    angles: {
        x: number;
        y: number;
        z: number;
    };
}
export interface OutgoingClientMessage {
    data: ClientGyroSetAngles;
}
export type OutgoingClientMessageTypes = OutgoingClientMessage['data']['type'];
export type OutgoingClientMessageTypeMap = MessageTypeToDataMap<OutgoingClientMessage['data']>;
export declare const encodeOutgoingClientMessage: (input: OutgoingClientMessage) => Uint8Array;
export declare const decodeOutgoingClientMessage: (input: Uint8Array) => OutgoingClientMessage;
export interface ServerGyroAngles extends MessageBase {
    type: 'server/gyro/angles';
    angles: {
        x: number;
        y: number;
        z: number;
    };
}
export interface OutgoingServerMessage {
    data: ServerGyroAngles;
}
export type OutgoingServerMessageTypes = OutgoingServerMessage['data']['type'];
export type OutgoingServerMessageTypeMap = MessageTypeToDataMap<OutgoingServerMessage['data']>;
export declare const encodeOutgoingServerMessage: (input: OutgoingServerMessage) => Uint8Array;
export declare const decodeOutgoingServerMessage: (input: Uint8Array) => OutgoingServerMessage;
