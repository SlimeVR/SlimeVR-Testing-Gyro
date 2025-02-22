"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBCParser = void 0;
exports.generateTsDefinitionsFromDBC = generateTsDefinitionsFromDBC;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
class DBCParser {
    static messageRegex = /^BO_ (\d+) (\w+): (\d+) (\w+)/;
    static signalRegex = /^ SG_ (\w+) : (\d+)\|(\d+)@(\d+)([+-]) \(([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\) \[([-+]?[0-9]*\.?[0-9]+)\|([-+]?[0-9]*\.?[0-9]+)\] "(.*?)"/;
    static parse(content) {
        const lines = content.split("\n");
        const messages = [];
        let currentMessage = null;
        for (const line of lines) {
            const messageMatch = line.match(this.messageRegex);
            if (messageMatch) {
                if (currentMessage) {
                    messages.push(currentMessage);
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
                    byteOrder: signalMatch[4] === "1" ? "Motorola" : "Intel",
                    valueType: signalMatch[5] === "+" ? "Unsigned" : "Signed",
                    factor: parseFloat(signalMatch[6]),
                    offset: parseFloat(signalMatch[7]),
                    min: parseFloat(signalMatch[8]),
                    max: parseFloat(signalMatch[9]),
                    unit: signalMatch[10],
                };
                currentMessage.signals.push(signal);
                continue;
            }
        }
        if (currentMessage) {
            messages.push(currentMessage);
        }
        return { messages };
    }
}
exports.DBCParser = DBCParser;
function generateTsDefinitionsFromDBC(dbc) {
    const nodes = [];
    dbc.messages.forEach((message) => {
        // Create TypeScript interface for message
        const interfaceMembers = message.signals.map(signal => typescript_1.default.factory.createPropertySignature(undefined, typescript_1.default.factory.createIdentifier(signal.name), undefined, typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword)));
        const messageInterface = typescript_1.default.factory.createInterfaceDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.factory.createIdentifier(`${message.name}Message`), undefined, undefined, interfaceMembers);
        nodes.push(messageInterface);
        // Create function to parse the message
        const returnObject = typescript_1.default.factory.createObjectLiteralExpression(message.signals.map(signal => typescript_1.default.factory.createPropertyAssignment(signal.name, typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier('data'), typescript_1.default.factory.createIdentifier(`readUInt${signal.length}LE`)), undefined, [typescript_1.default.factory.createNumericLiteral(signal.startBit)]), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.AsteriskToken), typescript_1.default.factory.createNumericLiteral(signal.factor)), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.PlusToken), typescript_1.default.factory.createNumericLiteral(signal.offset)))), true);
        const parseFunction = typescript_1.default.factory.createFunctionDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], undefined, `parse${message.name}`, undefined, [
            typescript_1.default.factory.createParameterDeclaration(undefined, undefined, 'data', undefined, typescript_1.default.factory.createTypeReferenceNode('Buffer'))
        ], typescript_1.default.factory.createTypeReferenceNode(`${message.name}Message`), typescript_1.default.factory.createBlock([
            typescript_1.default.factory.createReturnStatement(returnObject)
        ], true));
        nodes.push(parseFunction);
    });
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
    const tsDefinitions = generateTsDefinitionsFromDBC(dbcData);
    fs_1.default.writeFileSync('out.ts', tsDefinitions, { encoding: 'utf-8' });
});
