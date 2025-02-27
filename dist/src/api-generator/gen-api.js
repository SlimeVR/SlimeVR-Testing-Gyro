"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTsDefinitionsFromDBC = generateTsDefinitionsFromDBC;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const dbc_parser_1 = require("./dbc-parser");
const path_1 = require("path");
const fixMessageName = (name) => name.replaceAll('_', '');
const fixSignalName = (name) => name.toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/ (.)/g, (a) => a.toUpperCase())
    .replace(/ /g, '');
const varMapName = (message, signal) => fixSignalName(message) + "_" + fixSignalName(signal) + 'Map';
const varMapFlippedName = (message, signal) => varMapName(message, signal) + 'Fliped';
const readFunction = (signal) => {
    if (signal.dataType === 'float') {
        return `readFloat${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
    }
    switch (signal.length) {
        case 8: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int8`;
        case 16: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int16${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
        case 32: return `read${signal.valueType === 'Signed' ? '' : 'U'}Int32${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
        default: return `readUInt${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
    }
};
const createHexLiteral = (number) => factory.createNumericLiteral(`0x${number.toString(16)}`);
const createSimpleParam = (name, type) => factory.createParameterDeclaration(undefined, undefined, name, undefined, type, undefined);
const needMask = (signal) => signal.dataType !== 'float' && readFunction(signal) === 'readUInt' + (signal.byteOrder === 'Intel' ? 'LE' : 'BE');
const writeFunction = (signal) => {
    if (signal.dataType === 'float') {
        return `writeFloat${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
    }
    switch (signal.length) {
        case 8: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int8`;
        case 16: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int16${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
        case 32: return `write${signal.valueType === 'Signed' ? '' : 'U'}Int32${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
        default: return `writeUInt${signal.byteOrder === 'Intel' ? 'LE' : 'BE'}`;
    }
};
const factory = typescript_1.default.factory;
function generateImports() {
    const importDeclaration = factory.createImportDeclaration(undefined, factory.createImportClause(false, undefined, factory.createNamedImports([
        "OdriveAPI",
        "waitForResponse",
        "waitForCondition",
        "valueToEndpointType",
        "typedToEndpoint",
        "Endpoint"
    ].map((i) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(i))))), factory.createStringLiteral("./api-generator/odrive-api"), undefined);
    return [importDeclaration];
}
function generateMessageInterface(message) {
    const messageName = fixMessageName(message.name);
    return factory.createInterfaceDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createIdentifier(`${messageName}Message`), undefined, undefined, message.signals.map(signal => {
        const valueMap = signal.valueMap;
        const property = factory.createPropertySignature(undefined, factory.createIdentifier(fixSignalName(signal.name)), undefined, valueMap && valueMap.size > 0
            ? factory.createUnionTypeNode(Array.from(valueMap.values()).map((v) => factory.createLiteralTypeNode(factory.createStringLiteral(v))))
            : factory.createKeywordTypeNode(signal.length === 1 ? typescript_1.default.SyntaxKind.BooleanKeyword : typescript_1.default.SyntaxKind.NumberKeyword));
        return property;
    }));
}
function generateLookupsMaps(message) {
    const maps = [];
    for (const signal of message.signals) {
        if (!signal.valueMap || signal.valueMap.size === 0)
            continue;
        const valueMapConst = factory.createVariableStatement([], factory.createVariableDeclarationList([
            factory.createVariableDeclaration(varMapName(message.name, signal.name), undefined, undefined, factory.createAsExpression(factory.createObjectLiteralExpression(Array.from(signal.valueMap.entries()).map(([key, value]) => factory.createPropertyAssignment(factory.createNumericLiteral(key), factory.createStringLiteral(value))), true), factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword),
                factory.createIndexedAccessTypeNode(factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'), factory.createLiteralTypeNode(factory.createStringLiteral(fixSignalName(signal.name))))
            ]))),
        ], typescript_1.default.NodeFlags.Const));
        const valueMapFlippedConst = factory.createVariableStatement([], factory.createVariableDeclarationList([
            factory.createVariableDeclaration(varMapFlippedName(message.name, signal.name), undefined, undefined, factory.createAsExpression(factory.createObjectLiteralExpression(Array.from(signal.valueMap.entries()).map(([key, value]) => factory.createPropertyAssignment(factory.createStringLiteral(value), factory.createNumericLiteral(key))), true), factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                factory.createIndexedAccessTypeNode(factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'), factory.createLiteralTypeNode(factory.createStringLiteral(fixSignalName(signal.name)))),
                factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword),
            ]))),
        ], typescript_1.default.NodeFlags.Const));
        maps.push(valueMapConst, valueMapFlippedConst);
    }
    return maps;
}
function generateParseFunction(message) {
    const messageName = fixMessageName(message.name);
    return factory.createFunctionDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, `parse${messageName}`, undefined, [
        createSimpleParam('data', factory.createTypeReferenceNode('Buffer'))
    ], factory.createTypeReferenceNode(`${messageName}Message`, undefined), factory.createBlock([
        factory.createReturnStatement(factory.createObjectLiteralExpression([...message.signals.map(signal => {
                let value = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('data'), factory.createIdentifier(readFunction(signal))), undefined, [factory.createNumericLiteral(Math.floor(signal.startBit / 8)), ...(readFunction(signal) == 'readUIntLE' ? [factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])]);
                if (needMask(signal)) {
                    value = factory.createBinaryExpression(value, factory.createToken(typescript_1.default.SyntaxKind.AmpersandToken), createHexLiteral(Math.pow(2, signal.length) - 1));
                }
                if (signal.length === 1) {
                    value = factory.createBinaryExpression(value, factory.createToken(typescript_1.default.SyntaxKind.EqualsEqualsToken), factory.createNumericLiteral(1));
                }
                if (signal.valueMap && signal.valueMap.size > 0) {
                    value = factory.createElementAccessExpression(factory.createIdentifier(varMapName(message.name, signal.name)), value);
                }
                return factory.createPropertyAssignment(fixSignalName(signal.name), value);
            })], true))
    ], true));
}
function generateCreateBufferFunction(message) {
    const messageName = fixMessageName(message.name);
    return factory.createFunctionDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, `create${messageName}Buffer`, undefined, [
        createSimpleParam('message', factory.createTypeReferenceNode(`${messageName}Message`, undefined))
    ], factory.createTypeReferenceNode('Buffer'), factory.createBlock([
        factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration('buffer', undefined, undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('Buffer'), factory.createIdentifier('alloc')), undefined, [factory.createNumericLiteral(message.dlc)]))
        ], typescript_1.default.NodeFlags.Const)),
        ...message.signals.map(signal => {
            let signalName = factory.createPropertyAccessExpression(factory.createIdentifier('message'), factory.createIdentifier(fixSignalName(signal.name)));
            let variable;
            if (signal.length !== 1) {
                if (signal.valueMap && signal.valueMap.size > 0) {
                    variable = factory.createElementAccessExpression(factory.createIdentifier(varMapFlippedName(message.name, signal.name)), signalName);
                }
                if (needMask(signal)) {
                    variable = factory.createBinaryExpression(variable ?? signalName, typescript_1.default.SyntaxKind.AmpersandToken, createHexLiteral(Math.pow(2, signal.length) - 1));
                }
                else {
                    variable = variable ?? signalName;
                }
            }
            else {
                variable = factory.createConditionalExpression(signalName, factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), factory.createNumericLiteral(1), factory.createToken(typescript_1.default.SyntaxKind.ColonToken), factory.createNumericLiteral(0));
            }
            return factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('buffer'), factory.createIdentifier(writeFunction(signal))), undefined, [
                variable,
                factory.createNumericLiteral(Math.floor(signal.startBit / 8)),
                ...(writeFunction(signal) == 'writeUIntLE' ? [factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])
            ]));
        }),
        factory.createReturnStatement(factory.createIdentifier('buffer'))
    ], true));
}
function generateSendFunction(message) {
    const messageName = fixMessageName(message.name);
    return factory.createPropertyAssignment(factory.createIdentifier(`send${messageName}`), factory.createArrowFunction([], [], [
        createSimpleParam('message', factory.createTypeReferenceNode(`${messageName}Message`, undefined))
    ], undefined, undefined, factory.createBlock([
        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(factory.createIdentifier("api"), factory.createIdentifier("channel")), factory.createIdentifier("send")), undefined, [
            factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("data", factory.createCallExpression(factory.createIdentifier(`create${messageName}Buffer`), undefined, [factory.createIdentifier("message")])),
                factory.createPropertyAssignment("ext", factory.createFalse()),
                factory.createPropertyAssignment("rtr", factory.createFalse()),
                factory.createPropertyAssignment("id", factory.createCallExpression(factory.createIdentifier('canId'), undefined, [
                    factory.createIdentifier('node_id'),
                    factory.createPropertyAccessExpression(factory.createIdentifier("Packets"), factory.createIdentifier(messageName))
                ]))
            ], false)
        ]))
    ], true)));
}
function generateAskFunction(message) {
    const messageName = fixMessageName(message.name);
    return factory.createPropertyAssignment(factory.createIdentifier(`ask${messageName.replace('Get', '')}`), factory.createArrowFunction([], [], [], undefined, undefined, factory.createBlock([
        factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(factory.createIdentifier("can_id"), undefined, undefined, factory.createCallExpression(factory.createIdentifier('canId'), undefined, [
                factory.createIdentifier('node_id'),
                factory.createPropertyAccessExpression(factory.createIdentifier("Packets"), factory.createIdentifier(messageName))
            ]))
        ], typescript_1.default.NodeFlags.Const)),
        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(factory.createIdentifier("api"), factory.createIdentifier("channel")), factory.createIdentifier("send")), undefined, [
            factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("data", factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('Buffer'), factory.createIdentifier('alloc')), undefined, [factory.createNumericLiteral(0)])),
                factory.createPropertyAssignment("ext", factory.createFalse()),
                factory.createPropertyAssignment("rtr", factory.createTrue()),
                factory.createPropertyAssignment("id", factory.createIdentifier("can_id"))
            ], false)
        ])),
        factory.createReturnStatement(factory.createCallExpression(factory.createIdentifier('waitForResponse'), [factory.createTypeReferenceNode(`${messageName}Message`, undefined)], [
            factory.createIdentifier('api'),
            factory.createIdentifier('inboundPacketsMap'),
            factory.createIdentifier('can_id'),
        ]))
    ], true)));
}
function generatePacketsMaps(dbc) {
    const genMap = (messages, name, type) => factory.createVariableStatement([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
        factory.createVariableDeclaration(name, undefined, undefined, factory.createObjectLiteralExpression(messages.map((message) => factory.createPropertyAssignment(factory.createComputedPropertyName(factory.createPropertyAccessExpression(factory.createIdentifier("Packets"), factory.createIdentifier(fixMessageName(message.name)))), type === 'create'
            ? factory.createIdentifier('create' + fixMessageName(message.name) + 'Buffer')
            : factory.createIdentifier('parse' + fixMessageName(message.name)))), true)),
    ], typescript_1.default.NodeFlags.Const));
    const inboundPacketsMap = genMap(dbc.messages, 'inboundPacketsMap', 'parse');
    const outboundPacketsMap = genMap(dbc.messages, 'outboundPacketsMap', 'create');
    return [inboundPacketsMap, outboundPacketsMap];
}
function generateAPIFunctions(dbc, axisCount, axisPackets) {
    const canIdFunction = factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
        factory.createVariableDeclaration("canId", undefined, undefined, factory.createArrowFunction(undefined, undefined, [
            createSimpleParam('node_id', factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword)),
            createSimpleParam('cmd_id', factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword))
        ], undefined, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), factory.createBinaryExpression(factory.createBinaryExpression(factory.createIdentifier("node_id"), typescript_1.default.SyntaxKind.LessThanLessThanToken, factory.createNumericLiteral("5")), typescript_1.default.SyntaxKind.BarToken, factory.createBinaryExpression(factory.createIdentifier("cmd_id"), typescript_1.default.SyntaxKind.PlusToken, factory.createBinaryExpression(factory.createIdentifier("axis"), typescript_1.default.SyntaxKind.AsteriskToken, factory.createNumericLiteral(axisPackets))))))
    ], typescript_1.default.NodeFlags.Const));
    const waitForFunction = factory.createFunctionDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.AsyncKeyword)], undefined, factory.createIdentifier("waitFor"), [
        factory.createTypeParameterDeclaration(undefined, factory.createIdentifier("K"), factory.createTypeOperatorNode(typescript_1.default.SyntaxKind.KeyOfKeyword, factory.createTypeQueryNode(factory.createIdentifier("inboundPacketsMap"))))
    ], [
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("cmd_id"), undefined, factory.createTypeReferenceNode("K")),
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("condition"), undefined, factory.createTypeReferenceNode("(res: ReturnType<(typeof inboundPacketsMap)[K]>) => boolean")),
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("timeout"), undefined, undefined, factory.createNumericLiteral(2000))
    ], undefined, factory.createBlock([
        factory.createReturnStatement(factory.createCallExpression(factory.createIdentifier("waitForCondition"), undefined, [
            factory.createIdentifier("api"),
            factory.createIdentifier("inboundPacketsMap"),
            factory.createIdentifier("node_id"),
            factory.createIdentifier("cmd_id"),
            factory.createIdentifier("condition"),
            factory.createIdentifier("timeout")
        ]))
    ], true));
    const expectFunction = factory.createFunctionDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.AsyncKeyword)], undefined, factory.createIdentifier("expect"), [
        factory.createTypeParameterDeclaration(undefined, factory.createIdentifier("K"), factory.createTypeOperatorNode(typescript_1.default.SyntaxKind.KeyOfKeyword, factory.createTypeQueryNode(factory.createIdentifier("inboundPacketsMap"))))
    ], [
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("cmd_id"), undefined, factory.createTypeReferenceNode("K")),
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("condition"), undefined, factory.createTypeReferenceNode("(res: ReturnType<(typeof inboundPacketsMap)[K]>) => boolean")),
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("error"), undefined, factory.createUnionTypeNode([
            factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword),
            factory.createTypeReferenceNode("Error")
        ])),
        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("timeout"), undefined, undefined, factory.createNumericLiteral("2000"))
    ], undefined, factory.createBlock([
        factory.createIfStatement(factory.createPrefixUnaryExpression(typescript_1.default.SyntaxKind.ExclamationToken, factory.createAwaitExpression(factory.createCallExpression(factory.createIdentifier("waitFor"), [factory.createTypeReferenceNode("K")], [
            factory.createIdentifier("cmd_id"),
            factory.createIdentifier("condition"),
            factory.createIdentifier("timeout")
        ]))), factory.createBlock([
            factory.createThrowStatement(factory.createIdentifier("error"))
        ]))
    ], true));
    const functionsStatement = factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
        factory.createVariableDeclaration(factory.createIdentifier("functions"), undefined, undefined, factory.createObjectLiteralExpression(dbc.messages.map(message => {
            if (message.sender === 'Master') {
                return generateSendFunction(message);
            }
            else if (message.name.startsWith('Get')) {
                return generateAskFunction(message);
            }
            return undefined;
        }).filter((a) => !!a), true))
    ], typescript_1.default.NodeFlags.Const));
    return factory.createFunctionDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, factory.createIdentifier("apiFunctions"), undefined, [
        createSimpleParam('api', factory.createTypeReferenceNode("OdriveAPI", [])),
        createSimpleParam('node_id', factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword)),
        factory.createParameterDeclaration(undefined, undefined, "axis", undefined, undefined, factory.createNumericLiteral(0))
    ], undefined, factory.createBlock([
        canIdFunction,
        functionsStatement,
        waitForFunction,
        expectFunction,
        factory.createReturnStatement(factory.createObjectLiteralExpression([
            factory.createPropertyAssignment('waitFor', factory.createIdentifier('waitFor')),
            factory.createPropertyAssignment('expect', factory.createIdentifier('expect')),
            factory.createSpreadAssignment(factory.createIdentifier('functions')),
            factory.createPropertyAssignment('endpoints', generateEndpointsProxy(axisPackets))
        ], true))
    ], true));
}
function generatePacketsEnum(dbc) {
    return factory.createEnumDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createIdentifier('Packets'), dbc.messages.map((message) => factory.createEnumMember(fixMessageName(message.name), factory.createNumericLiteral(message.id))));
}
function generateEndpointsProxy(axisPackets) {
    return factory.createNewExpression(factory.createIdentifier("Proxy"), [factory.createTypeReferenceNode("Endpoints")], [
        factory.createAsExpression(factory.createObjectLiteralExpression([]), factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword)),
        factory.createObjectLiteralExpression([
            factory.createMethodDeclaration(undefined, undefined, factory.createIdentifier("get"), undefined, [
                factory.createTypeParameterDeclaration(undefined, factory.createIdentifier("K"), factory.createTypeOperatorNode(typescript_1.default.SyntaxKind.KeyOfKeyword, factory.createTypeReferenceNode("Endpoints")))
            ], [
                factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("target"), undefined, factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NeverKeyword)),
                factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("prop"), undefined, factory.createTypeReferenceNode("K"))
            ], undefined, factory.createBlock([
                factory.createReturnStatement(factory.createObjectLiteralExpression([
                    factory.createPropertyAssignment(factory.createIdentifier("get"), factory.createArrowFunction([factory.createModifier(typescript_1.default.SyntaxKind.AsyncKeyword)], undefined, [], undefined, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), factory.createBlock([
                        factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
                            factory.createVariableDeclaration(factory.createIdentifier("endpointId"), undefined, undefined, factory.createPropertyAccessExpression(factory.createElementAccessExpression(factory.createIdentifier("endpointIdMap"), factory.createIdentifier("prop")), factory.createIdentifier("id")))
                        ], typescript_1.default.NodeFlags.Const)),
                        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("functions"), factory.createIdentifier("sendRxSdo")), undefined, [
                            factory.createObjectLiteralExpression([
                                factory.createPropertyAssignment("value", factory.createNumericLiteral("0")),
                                factory.createPropertyAssignment("endpointId", factory.createIdentifier("endpointId")),
                                factory.createPropertyAssignment("opcode", factory.createStringLiteral("READ")),
                                factory.createPropertyAssignment("reserved", factory.createNumericLiteral("0"))
                            ])
                        ])),
                        factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
                            factory.createVariableDeclaration(factory.createIdentifier("result"), undefined, undefined, factory.createAwaitExpression(factory.createCallExpression(factory.createIdentifier("waitForCondition"), [
                                factory.createTypeReferenceNode("TxSdoMessage")
                            ], [
                                factory.createIdentifier("api"),
                                factory.createIdentifier("inboundPacketsMap"),
                                factory.createIdentifier("node_id"),
                                factory.createBinaryExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Packets"), factory.createIdentifier("TxSdo")), factory.createToken(typescript_1.default.SyntaxKind.PlusToken), factory.createBinaryExpression(factory.createIdentifier("axis"), factory.createToken(typescript_1.default.SyntaxKind.AsteriskToken), factory.createNumericLiteral(axisPackets))),
                                factory.createArrowFunction(undefined, undefined, [
                                    factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("res"))
                                ], undefined, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), factory.createBinaryExpression(factory.createPropertyAccessExpression(factory.createIdentifier("res"), factory.createIdentifier("endpointId")), factory.createToken(typescript_1.default.SyntaxKind.EqualsEqualsEqualsToken), factory.createIdentifier("endpointId")))
                            ])))
                        ], typescript_1.default.NodeFlags.Const)),
                        factory.createIfStatement(factory.createBinaryExpression(factory.createIdentifier("result"), factory.createToken(typescript_1.default.SyntaxKind.EqualsEqualsEqualsToken), factory.createNull()), factory.createBlock([
                            factory.createThrowStatement(factory.createBinaryExpression(factory.createStringLiteral("could not read endpoint "), factory.createToken(typescript_1.default.SyntaxKind.PlusToken), factory.createIdentifier("prop")))
                        ])),
                        factory.createReturnStatement(factory.createCallExpression(factory.createIdentifier("valueToEndpointType"), undefined, [
                            factory.createPropertyAccessExpression(factory.createIdentifier("result"), factory.createIdentifier("value")),
                            factory.createPropertyAccessExpression(factory.createElementAccessExpression(factory.createIdentifier("endpointIdMap"), factory.createIdentifier("prop")), factory.createIdentifier("type"))
                        ]))
                    ], true))),
                    factory.createPropertyAssignment(factory.createIdentifier("set"), factory.createArrowFunction(undefined, undefined, [
                        factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("value"), undefined, factory.createTypeReferenceNode("Endpoints[K]"))
                    ], undefined, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), factory.createBlock([
                        factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
                            factory.createVariableDeclaration(factory.createIdentifier("endpointId"), undefined, undefined, factory.createPropertyAccessExpression(factory.createElementAccessExpression(factory.createIdentifier("endpointIdMap"), factory.createIdentifier("prop")), factory.createIdentifier("id")))
                        ], typescript_1.default.NodeFlags.Const)),
                        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("functions"), factory.createIdentifier("sendRxSdo")), undefined, [
                            factory.createObjectLiteralExpression([
                                factory.createPropertyAssignment("value", factory.createCallExpression(factory.createIdentifier("typedToEndpoint"), undefined, [
                                    factory.createAsExpression(factory.createIdentifier("value"), factory.createTypeReferenceNode("Awaited<ReturnType<Endpoints[K]['get']>>")),
                                    factory.createPropertyAccessExpression(factory.createElementAccessExpression(factory.createIdentifier("endpointIdMap"), factory.createIdentifier("prop")), factory.createIdentifier("type"))
                                ])),
                                factory.createPropertyAssignment("endpointId", factory.createIdentifier("endpointId")),
                                factory.createPropertyAssignment("opcode", factory.createStringLiteral("WRITE")),
                                factory.createPropertyAssignment("reserved", factory.createNumericLiteral("0"))
                            ])
                        ])),
                        factory.createReturnStatement(factory.createTrue())
                    ], true)))
                ], true))
            ], true))
        ], true)
    ]);
}
function generateEndpointsMap(flat_endpoints) {
    const getType = (endpoint) => {
        if (!['uint64', 'uint32', 'uint8', 'uint16', 'int32', 'int64', 'float', 'bool'].includes(endpoint.type))
            throw 'error' + endpoint.type;
        if (endpoint.type.startsWith('uint') || endpoint.type.startsWith('int') || endpoint.type === 'float')
            return factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword);
        if (endpoint.type.startsWith('bool'))
            return factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.BooleanKeyword);
    };
    const getTypeString = (type) => {
        if (!['uint64', 'uint32', 'uint8', 'uint16', 'int32', 'int64', 'float', 'bool'].includes(type))
            throw 'error' + type;
        if (type.startsWith('uint'))
            return 'uint';
        if (type.startsWith('int'))
            return 'int';
        if (type === 'float')
            return 'float';
        if (type.startsWith('bool'))
            return 'boolean';
        throw new Error('invalid state');
    };
    const endpoints = Object.keys(flat_endpoints.endpoints).filter((endpoint) => !['endpoint_ref', 'function'].includes(flat_endpoints.endpoints[endpoint].type));
    return [
        factory.createInterfaceDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createIdentifier(`Endpoints`), undefined, undefined, endpoints.map((endpoint) => factory.createPropertySignature(undefined, factory.createStringLiteral(endpoint), undefined, typescript_1.default.factory.createTypeReferenceNode("Endpoint", [
            getType(flat_endpoints.endpoints[endpoint])
        ])))),
        factory.createVariableStatement([], factory.createVariableDeclarationList([
            factory.createVariableDeclaration('endpointIdMap', undefined, factory.createTypeReferenceNode("Record", [
                factory.createTypeOperatorNode(typescript_1.default.SyntaxKind.KeyOfKeyword, factory.createTypeReferenceNode("Endpoints")),
                factory.createTypeLiteralNode([
                    factory.createPropertySignature(undefined, factory.createIdentifier("id"), undefined, factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword)),
                    factory.createPropertySignature(undefined, factory.createIdentifier("type"), undefined, factory.createUnionTypeNode(['float', 'uint', 'int', 'boolean'].map(a => factory.createLiteralTypeNode(factory.createStringLiteral(a))))),
                ])
            ]), factory.createObjectLiteralExpression(endpoints.map((endpoint) => factory.createPropertyAssignment(factory.createStringLiteral(endpoint), factory.createObjectLiteralExpression([
                factory.createPropertyAssignment(factory.createStringLiteral('id'), factory.createNumericLiteral(flat_endpoints.endpoints[endpoint].id)),
                factory.createPropertyAssignment(factory.createStringLiteral('type'), factory.createStringLiteral(getTypeString(flat_endpoints.endpoints[endpoint].type))),
            ]))), true)),
        ], typescript_1.default.NodeFlags.Const))
    ];
}
function generateTsDefinitionsFromDBC(dbc, axisCount, axisPackets, flat_endpoints) {
    const nodes = [];
    nodes.push(...generateImports());
    dbc.messages.forEach((message) => {
        nodes.push(generateMessageInterface(message));
        nodes.push(...generateLookupsMaps(message));
        nodes.push(generateParseFunction(message));
        nodes.push(generateCreateBufferFunction(message));
    });
    nodes.push(generatePacketsEnum(dbc));
    nodes.push(...generatePacketsMaps(dbc));
    nodes.push(...generateEndpointsMap(flat_endpoints));
    nodes.push(generateAPIFunctions(dbc, axisCount, axisPackets));
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    const sourceFile = factory.createSourceFile(nodes, factory.createToken(typescript_1.default.SyntaxKind.EndOfFileToken), typescript_1.default.NodeFlags.None);
    return printer.printFile(sourceFile);
}
// Example usage
const filePath = 'odrive-protocol.dbc';
fs_1.default.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    const dbcData = (0, dbc_parser_1.parseDBC)(data);
    const axisCount = dbcData.messages.reduce((curr, { name }) => {
        const axisname = name.split('_')[0].substring('Axis'.length);
        if (!curr.includes(axisname))
            curr.push(axisname);
        return curr;
    }, []).length;
    const axisPackets = dbcData.messages.filter(({ name }) => name.includes('Axis0')).reduce((curr, { id }) => Math.max(curr, id), 0) + 1;
    const flat_endpoints = JSON.parse(fs_1.default.readFileSync('flat_endpoints.json', 'utf8'));
    const tsDefinitions = generateTsDefinitionsFromDBC({ messages: dbcData.messages.filter(({ name }) => name.includes('Axis0')).map(({ name, ...fields }) => ({ name: name.substring('Axis0_'.length), ...fields })) }, axisCount, axisPackets, flat_endpoints);
    fs_1.default.writeFileSync((0, path_1.join)((0, path_1.dirname)(__dirname), '../src/generated-api.ts'), tsDefinitions, { encoding: 'utf-8' });
});
