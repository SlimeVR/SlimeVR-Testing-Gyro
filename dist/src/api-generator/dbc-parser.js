"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDBC = parseDBC;
const messageRegex = /^BO_ (\d+) (\w+): (\d+) (\w+)/;
const signalRegex = /^ SG_ (\w+)(?: M)? : (\d+)\|(\d+)@(\d+)([+-]) \(([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\) \[([-+]?[0-9]*\.?[0-9]+)\|([-+]?[0-9]*\.?[0-9]+)\] "(.*?)"/;
const messageCommentRegex = /^CM_ BO_ (\d+) "(.*?)"/;
const signalCommentRegex = /^CM_ SG_ (\d+) (\w+) "(.*?)"/;
const valueRegex = /^VAL_ (\d+) (\w+) ((?:\d+ "[^"]*" )+)/;
const signalValueTypeRegex = /^SIG_VALTYPE_ (\d+) (\w+) : (\d+)/;
function parseDBC(content) {
    const lines = content.split("\n");
    const messages = [];
    let currentMessage = null;
    const messageMap = new Map();
    for (const line of lines) {
        const messageMatch = line.match(messageRegex);
        if (messageMatch) {
            if (currentMessage) {
                messages.push(currentMessage);
                messageMap.set(currentMessage.id, currentMessage);
            }
            currentMessage = {
                id: parseInt(messageMatch[1], 10),
                name: messageMatch[2],
                dlc: parseInt(messageMatch[3], 10),
                sender: messageMatch[4],
                signals: [],
            };
            continue;
        }
        const signalMatch = line.match(signalRegex);
        if (signalMatch && currentMessage) {
            const signal = {
                name: signalMatch[1],
                startBit: parseInt(signalMatch[2], 10),
                length: parseInt(signalMatch[3], 10),
                byteOrder: signalMatch[4] === "1" ? "Intel" : "Motorola",
                valueType: signalMatch[5] === "+" ? "Unsigned" : "Signed",
                factor: parseFloat(signalMatch[6]),
                offset: parseFloat(signalMatch[7]),
                min: parseFloat(signalMatch[8]),
                max: parseFloat(signalMatch[9]),
                dataType: 'int',
                unit: signalMatch[10],
                valueMap: new Map(),
            };
            currentMessage.signals.push(signal);
            continue;
        }
        const messageCommentMatch = line.match(messageCommentRegex);
        if (messageCommentMatch) {
            const messageId = parseInt(messageCommentMatch[1], 10);
            const comment = messageCommentMatch[2];
            const message = messageMap.get(messageId);
            if (message) {
                message.comment = comment;
            }
            continue;
        }
        const signalCommentMatch = line.match(signalCommentRegex);
        if (signalCommentMatch) {
            const messageId = parseInt(signalCommentMatch[1], 10);
            const signalName = signalCommentMatch[2];
            const comment = signalCommentMatch[3];
            const message = messageMap.get(messageId);
            if (message) {
                const signal = message.signals.find((s) => s.name === signalName);
                if (signal) {
                    signal.comment = comment;
                }
            }
            continue;
        }
        const valueMatch = line.match(valueRegex);
        if (valueMatch) {
            const messageId = parseInt(valueMatch[1], 10);
            const signalName = valueMatch[2];
            const valuePairs = valueMatch[3].trim().match(/(\d+) "([^"]*)"/g) || [];
            const message = messageMap.get(messageId);
            if (message) {
                const signal = message.signals.find((s) => s.name === signalName);
                if (signal) {
                    valuePairs.forEach((pair) => {
                        const [, key, value] = pair.match(/(\d+) "([^"]*)"/) || [];
                        if (key !== undefined && value !== undefined) {
                            signal.valueMap?.set(parseInt(key, 10), value);
                        }
                    });
                }
            }
            continue;
        }
        const signalValueTypeMatch = line.match(signalValueTypeRegex);
        if (signalValueTypeMatch) {
            const messageId = parseInt(signalValueTypeMatch[1], 10);
            const signalName = signalValueTypeMatch[2];
            const type = parseInt(signalValueTypeMatch[3], 10) === 1 ? "float" : "int";
            const message = messageMap.get(messageId);
            if (message) {
                const signal = message.signals.find((s) => s.name === signalName);
                if (signal) {
                    signal.dataType = type;
                }
            }
            continue;
        }
    }
    if (currentMessage) {
        messages.push(currentMessage);
        messageMap.set(currentMessage.id, currentMessage);
    }
    return { messages };
}
