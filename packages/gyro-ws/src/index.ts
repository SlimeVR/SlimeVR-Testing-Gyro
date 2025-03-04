import typia from 'typia';

export interface MessageBase {
    type: string;
}

export type MessageTypeToDataMap<Data extends MessageBase> = {
    [K in Data['type']]: Extract<Data, { type: K }>
};


// ------------- Client to server packets

export interface ClientGyroSetAngles extends MessageBase {
    type: 'client/gyro/angles',
    angles: {
        x: number,
        y: number,
        z: number,
    }
}

export interface OutgoingClientMessage {
    data: ClientGyroSetAngles;
};

export type OutgoingClientMessageTypes = OutgoingClientMessage['data']['type'];
export type OutgoingClientMessageTypeMap = MessageTypeToDataMap<OutgoingClientMessage['data']>
export const encodeOutgoingClientMessage = typia.protobuf.createEncode<OutgoingClientMessage>();
export const decodeOutgoingClientMessage = typia.protobuf.createDecode<OutgoingClientMessage>();



// ------------- Server to client packets

export interface ServerGyroAngles extends MessageBase {
    type: 'server/gyro/angles',
    angles: {
        x: number,
        y: number,
        z: number,
    }
}

export interface OutgoingServerMessage {
    data: ServerGyroAngles
}

export type OutgoingServerMessageTypes = OutgoingServerMessage['data']['type'];
export type OutgoingServerMessageTypeMap = MessageTypeToDataMap<OutgoingServerMessage['data']>
export const encodeOutgoingServerMessage = typia.protobuf.createEncode<OutgoingServerMessage>();
export const decodeOutgoingServerMessage = typia.protobuf.createDecode<OutgoingServerMessage>();