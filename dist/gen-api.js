"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBCParser = void 0;
exports.generateTsDefinitionsFromDBC = generateTsDefinitionsFromDBC;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const typescript_1 = __importDefault(require("typescript"));
class DBCParser {
    static messageRegex = /^BO_ (\d+) (\w+): (\d+) (\w+)/;
    static signalRegex = /^ SG_ (\w+) : (\d+)\|(\d+)@(\d+)([+-]) \(([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\) \[([-+]?[0-9]*\.?[0-9]+)\|([-+]?[0-9]*\.?[0-9]+)\] "(.*?)"/;
    static messageCommentRegex = /^CM_ BO_ (\d+) "(.*?)"/;
    static signalCommentRegex = /^CM_ SG_ (\d+) (\w+) "(.*?)"/;
    static valueRegex = /^VAL_ (\d+) (\w+) ((?:\d+ "[^"]*" )+)/;
    static signalValueTypeRegex = /^SIG_VALTYPE_ (\d+) (\w+) : (\d+)/;
    static parse(content) {
        const lines = content.split("\n");
        const messages = [];
        let currentMessage = null;
        const messageMap = new Map();
        for (const line of lines) {
            const messageMatch = line.match(this.messageRegex);
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
            const signalMatch = line.match(this.signalRegex);
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
            const messageCommentMatch = line.match(this.messageCommentRegex);
            if (messageCommentMatch) {
                const messageId = parseInt(messageCommentMatch[1], 10);
                const comment = messageCommentMatch[2];
                const message = messageMap.get(messageId);
                if (message) {
                    message.comment = comment;
                }
                continue;
            }
            const signalCommentMatch = line.match(this.signalCommentRegex);
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
            const valueMatch = line.match(this.valueRegex);
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
            const signalValueTypeMatch = line.match(this.signalValueTypeRegex);
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
}
exports.DBCParser = DBCParser;
function generateTsDefinitionsFromDBC(dbc) {
    const nodes = [];
    const fixMessageName = (name) => name.replaceAll('_', '');
    const fixSignalName = (name) => name.toLowerCase()
        // Replaces any - or _ characters with a space 
        .replace(/[-_]+/g, ' ')
        // Removes any non alphanumeric characters 
        .replace(/[^\w\s]/g, '')
        // Uppercases the first character in each group immediately following a space 
        // (delimited by spaces) 
        .replace(/ (.)/g, function ($1) { return $1.toUpperCase(); })
        // Removes spaces 
        .replace(/ /g, '');
    const varMapName = (message, signal) => fixSignalName(message) + "_" + fixSignalName(signal) + 'Map';
    const varMapFlippedName = (message, signal) => varMapName(message, signal) + 'Fliped';
    const importDeclaration = typescript_1.default.factory.createImportDeclaration(undefined, typescript_1.default.factory.createImportClause(false, undefined, typescript_1.default.factory.createNamespaceImport(typescript_1.default.factory.createIdentifier("can"))), typescript_1.default.factory.createStringLiteral("socketcan"));
    // Create type alias: type RawChannel = ReturnType<typeof can.createRawChannel>;
    const typeAlias = typescript_1.default.factory.createTypeAliasDeclaration(undefined, typescript_1.default.factory.createIdentifier("RawChannel"), undefined, typescript_1.default.factory.createTypeReferenceNode("ReturnType", [
        typescript_1.default.factory.createTypeQueryNode(typescript_1.default.factory.createQualifiedName(typescript_1.default.factory.createIdentifier("can"), "createRawChannel"))
    ]));
    nodes.push(importDeclaration, typeAlias);
    dbc.messages.forEach((message) => {
        const messageName = fixMessageName(message.name);
        const interfaceMembers = message.signals.map(signal => {
            const valueMap = signal.valueMap;
            const property = typescript_1.default.factory.createPropertySignature(undefined, typescript_1.default.factory.createIdentifier(fixSignalName(signal.name)), undefined, valueMap && valueMap.size > 0
                ? typescript_1.default.factory.createUnionTypeNode(Array.from(valueMap.values()).map((v) => typescript_1.default.factory.createLiteralTypeNode(typescript_1.default.factory.createStringLiteral(v))))
                : typescript_1.default.factory.createKeywordTypeNode(signal.length === 1 ? typescript_1.default.SyntaxKind.BooleanKeyword : typescript_1.default.SyntaxKind.NumberKeyword));
            return property;
        });
        interfaceMembers.push(typescript_1.default.factory.createPropertySignature(undefined, typescript_1.default.factory.createIdentifier('id'), undefined, typescript_1.default.factory.createLiteralTypeNode(typescript_1.default.factory.createNumericLiteral(message.id))));
        const messageInterface = typescript_1.default.factory.createInterfaceDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.factory.createIdentifier(`${messageName}Message`), undefined, undefined, interfaceMembers);
        nodes.push(messageInterface);
        message.signals.forEach((signal) => {
            if (!signal.valueMap || signal.valueMap.size === 0)
                return;
            const valueMapConst = typescript_1.default.factory.createVariableStatement([], typescript_1.default.factory.createVariableDeclarationList([
                typescript_1.default.factory.createVariableDeclaration(varMapName(message.name, signal.name), undefined, undefined, typescript_1.default.factory.createAsExpression(typescript_1.default.factory.createObjectLiteralExpression(Array.from(signal.valueMap.entries()).map(([key, value]) => typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createNumericLiteral(key), typescript_1.default.factory.createStringLiteral(value))), true), typescript_1.default.factory.createTypeReferenceNode(typescript_1.default.factory.createIdentifier("Record"), [
                    typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword),
                    typescript_1.default.factory.createIndexedAccessTypeNode(typescript_1.default.factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'), typescript_1.default.factory.createLiteralTypeNode(typescript_1.default.factory.createStringLiteral(fixSignalName(signal.name))))
                ]))),
            ], typescript_1.default.NodeFlags.Const));
            const valueMapFlippedConst = typescript_1.default.factory.createVariableStatement([], typescript_1.default.factory.createVariableDeclarationList([
                typescript_1.default.factory.createVariableDeclaration(varMapFlippedName(message.name, signal.name), undefined, undefined, typescript_1.default.factory.createAsExpression(typescript_1.default.factory.createObjectLiteralExpression(Array.from(signal.valueMap.entries()).map(([key, value]) => typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createStringLiteral(value), typescript_1.default.factory.createNumericLiteral(key))), true), typescript_1.default.factory.createTypeReferenceNode(typescript_1.default.factory.createIdentifier("Record"), [
                    typescript_1.default.factory.createIndexedAccessTypeNode(typescript_1.default.factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'), typescript_1.default.factory.createLiteralTypeNode(typescript_1.default.factory.createStringLiteral(fixSignalName(signal.name)))),
                    typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword),
                ]))),
            ], typescript_1.default.NodeFlags.Const));
            nodes.push(valueMapConst, valueMapFlippedConst);
        });
        const readFunction = (signal) => {
            if (signal.dataType === 'float') {
                return `readFloat${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
            }
            switch (signal.length) {
                case 8: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int8`;
                case 16: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int16${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
                case 32: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int32${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
                default: return `readUIntLE`;
            }
        };
        const writeFunction = (signal) => {
            if (signal.dataType === 'float') {
                return `writeFloat${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
            }
            switch (signal.length) {
                case 8: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int8`;
                case 16: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int16${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
                case 32: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int32${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
                default: return `writeUIntLE`;
            }
        };
        const parseFunction = typescript_1.default.factory.createFunctionDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, `parse${messageName}`, undefined, [
            typescript_1.default.factory.createParameterDeclaration(undefined, undefined, 'data', undefined, typescript_1.default.factory.createTypeReferenceNode('Buffer'))
        ], typescript_1.default.factory.createTypeReferenceNode("Omit", [
            typescript_1.default.factory.createTypeReferenceNode(`${messageName}Message`, undefined),
            typescript_1.default.factory.createLiteralTypeNode(typescript_1.default.factory.createStringLiteral("id"))
        ]), typescript_1.default.factory.createBlock([
            typescript_1.default.factory.createReturnStatement(typescript_1.default.factory.createObjectLiteralExpression([...message.signals.map(signal => {
                    let value = typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier('data'), typescript_1.default.factory.createIdentifier(readFunction(signal))), undefined, [typescript_1.default.factory.createNumericLiteral(Math.floor(signal.startBit / 8)), ...(readFunction(signal) == 'readUIntLE' ? [typescript_1.default.factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])]), typescript_1.default.SyntaxKind.AmpersandToken, typescript_1.default.factory.createNumericLiteral(`0x${(Math.pow(2, signal.length) - 1).toString(16)}`));
                    if (signal.length === 1) {
                        value = typescript_1.default.factory.createBinaryExpression(value, typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.EqualsEqualsToken), typescript_1.default.factory.createNumericLiteral(1));
                    }
                    if (signal.valueMap && signal.valueMap.size > 0) {
                        value = typescript_1.default.factory.createElementAccessExpression(typescript_1.default.factory.createIdentifier(varMapName(message.name, signal.name)), value);
                    }
                    return typescript_1.default.factory.createPropertyAssignment(fixSignalName(signal.name), value);
                })], true))
        ], true));
        nodes.push(parseFunction);
        const writeFunctionDecl = typescript_1.default.factory.createFunctionDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, `create${messageName}Buffer`, undefined, [
            typescript_1.default.factory.createParameterDeclaration(undefined, undefined, 'message', undefined, typescript_1.default.factory.createTypeReferenceNode(`${messageName}Message`))
        ], typescript_1.default.factory.createTypeReferenceNode('Buffer'), typescript_1.default.factory.createBlock([
            typescript_1.default.factory.createVariableStatement(undefined, typescript_1.default.factory.createVariableDeclarationList([
                typescript_1.default.factory.createVariableDeclaration('buffer', undefined, undefined, typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier('Buffer'), typescript_1.default.factory.createIdentifier('alloc')), undefined, [typescript_1.default.factory.createNumericLiteral(message.dlc)]))
            ], typescript_1.default.NodeFlags.Const)),
            ...message.signals.map(signal => {
                let signalName = typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier('message'), typescript_1.default.factory.createIdentifier(fixSignalName(signal.name)));
                let variable;
                if (signal.length !== 1) {
                    if (signal.valueMap && signal.valueMap.size > 0) {
                        variable = typescript_1.default.factory.createElementAccessExpression(typescript_1.default.factory.createIdentifier(varMapFlippedName(message.name, signal.name)), signalName);
                    }
                    variable = typescript_1.default.factory.createBinaryExpression(variable ?? signalName, typescript_1.default.SyntaxKind.AmpersandToken, typescript_1.default.factory.createNumericLiteral(`0x${(Math.pow(2, signal.length) - 1).toString(16)}`));
                }
                else {
                    variable = typescript_1.default.factory.createConditionalExpression(typescript_1.default.factory.createBinaryExpression(signalName, typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.EqualsEqualsToken), typescript_1.default.factory.createTrue()), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.default.factory.createNumericLiteral(1), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.ColonToken), typescript_1.default.factory.createNumericLiteral(0));
                }
                return typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier('buffer'), typescript_1.default.factory.createIdentifier(writeFunction(signal))), undefined, [
                    variable,
                    typescript_1.default.factory.createNumericLiteral(Math.floor(signal.startBit / 8)),
                    ...(writeFunction(signal) == 'writeUIntLE' ? [typescript_1.default.factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])
                ]));
            }),
            typescript_1.default.factory.createReturnStatement(typescript_1.default.factory.createIdentifier('buffer'))
        ], true));
        nodes.push(writeFunctionDecl);
        if (message.sender === 'Master') {
            const paramCan = typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("can"), undefined, typescript_1.default.factory.createTypeReferenceNode("RawChannel"), undefined);
            const paramNodeId = typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("node_id"), undefined, typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword), undefined);
            const paramMessage = typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("message"), undefined, typescript_1.default.factory.createTypeReferenceNode(`${messageName}Message`), undefined);
            // Create the function body
            const functionBody = typescript_1.default.factory.createBlock([
                typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("can"), typescript_1.default.factory.createIdentifier("send")), undefined, [
                    typescript_1.default.factory.createObjectLiteralExpression([
                        typescript_1.default.factory.createPropertyAssignment("data", typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier(`create${messageName}Buffer`), undefined, [typescript_1.default.factory.createIdentifier("message")])),
                        typescript_1.default.factory.createPropertyAssignment("ext", typescript_1.default.factory.createFalse()),
                        typescript_1.default.factory.createPropertyAssignment("rtr", typescript_1.default.factory.createFalse()),
                        typescript_1.default.factory.createPropertyAssignment("id", typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createIdentifier("node_id"), typescript_1.default.SyntaxKind.LessThanLessThanToken, typescript_1.default.factory.createNumericLiteral(5)), typescript_1.default.SyntaxKind.BarToken, typescript_1.default.factory.createNumericLiteral(message.id)))
                    ], true)
                ]))
            ], true);
            // Create function declaration
            const sendFunc = typescript_1.default.factory.createFunctionDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, typescript_1.default.factory.createIdentifier(`send${messageName}`), undefined, [paramCan, paramNodeId, paramMessage], undefined, functionBody);
            nodes.push(sendFunc);
        }
    });
    const inboundPacketsMap = typescript_1.default.factory.createVariableStatement([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.factory.createVariableDeclarationList([
        typescript_1.default.factory.createVariableDeclaration(`inboundPackets`, undefined, undefined, typescript_1.default.factory.createObjectLiteralExpression(Array.from(dbc.messages.filter(({ sender }) => sender !== 'Master').values()).map((message) => typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createNumericLiteral(message.id), typescript_1.default.factory.createIdentifier('parse' + fixMessageName(message.name)))), true)),
    ], typescript_1.default.NodeFlags.Const));
    nodes.push(inboundPacketsMap);
    const outboundPacketsMap = typescript_1.default.factory.createVariableStatement([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.factory.createVariableDeclarationList([
        typescript_1.default.factory.createVariableDeclaration(`outboundPackets`, undefined, undefined, typescript_1.default.factory.createObjectLiteralExpression(Array.from(dbc.messages.filter(({ sender }) => sender === 'Master').values()).map((message) => typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createNumericLiteral(message.id), typescript_1.default.factory.createIdentifier('create' + fixMessageName(message.name) + 'Buffer'))), true)),
    ], typescript_1.default.NodeFlags.Const));
    nodes.push(outboundPacketsMap);
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    const sourceFile = typescript_1.default.factory.createSourceFile(nodes, typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.EndOfFileToken), typescript_1.default.NodeFlags.None);
    return printer.printFile(sourceFile);
}
// Example usage
const filePath = 'odrive-protocol.dbc';
fs_1.default.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    const dbcData = DBCParser.parse(data);
    const tsDefinitions = generateTsDefinitionsFromDBC({ messages: dbcData.messages.filter(({ name }) => name.includes('Axis0')).map(({ name, ...fields }) => ({ name: name.substring('Axis0_'.length), ...fields })) });
    fs_1.default.writeFileSync((0, path_1.join)((0, path_1.dirname)(__dirname), 'src/generated-api.ts'), tsDefinitions, { encoding: 'utf-8' });
});
