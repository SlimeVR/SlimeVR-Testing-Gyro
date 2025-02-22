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
const flat_endpoints_json_1 = __importDefault(require("../../flat_endpoints.json"));
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
    const importDeclaration = typescript_1.default.factory.createImportDeclaration(undefined, typescript_1.default.factory.createImportClause(false, undefined, typescript_1.default.factory.createNamedImports([
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier("OdriveAPI")),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier("waitForResponse"))
    ])), typescript_1.default.factory.createStringLiteral("./api-generator/odrive-api"), undefined);
    return [importDeclaration];
}
function generateMessageInterface(message) {
    const messageName = fixMessageName(message.name);
    const interfaceMembers = message.signals.map(signal => {
        const valueMap = signal.valueMap;
        const property = factory.createPropertySignature(undefined, factory.createIdentifier(fixSignalName(signal.name)), undefined, valueMap && valueMap.size > 0
            ? factory.createUnionTypeNode(Array.from(valueMap.values()).map((v) => factory.createLiteralTypeNode(factory.createStringLiteral(v))))
            : factory.createKeywordTypeNode(signal.length === 1 ? typescript_1.default.SyntaxKind.BooleanKeyword : typescript_1.default.SyntaxKind.NumberKeyword));
        return property;
    });
    const messageInterface = factory.createInterfaceDeclaration([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createIdentifier(`${messageName}Message`), undefined, undefined, interfaceMembers);
    return messageInterface;
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
    return typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createIdentifier(`send${messageName}`), typescript_1.default.factory.createArrowFunction([], [], [
        createSimpleParam('node_id', factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword)),
        createSimpleParam('message', factory.createTypeReferenceNode(`${messageName}Message`, undefined))
    ], undefined, undefined, factory.createBlock([
        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(factory.createIdentifier("api"), factory.createIdentifier("channel")), factory.createIdentifier("send")), undefined, [
            factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("data", factory.createCallExpression(factory.createIdentifier(`create${messageName}Buffer`), undefined, [factory.createIdentifier("message")])),
                factory.createPropertyAssignment("ext", factory.createFalse()),
                factory.createPropertyAssignment("rtr", factory.createFalse()),
                factory.createPropertyAssignment("id", factory.createBinaryExpression(factory.createBinaryExpression(factory.createIdentifier("node_id"), typescript_1.default.SyntaxKind.LessThanLessThanToken, factory.createNumericLiteral(5)), typescript_1.default.SyntaxKind.BarToken, typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Packets"), typescript_1.default.factory.createIdentifier(messageName))))
            ], true)
        ]))
    ], true)));
}
function generateAskFunction(message) {
    const messageName = fixMessageName(message.name);
    return typescript_1.default.factory.createPropertyAssignment(typescript_1.default.factory.createIdentifier(`ask${messageName.replace('Get', '')}`), typescript_1.default.factory.createArrowFunction([], [], [createSimpleParam('node_id', factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword))], undefined, undefined, factory.createBlock([
        typescript_1.default.factory.createVariableStatement(undefined, typescript_1.default.factory.createVariableDeclarationList([
            typescript_1.default.factory.createVariableDeclaration(typescript_1.default.factory.createIdentifier("can_id"), undefined, undefined, factory.createBinaryExpression(factory.createBinaryExpression(factory.createIdentifier("node_id"), typescript_1.default.SyntaxKind.LessThanLessThanToken, factory.createNumericLiteral(5)), typescript_1.default.SyntaxKind.BarToken, typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Packets"), typescript_1.default.factory.createIdentifier(messageName))))
        ], typescript_1.default.NodeFlags.Const)),
        factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(factory.createIdentifier("api"), factory.createIdentifier("channel")), factory.createIdentifier("send")), undefined, [
            factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("data", factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('Buffer'), factory.createIdentifier('alloc')), undefined, [factory.createNumericLiteral(0)])),
                factory.createPropertyAssignment("ext", factory.createFalse()),
                factory.createPropertyAssignment("rtr", factory.createTrue()),
                factory.createPropertyAssignment("id", factory.createIdentifier("can_id"))
            ], true)
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
        factory.createVariableDeclaration(name, undefined, undefined, factory.createObjectLiteralExpression(messages.map((message) => factory.createPropertyAssignment(factory.createComputedPropertyName(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Packets"), typescript_1.default.factory.createIdentifier(fixMessageName(message.name)))), type === 'create'
            ? factory.createIdentifier('create' + fixMessageName(message.name) + 'Buffer')
            : factory.createIdentifier('parse' + fixMessageName(message.name)))), true)),
    ], typescript_1.default.NodeFlags.Const));
    const inboundPacketsMap = genMap(dbc.messages, 'inboundPacketsMap', 'parse');
    const outboundPacketsMap = genMap(dbc.messages, 'outboundPacketsMap', 'create');
    return [inboundPacketsMap, outboundPacketsMap];
}
function generateAPIFunctions(dbc) {
    const nodes = [];
    dbc.messages.forEach(message => {
        if (message.sender === 'Master') {
            nodes.push(generateSendFunction(message));
        }
        else if (message.name.startsWith('Get')) {
            nodes.push(generateAskFunction(message));
        }
    });
    return typescript_1.default.factory.createFunctionDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, typescript_1.default.factory.createIdentifier("apiFunctions"), undefined, [createSimpleParam('api', typescript_1.default.factory.createTypeReferenceNode("OdriveAPI", []))], undefined, typescript_1.default.factory.createBlock([
        typescript_1.default.factory.createReturnStatement(typescript_1.default.factory.createObjectLiteralExpression(nodes, true))
    ], true));
}
function generatePacketsEnum(dbc) {
    return typescript_1.default.factory.createEnumDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.factory.createIdentifier('Packets'), dbc.messages.map((message) => typescript_1.default.factory.createEnumMember(fixMessageName(message.name), typescript_1.default.factory.createNumericLiteral(message.id))));
}
function generateFlatEndpointsInterface() {
    console.log('hello?', flat_endpoints_json_1.default.endpoints);
    return factory.createVariableStatement([factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
        factory.createVariableDeclaration('endpointsIdMap', undefined, undefined, factory.createObjectLiteralExpression(Object.keys(flat_endpoints_json_1.default.endpoints).map((endpoint) => factory.createPropertyAssignment(factory.createStringLiteral(endpoint), factory.createNumericLiteral(flat_endpoints_json_1.default.endpoints[endpoint].id))), true)),
    ], typescript_1.default.NodeFlags.Const));
}
function generateTsDefinitionsFromDBC(dbc) {
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
    nodes.push(generateAPIFunctions(dbc));
    nodes.push(generateFlatEndpointsInterface());
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
    const tsDefinitions = generateTsDefinitionsFromDBC({ messages: dbcData.messages.filter(({ name }) => name.includes('Axis0')).map(({ name, ...fields }) => ({ name: name.substring('Axis0_'.length), ...fields })) });
    fs_1.default.writeFileSync((0, path_1.join)((0, path_1.dirname)(__dirname), '../src/generated-api.ts'), tsDefinitions, { encoding: 'utf-8' });
});
