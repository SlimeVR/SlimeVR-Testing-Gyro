"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeId = exports.getCmdId = void 0;
exports.expectResponse = expectResponse;
exports.waitForResponse = waitForResponse;
exports.waitForCondition = waitForCondition;
exports.valueToEndpointType = valueToEndpointType;
exports.typedToEndpoint = typedToEndpoint;
exports.initOdriveApi = initOdriveApi;
const rxjs_1 = require("rxjs");
const getCmdId = (canid) => canid & 0x1F;
exports.getCmdId = getCmdId;
const getNodeId = (canid) => canid >> 5;
exports.getNodeId = getNodeId;
async function expectResponse(api, inboundPacketsMap, can_id) {
    const response = await (0, rxjs_1.firstValueFrom)(api.responseSubject.pipe((0, rxjs_1.filter)((msg) => msg.id === can_id), (0, rxjs_1.take)(1), (0, rxjs_1.timeout)(2000), (0, rxjs_1.catchError)(() => (0, rxjs_1.throwError)(() => new Error(`Timeout waiting for response`)))));
    const cmdId = (0, exports.getCmdId)(response.id);
    const inPacket = inboundPacketsMap[cmdId];
    if (!inPacket) {
        throw 'invalid id';
    }
    return inPacket(response.data);
}
;
async function waitForResponse(api, inboundPacketsMap, can_id) {
    return expectResponse(api, inboundPacketsMap, can_id).catch(() => null);
}
;
async function waitForCondition(api, inboundPacketsMap, node_id, cmd_id, condition, t = 2000) {
    try {
        const can_id = node_id << 5 | cmd_id;
        return await (0, rxjs_1.firstValueFrom)(api.responseSubject.pipe((0, rxjs_1.filter)((msg) => msg.id === can_id), (0, rxjs_1.map)((msg) => {
            const cmdId = (0, exports.getCmdId)(msg.id);
            const inPacket = inboundPacketsMap[cmdId];
            if (!inPacket) {
                throw 'invalid id';
            }
            return inPacket(msg.data);
        }), (0, rxjs_1.filter)((packet) => condition(packet)), (0, rxjs_1.take)(1), (0, rxjs_1.timeout)(t), (0, rxjs_1.catchError)(() => (0, rxjs_1.throwError)(() => new Error(`Timeout waiting for response`)))));
    }
    catch (err) {
        return null;
    }
}
function valueToEndpointType(value, type) {
    if (type === 'float') {
        var sign = (value & 0x80000000) ? -1 : 1;
        var exponent = ((value >> 23) & 0xFF) - 127;
        var significand = (value & ~(-1 << 23));
        if (exponent == 128)
            return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);
        if (exponent == -127) {
            if (significand == 0)
                return sign * 0.0;
            exponent = -126;
            significand /= (1 << 22);
        }
        else
            significand = (significand | (1 << 23)) / (1 << 23);
        return sign * significand * Math.pow(2, exponent);
    }
    if (type === 'boolean') {
        return value === 1 ? true : false;
    }
    return value;
}
function typedToEndpoint(value, type) {
    if (typeof value === 'boolean')
        return value ? 1 : 0;
    if (typeof value === 'number' && type === 'float') {
        var bytes = 0;
        switch (value) {
            case Number.POSITIVE_INFINITY:
                bytes = 0x7F800000;
                break;
            case Number.NEGATIVE_INFINITY:
                bytes = 0xFF800000;
                break;
            case +0.0:
                bytes = 0x40000000;
                break;
            case -0.0:
                bytes = 0xC0000000;
                break;
            default:
                if (Number.isNaN(value)) {
                    bytes = 0x7FC00000;
                    break;
                }
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
                }
                else if (exponent < 0)
                    exponent = 0;
                bytes = bytes | (exponent << 23);
                bytes = bytes | (significand & ~(-1 << 23));
                break;
        }
        return bytes;
    }
    return value;
}
function initOdriveApi(channel) {
    const message$ = new rxjs_1.Observable((subscriber) => {
        channel.addListener("onMessage", (msg) => {
            subscriber.next(msg);
        });
    });
    // Subject to track sent messages and their corresponding responses
    const responseSubject = new rxjs_1.Subject();
    // Subscribe to messages and push them to the subject
    message$.subscribe((msg) => responseSubject.next(msg));
    return {
        responseSubject,
        channel,
    };
}
