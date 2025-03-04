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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeOutgoingServerMessage = exports.encodeOutgoingServerMessage = exports.decodeOutgoingClientMessage = exports.encodeOutgoingClientMessage = void 0;
var __typia_transform__ProtobufSizer = __importStar(require("typia/lib/internal/_ProtobufSizer.js"));
var __typia_transform__ProtobufWriter = __importStar(require("typia/lib/internal/_ProtobufWriter.js"));
var __typia_transform__ProtobufReader = __importStar(require("typia/lib/internal/_ProtobufReader.js"));
var typia_1 = __importDefault(require("typia"));
;
exports.encodeOutgoingClientMessage = (function () { var encoder = function (writer, input) {
    var _peo0 = function (input) {
        // property "data": ClientGyroSetAngles;
        writer.uint32(10);
        writer.fork();
        _peo1(input.data);
        writer.ldelim();
    };
    var _peo1 = function (input) {
        // property "type": "client/gyro/angles";
        writer.uint32(10);
        writer.string(input.type);
        // property "angles": __type;
        writer.uint32(18);
        writer.fork();
        _peo2(input.angles);
        writer.ldelim();
    };
    var _peo2 = function (input) {
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
    var _io1 = function (input) { return "client/gyro/angles" === input.type && ("object" === typeof input.angles && null !== input.angles && _io2(input.angles)); };
    var _io2 = function (input) { return "number" === typeof input.x && "number" === typeof input.y && "number" === typeof input.z; };
    _peo0(input);
    return writer;
}; return function (input) {
    var sizer = encoder(new __typia_transform__ProtobufSizer._ProtobufSizer(), input);
    var writer = encoder(new __typia_transform__ProtobufWriter._ProtobufWriter(sizer), input);
    return writer.buffer();
}; })();
exports.decodeOutgoingClientMessage = (function () { var _pdo0 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        data: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; var _pdo1 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        type: undefined,
        angles: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; var _pdo2 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        x: undefined,
        y: undefined,
        z: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; return function (input) {
    var reader = new __typia_transform__ProtobufReader._ProtobufReader(input);
    return _pdo0(reader);
}; })();
exports.encodeOutgoingServerMessage = (function () { var encoder = function (writer, input) {
    var _peo0 = function (input) {
        // property "data": ServerGyroAngles;
        writer.uint32(10);
        writer.fork();
        _peo1(input.data);
        writer.ldelim();
    };
    var _peo1 = function (input) {
        // property "type": "server/gyro/angles";
        writer.uint32(10);
        writer.string(input.type);
        // property "angles": __type;
        writer.uint32(18);
        writer.fork();
        _peo2(input.angles);
        writer.ldelim();
    };
    var _peo2 = function (input) {
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
    var _io1 = function (input) { return "server/gyro/angles" === input.type && ("object" === typeof input.angles && null !== input.angles && _io2(input.angles)); };
    var _io2 = function (input) { return "number" === typeof input.x && "number" === typeof input.y && "number" === typeof input.z; };
    _peo0(input);
    return writer;
}; return function (input) {
    var sizer = encoder(new __typia_transform__ProtobufSizer._ProtobufSizer(), input);
    var writer = encoder(new __typia_transform__ProtobufWriter._ProtobufWriter(sizer), input);
    return writer.buffer();
}; })();
exports.decodeOutgoingServerMessage = (function () { var _pdo0 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        data: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; var _pdo1 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        type: undefined,
        angles: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; var _pdo2 = function (reader, length) {
    if (length === void 0) { length = -1; }
    length = length < 0 ? reader.size() : reader.index() + length;
    var output = {
        x: undefined,
        y: undefined,
        z: undefined
    };
    while (reader.index() < length) {
        var tag = reader.uint32();
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
}; return function (input) {
    var reader = new __typia_transform__ProtobufReader._ProtobufReader(input);
    return _pdo0(reader);
}; })();
