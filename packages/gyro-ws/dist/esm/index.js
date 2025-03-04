import * as __typia_transform__ProtobufSizer from "typia/lib/internal/_ProtobufSizer.js";
import * as __typia_transform__ProtobufWriter from "typia/lib/internal/_ProtobufWriter.js";
import * as __typia_transform__ProtobufReader from "typia/lib/internal/_ProtobufReader.js";
import typia from 'typia';
;
export const encodeOutgoingClientMessage = (() => { const encoder = (writer, input) => {
    const _peo0 = input => {
        // property "data": ClientGyroSetAngles;
        writer.uint32(10);
        writer.fork();
        _peo1(input.data);
        writer.ldelim();
    };
    const _peo1 = input => {
        // property "type": "client/gyro/angles";
        writer.uint32(10);
        writer.string(input.type);
        // property "angles": __type;
        writer.uint32(18);
        writer.fork();
        _peo2(input.angles);
        writer.ldelim();
    };
    const _peo2 = input => {
        // property "x": number;
        writer.uint32(9);
        writer.double(input.x);
        // property "y": number;
        writer.uint32(17);
        writer.double(input.y);
        // property "z": number;
        writer.uint32(25);
        writer.double(input.z);
    };
    const _io1 = input => "client/gyro/angles" === input.type && ("object" === typeof input.angles && null !== input.angles && _io2(input.angles));
    const _io2 = input => "number" === typeof input.x && "number" === typeof input.y && "number" === typeof input.z;
    _peo0(input);
    return writer;
}; return input => {
    const sizer = encoder(new __typia_transform__ProtobufSizer._ProtobufSizer(), input);
    const writer = encoder(new __typia_transform__ProtobufWriter._ProtobufWriter(sizer), input);
    return writer.buffer();
}; })();
export const decodeOutgoingClientMessage = (() => { const _pdo0 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        data: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // ClientGyroSetAngles;
                output.data = _pdo1(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; const _pdo1 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        type: undefined,
        angles: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // string;
                output.type = reader.string();
                break;
            case 2:
                // __type;
                output.angles = _pdo2(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; const _pdo2 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        x: undefined,
        y: undefined,
        z: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // double;
                output.x = reader.double();
                break;
            case 2:
                // double;
                output.y = reader.double();
                break;
            case 3:
                // double;
                output.z = reader.double();
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; return input => {
    const reader = new __typia_transform__ProtobufReader._ProtobufReader(input);
    return _pdo0(reader);
}; })();
export const encodeOutgoingServerMessage = (() => { const encoder = (writer, input) => {
    const _peo0 = input => {
        // property "data": ServerGyroAngles;
        writer.uint32(10);
        writer.fork();
        _peo1(input.data);
        writer.ldelim();
    };
    const _peo1 = input => {
        // property "type": "server/gyro/angles";
        writer.uint32(10);
        writer.string(input.type);
        // property "angles": __type;
        writer.uint32(18);
        writer.fork();
        _peo2(input.angles);
        writer.ldelim();
    };
    const _peo2 = input => {
        // property "x": number;
        writer.uint32(9);
        writer.double(input.x);
        // property "y": number;
        writer.uint32(17);
        writer.double(input.y);
        // property "z": number;
        writer.uint32(25);
        writer.double(input.z);
    };
    const _io1 = input => "server/gyro/angles" === input.type && ("object" === typeof input.angles && null !== input.angles && _io2(input.angles));
    const _io2 = input => "number" === typeof input.x && "number" === typeof input.y && "number" === typeof input.z;
    _peo0(input);
    return writer;
}; return input => {
    const sizer = encoder(new __typia_transform__ProtobufSizer._ProtobufSizer(), input);
    const writer = encoder(new __typia_transform__ProtobufWriter._ProtobufWriter(sizer), input);
    return writer.buffer();
}; })();
export const decodeOutgoingServerMessage = (() => { const _pdo0 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        data: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // ServerGyroAngles;
                output.data = _pdo1(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; const _pdo1 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        type: undefined,
        angles: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // string;
                output.type = reader.string();
                break;
            case 2:
                // __type;
                output.angles = _pdo2(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; const _pdo2 = (reader, length = -1) => {
    length = length < 0 ? reader.size() : reader.index() + length;
    const output = {
        x: undefined,
        y: undefined,
        z: undefined
    };
    while (reader.index() < length) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
            case 1:
                // double;
                output.x = reader.double();
                break;
            case 2:
                // double;
                output.y = reader.double();
                break;
            case 3:
                // double;
                output.z = reader.double();
                break;
            default:
                reader.skipType(tag & 7);
                break;
        }
    }
    return output;
}; return input => {
    const reader = new __typia_transform__ProtobufReader._ProtobufReader(input);
    return _pdo0(reader);
}; })();
