"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeId = exports.getCmdId = void 0;
exports.waitForResponse = waitForResponse;
exports.waitForCondition = waitForCondition;
exports.initOdriveApi = initOdriveApi;
const rxjs_1 = require("rxjs");
const getCmdId = (canid) => canid & 0x1F;
exports.getCmdId = getCmdId;
const getNodeId = (canid) => canid >> 5;
exports.getNodeId = getNodeId;
async function waitForResponse(api, inboundPacketsMap, can_id) {
    try {
        const response = await (0, rxjs_1.firstValueFrom)(api.responseSubject.pipe((0, rxjs_1.filter)((msg) => msg.id === can_id), (0, rxjs_1.take)(1), (0, rxjs_1.timeout)(2000), (0, rxjs_1.catchError)(() => (0, rxjs_1.throwError)(() => new Error(`Timeout waiting for response`)))));
        const cmdId = (0, exports.getCmdId)(response.id);
        const inPacket = inboundPacketsMap[cmdId];
        if (!inPacket) {
            throw 'invalid id';
        }
        return inPacket(response.data);
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
;
async function waitForCondition(api, inboundPacketsMap, node_id, cmd_id, condition, t) {
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
        console.error(err);
        return null;
    }
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
