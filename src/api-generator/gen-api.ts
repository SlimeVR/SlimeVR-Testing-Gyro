import fs from 'fs';
import ts from 'typescript';
import { DBC, DBCMessage, DBCSignal, parseDBC } from './dbc-parser';
import { dirname, join } from 'path';

const fixMessageName = (name: string) => name.replaceAll('_', '')
const fixSignalName = (name: string) => name.toLowerCase()
  .replace(/[-_]+/g, ' ')
  .replace(/[^\w\s]/g, '')
  .replace(/ (.)/g, (a) => a.toUpperCase())
  .replace(/ /g, '')
const varMapName = (message: string, signal: string) => fixSignalName(message) + "_" + fixSignalName(signal) + 'Map'
const varMapFlippedName = (message: string, signal: string) => varMapName(message, signal) + 'Fliped'

const readFunction = (signal: DBCSignal) => {
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

const createHexLiteral = (number: number) => factory.createNumericLiteral(`0x${number.toString(16)}`)
const createSimpleParam = (name: string, type: ts.TypeNode) => factory.createParameterDeclaration(
  undefined,
  undefined,
  name,
  undefined,
  type,
  undefined
);

const needMask = (signal: DBCSignal) => signal.dataType !== 'float' && readFunction(signal) === 'readUInt' + (signal.byteOrder === 'Intel' ? 'LE' : 'BE')

const writeFunction = (signal: DBCSignal) => {
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

const factory = ts.factory;

function generateImports(): ts.Statement[] {
  const importDeclaration = factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        "OdriveAPI",
        "waitForResponse",
        "waitForCondition",
        "valueToEndpointType",
        "typedToEndpoint",
        "Endpoint"
      ].map((i) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(i))))
    ),
    factory.createStringLiteral("./api-generator/odrive-api"),
    undefined
  );
  return [importDeclaration]
}

function generateMessageInterface(message: DBCMessage): ts.Statement {
  const messageName = fixMessageName(message.name);

  return factory.createInterfaceDeclaration(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(`${messageName}Message`),
    undefined,
    undefined,
    message.signals.map(signal => {
      const valueMap = signal.valueMap;
      const property = factory.createPropertySignature(
        undefined,
        factory.createIdentifier(fixSignalName(signal.name)),
        undefined,
        valueMap && valueMap.size > 0
          ? factory.createUnionTypeNode(Array.from(valueMap.values()).map((v) => factory.createLiteralTypeNode(factory.createStringLiteral(v))))
          : factory.createKeywordTypeNode(signal.length === 1 ? ts.SyntaxKind.BooleanKeyword : ts.SyntaxKind.NumberKeyword)
      );
      return property;
    })
  );
}

function generateLookupsMaps(message: DBCMessage) {

  const maps: ts.Statement[] = []

  for (const signal of message.signals) {
    if (!signal.valueMap || signal.valueMap.size === 0) continue;

    const valueMapConst = factory.createVariableStatement(
      [],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            varMapName(message.name, signal.name),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createObjectLiteralExpression(
                Array.from(signal.valueMap.entries()).map(([key, value]) =>
                  factory.createPropertyAssignment(
                    factory.createNumericLiteral(key),
                    factory.createStringLiteral(value)
                  )
                ),
                true
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("Record"),
                [
                  factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                  factory.createIndexedAccessTypeNode(
                    factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'),
                    factory.createLiteralTypeNode(factory.createStringLiteral(fixSignalName(signal.name)))
                  )
                ]
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    );

    const valueMapFlippedConst = factory.createVariableStatement(
      [],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            varMapFlippedName(message.name, signal.name),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createObjectLiteralExpression(
                Array.from(signal.valueMap.entries()).map(([key, value]) =>
                  factory.createPropertyAssignment(
                    factory.createStringLiteral(value),
                    factory.createNumericLiteral(key),
                  )
                ),
                true
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("Record"),
                [
                  factory.createIndexedAccessTypeNode(
                    factory.createTypeReferenceNode(fixMessageName(message.name) + 'Message'),
                    factory.createLiteralTypeNode(factory.createStringLiteral(fixSignalName(signal.name)))
                  ),
                  factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                ]
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    );

    maps.push(valueMapConst, valueMapFlippedConst);
  }

  return maps;
}

function generateParseFunction(message: DBCMessage) {
  const messageName = fixMessageName(message.name);

  return factory.createFunctionDeclaration(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    undefined,
    `parse${messageName}`,
    undefined,
    [
      createSimpleParam('data', factory.createTypeReferenceNode('Buffer'))
    ],
    factory.createTypeReferenceNode(`${messageName}Message`, undefined),
    factory.createBlock([
      factory.createReturnStatement(factory.createObjectLiteralExpression(
        [...message.signals.map(signal => {
          let value: ts.CallExpression | ts.BinaryExpression | ts.ElementAccessExpression = factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('data'),
              factory.createIdentifier(readFunction(signal))
            ),
            undefined,
            [factory.createNumericLiteral(Math.floor(signal.startBit / 8)), ...(readFunction(signal) == 'readUIntLE' ? [factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])]
          );


          if (needMask(signal)) {
            value = factory.createBinaryExpression(
              value,
              factory.createToken(ts.SyntaxKind.AmpersandToken),
              createHexLiteral(Math.pow(2, signal.length) - 1)
            )
          }

          if (signal.length === 1) {
            value = factory.createBinaryExpression(
              value,
              factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
              factory.createNumericLiteral(1)
            )
          }

          if (signal.valueMap && signal.valueMap.size > 0) {
            value = factory.createElementAccessExpression(
              factory.createIdentifier(varMapName(message.name, signal.name)),
              value,
            )
          }

          return factory.createPropertyAssignment(
            fixSignalName(signal.name),
            value
          );
        })],
        true
      ))
    ], true)
  )
}

function generateCreateBufferFunction(message: DBCMessage) {
  const messageName = fixMessageName(message.name);

  return factory.createFunctionDeclaration(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    undefined,
    `create${messageName}Buffer`,
    undefined,
    [
      createSimpleParam('message', factory.createTypeReferenceNode(`${messageName}Message`, undefined))
    ],
    factory.createTypeReferenceNode('Buffer'),
    factory.createBlock([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList([
          factory.createVariableDeclaration(
            'buffer',
            undefined,
            undefined,
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('Buffer'),
                factory.createIdentifier('alloc')
              ),
              undefined,
              [factory.createNumericLiteral(message.dlc)]
            )
          )
        ], ts.NodeFlags.Const)
      ),
      ...message.signals.map(signal => {
        let signalName = factory.createPropertyAccessExpression(
          factory.createIdentifier('message'),
          factory.createIdentifier(fixSignalName(signal.name))
        );
        let variable;

        if (signal.length !== 1) {
          if (signal.valueMap && signal.valueMap.size > 0) {
            variable = factory.createElementAccessExpression(
              factory.createIdentifier(varMapFlippedName(message.name, signal.name)),
              signalName,
            )
          }

          if (needMask(signal)) {
            variable = factory.createBinaryExpression(
              variable ?? signalName,
              ts.SyntaxKind.AmpersandToken,
              createHexLiteral(Math.pow(2, signal.length) - 1)
            )
          } else {
            variable = variable ?? signalName
          }

        } else {
          variable = factory.createConditionalExpression(
            signalName,
            factory.createToken(ts.SyntaxKind.QuestionToken),
            factory.createNumericLiteral(1),
            factory.createToken(ts.SyntaxKind.ColonToken),
            factory.createNumericLiteral(0)
          )
        }


        return factory.createExpressionStatement(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('buffer'),
              factory.createIdentifier(writeFunction(signal))
            ),
            undefined,
            [
              variable,
              factory.createNumericLiteral(Math.floor(signal.startBit / 8)),
              ...(writeFunction(signal) == 'writeUIntLE' ? [factory.createNumericLiteral(Math.ceil(signal.length / 8))] : [])
            ]
          )
        )
      }

      ),
      factory.createReturnStatement(factory.createIdentifier('buffer'))
    ], true)
  )
}

function generateSendFunction(message: DBCMessage) {
  const messageName = fixMessageName(message.name);

  return factory.createPropertyAssignment(
    factory.createIdentifier(`send${messageName}`),
    factory.createArrowFunction(
      [],
      [],
      [
        createSimpleParam('message', factory.createTypeReferenceNode(`${messageName}Message`, undefined))
      ],
      undefined,
      undefined,
      factory.createBlock(
        [
          factory.createExpressionStatement(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("api"),
                  factory.createIdentifier("channel")
                ),
                factory.createIdentifier("send")
              ),
              undefined,
              [
                factory.createObjectLiteralExpression(
                  [
                    factory.createPropertyAssignment(
                      "data",
                      factory.createCallExpression(
                        factory.createIdentifier(`create${messageName}Buffer`),
                        undefined,
                        [factory.createIdentifier("message")]
                      )
                    ),
                    factory.createPropertyAssignment("ext", factory.createFalse()),
                    factory.createPropertyAssignment("rtr", factory.createFalse()),
                    factory.createPropertyAssignment(
                      "id",
                      factory.createCallExpression(
                        factory.createIdentifier('canId'),
                        undefined,
                        [
                          factory.createIdentifier('node_id'),
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("Packets"),
                            factory.createIdentifier(messageName)
                          )
                        ]
                      )
                    )
                  ],
                  false
                )
              ]
            )
          )
        ],
        true
      )
    )
  )
}


function generateAskFunction(message: DBCMessage) {
  const messageName = fixMessageName(message.name)

  return factory.createPropertyAssignment(
    factory.createIdentifier(`ask${messageName.replace('Get', '')}`),
    factory.createArrowFunction(
      [],
      [],
      [],
      undefined,
      undefined,
      factory.createBlock(
        [
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("can_id"),
                  undefined,
                  undefined,
                  factory.createCallExpression(
                    factory.createIdentifier('canId'),
                    undefined,
                    [
                      factory.createIdentifier('node_id'),
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("Packets"),
                        factory.createIdentifier(messageName)
                      )
                    ]
                  )
                )
              ],
              ts.NodeFlags.Const
            )
          ),
          factory.createExpressionStatement(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("api"),
                  factory.createIdentifier("channel")
                ),
                factory.createIdentifier("send")
              ),
              undefined,
              [
                factory.createObjectLiteralExpression(
                  [
                    factory.createPropertyAssignment(
                      "data",
                      factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier('Buffer'),
                          factory.createIdentifier('alloc')
                        ),
                        undefined,
                        [factory.createNumericLiteral(0)]
                      )
                    ),
                    factory.createPropertyAssignment("ext", factory.createFalse()),
                    factory.createPropertyAssignment("rtr", factory.createTrue()),
                    factory.createPropertyAssignment(
                      "id",
                      factory.createIdentifier("can_id")
                    )
                  ],
                  false
                )
              ]
            )
          ),
          factory.createReturnStatement(
            factory.createCallExpression(
              factory.createIdentifier('waitForResponse'),
              [factory.createTypeReferenceNode(`${messageName}Message`, undefined)],
              [
                factory.createIdentifier('api'),
                factory.createIdentifier('inboundPacketsMap'),
                factory.createIdentifier('can_id'),
              ]
            )
          )
        ],
        true
      )
    )
  )
}

function generatePacketsMaps(dbc: DBC) {
  const genMap = (messages: DBCMessage[], name: string, type: 'parse' | 'create') => factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          name,
          undefined,
          undefined,
          factory.createObjectLiteralExpression(
            messages.map((message) =>
              factory.createPropertyAssignment(
                factory.createComputedPropertyName(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("Packets"),
                    factory.createIdentifier(fixMessageName(message.name))
                  )
                ),
                type === 'create'
                  ? factory.createIdentifier('create' + fixMessageName(message.name) + 'Buffer')
                  : factory.createIdentifier('parse' + fixMessageName(message.name))
              )
            ),
            true
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  )

  const inboundPacketsMap = genMap(dbc.messages, 'inboundPacketsMap', 'parse');
  const outboundPacketsMap = genMap(dbc.messages, 'outboundPacketsMap', 'create');

  return [inboundPacketsMap, outboundPacketsMap];
}

function generateAPIFunctions(dbc: DBC, axisCount: number, axisPackets: number) {

  const canIdFunction = factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          "canId",
          undefined,
          undefined,
          factory.createArrowFunction(
            undefined,
            undefined,
            [
              createSimpleParam('node_id', factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
              createSimpleParam('cmd_id', factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword))
            ],
            undefined,
            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            factory.createBinaryExpression(
              factory.createBinaryExpression(factory.createIdentifier("node_id"), ts.SyntaxKind.LessThanLessThanToken, factory.createNumericLiteral("5")),
              ts.SyntaxKind.BarToken,
              factory.createBinaryExpression(
                factory.createIdentifier("cmd_id"),
                ts.SyntaxKind.PlusToken,
                factory.createBinaryExpression(factory.createIdentifier("axis"),
                  ts.SyntaxKind.AsteriskToken,
                  factory.createNumericLiteral(axisPackets))
              )
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const waitForFunction = factory.createFunctionDeclaration(
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier("waitFor"),
    [
      factory.createTypeParameterDeclaration(
        undefined,
        factory.createIdentifier("K"),
        factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          factory.createTypeQueryNode(factory.createIdentifier("inboundPacketsMap"))
        )
      )
    ],
    [
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("cmd_id"), undefined, factory.createTypeReferenceNode("K")),
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("condition"), undefined, factory.createTypeReferenceNode("(res: ReturnType<(typeof inboundPacketsMap)[K]>) => boolean")),
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("timeout"), undefined, undefined, factory.createNumericLiteral(2000))
    ],
    undefined,
    factory.createBlock([
      factory.createReturnStatement(
        factory.createCallExpression(
          factory.createIdentifier("waitForCondition"),
          undefined,
          [
            factory.createIdentifier("api"),
            factory.createIdentifier("inboundPacketsMap"),
            factory.createIdentifier("node_id"),
            factory.createIdentifier("cmd_id"),
            factory.createIdentifier("condition"),
            factory.createIdentifier("timeout")
          ]
        )
      )
    ], true)
  );

  const expectFunction = factory.createFunctionDeclaration(
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier("expect"),
    [
      factory.createTypeParameterDeclaration(
        undefined,
        factory.createIdentifier("K"),
        factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          factory.createTypeQueryNode(factory.createIdentifier("inboundPacketsMap"))
        )
      )
    ],
    [
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("cmd_id"), undefined, factory.createTypeReferenceNode("K")),
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("condition"), undefined, factory.createTypeReferenceNode("(res: ReturnType<(typeof inboundPacketsMap)[K]>) => boolean")),
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("error"), undefined, factory.createUnionTypeNode([
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        factory.createTypeReferenceNode("Error")
      ])),
      factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("timeout"), undefined, undefined, factory.createNumericLiteral("2000"))
    ],
    undefined,
    factory.createBlock([
      factory.createIfStatement(
        factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, factory.createAwaitExpression(
          factory.createCallExpression(
            factory.createIdentifier("waitFor"),
            [factory.createTypeReferenceNode("K")],
            [
              factory.createIdentifier("cmd_id"),
              factory.createIdentifier("condition"),
              factory.createIdentifier("timeout")
            ]
          )
        )),
        factory.createBlock([
          factory.createThrowStatement(factory.createIdentifier("error"))
        ])
      )
    ], true)
  );

  const functionsStatement = factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier("functions"),
          undefined,
          undefined,
          factory.createObjectLiteralExpression(
            dbc.messages.map(message => {
              if (message.sender === 'Master') {
                return generateSendFunction(message);
              } else if (message.name.startsWith('Get')) {
                return generateAskFunction(message);
              }
              return undefined;
            }).filter((a) => !!a),
            true
          )
        )
      ],
      ts.NodeFlags.Const
    )
  )



  return factory.createFunctionDeclaration(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier("apiFunctions"),
    undefined,
    [
      createSimpleParam('api', factory.createTypeReferenceNode("OdriveAPI", [])),
      createSimpleParam('node_id', factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
      factory.createParameterDeclaration(undefined, undefined, "axis", undefined, undefined, factory.createNumericLiteral(0))
    ],
    undefined,
    factory.createBlock([
      canIdFunction,
      functionsStatement,
      waitForFunction,
      expectFunction,
      factory.createReturnStatement(
        factory.createObjectLiteralExpression([
          factory.createPropertyAssignment(
            'waitFor',
            factory.createIdentifier('waitFor')
          ),
          factory.createPropertyAssignment(
            'expect',
            factory.createIdentifier('expect')
          ),
          factory.createSpreadAssignment(factory.createIdentifier('functions')),
          factory.createPropertyAssignment(
            'endpoints',
            generateEndpointsProxy(axisPackets)
          )
        ], true)
      )
    ], true)
  )
}

function generatePacketsEnum(dbc: DBC) {
  return factory.createEnumDeclaration(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier('Packets'),
    dbc.messages.map((message) => factory.createEnumMember(fixMessageName(message.name), factory.createNumericLiteral(message.id)))
  );
}

function generateEndpointsProxy(axisPackets: number) {
  return factory.createNewExpression(
    factory.createIdentifier("Proxy"),
    [factory.createTypeReferenceNode("Endpoints")],
    [
      factory.createAsExpression(
        factory.createObjectLiteralExpression([]),
        factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      ),
      factory.createObjectLiteralExpression([
        factory.createMethodDeclaration(
          undefined,
          undefined,
          factory.createIdentifier("get"),
          undefined,
          [
            factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier("K"),
              factory.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                factory.createTypeReferenceNode("Endpoints")
              )
            )
          ],
          [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier("target"),
              undefined,
              factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier("prop"),
              undefined,
              factory.createTypeReferenceNode("K")
            )
          ],
          undefined,
          factory.createBlock([
            factory.createReturnStatement(
              factory.createObjectLiteralExpression([
                factory.createPropertyAssignment(
                  factory.createIdentifier("get"),
                  factory.createArrowFunction(
                    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                    undefined,
                    [],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createBlock([
                      factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList([
                          factory.createVariableDeclaration(
                            factory.createIdentifier("endpointId"),
                            undefined,
                            undefined,
                            factory.createPropertyAccessExpression(
                              factory.createElementAccessExpression(
                                factory.createIdentifier("endpointIdMap"),
                                factory.createIdentifier("prop")
                              ),
                              factory.createIdentifier("id")
                            )
                          )
                        ], ts.NodeFlags.Const)
                      ),
                      factory.createExpressionStatement(
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("functions"),
                            factory.createIdentifier("sendRxSdo")
                          ),
                          undefined,
                          [
                            factory.createObjectLiteralExpression([
                              factory.createPropertyAssignment("value", factory.createNumericLiteral("0")),
                              factory.createPropertyAssignment("endpointId", factory.createIdentifier("endpointId")),
                              factory.createPropertyAssignment("opcode", factory.createStringLiteral("READ")),
                              factory.createPropertyAssignment("reserved", factory.createNumericLiteral("0"))
                            ])
                          ]
                        )
                      ),
                      factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList([
                          factory.createVariableDeclaration(
                            factory.createIdentifier("result"),
                            undefined,
                            undefined,
                            factory.createAwaitExpression(
                              factory.createCallExpression(
                                factory.createIdentifier("waitForCondition"),
                                [
                                  factory.createTypeReferenceNode("TxSdoMessage")
                                ],
                                [
                                  factory.createIdentifier("api"),
                                  factory.createIdentifier("inboundPacketsMap"),
                                  factory.createIdentifier("node_id"),
                                  factory.createBinaryExpression(
                                    factory.createPropertyAccessExpression(
                                      factory.createIdentifier("Packets"),
                                      factory.createIdentifier("TxSdo")
                                    ),
                                    factory.createToken(ts.SyntaxKind.PlusToken),
                                    factory.createBinaryExpression(
                                      factory.createIdentifier("axis"),
                                      factory.createToken(ts.SyntaxKind.AsteriskToken),
                                      factory.createNumericLiteral(axisPackets)
                                    )
                                  ),
                                  factory.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [
                                      factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        factory.createIdentifier("res")
                                      )
                                    ],
                                    undefined,
                                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                    factory.createBinaryExpression(
                                      factory.createPropertyAccessExpression(
                                        factory.createIdentifier("res"),
                                        factory.createIdentifier("endpointId")
                                      ),
                                      factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                                      factory.createIdentifier("endpointId")
                                    )
                                  )
                                ]
                              )
                            )
                          )
                        ], ts.NodeFlags.Const)
                      ),
                      factory.createIfStatement(
                        factory.createBinaryExpression(
                          factory.createIdentifier("result"),
                          factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                          factory.createNull()
                        ),
                        factory.createBlock([
                          factory.createThrowStatement(
                            factory.createBinaryExpression(
                              factory.createStringLiteral("could not read endpoint "),
                              factory.createToken(ts.SyntaxKind.PlusToken),
                              factory.createIdentifier("prop")
                            )
                          )
                        ])
                      ),
                      factory.createReturnStatement(
                        factory.createCallExpression(
                          factory.createIdentifier("valueToEndpointType"),
                          undefined,
                          [
                            factory.createPropertyAccessExpression(
                              factory.createIdentifier("result"),
                              factory.createIdentifier("value")
                            ),
                            factory.createPropertyAccessExpression(
                              factory.createElementAccessExpression(
                                factory.createIdentifier("endpointIdMap"),
                                factory.createIdentifier("prop")
                              ),
                              factory.createIdentifier("type")
                            )
                          ]
                        )
                      )
                    ], true)
                  )
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier("set"),
                  factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                      factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("value"),
                        undefined,
                        factory.createTypeReferenceNode("Endpoints[K]")
                      )
                    ],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createBlock([
                      factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList([
                          factory.createVariableDeclaration(
                            factory.createIdentifier("endpointId"),
                            undefined,
                            undefined,
                            factory.createPropertyAccessExpression(
                              factory.createElementAccessExpression(
                                factory.createIdentifier("endpointIdMap"),
                                factory.createIdentifier("prop")
                              ),
                              factory.createIdentifier("id")
                            )
                          )
                        ], ts.NodeFlags.Const)
                      ),
                      factory.createExpressionStatement(
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("functions"),
                            factory.createIdentifier("sendRxSdo")
                          ),
                          undefined,
                          [
                            factory.createObjectLiteralExpression([
                              factory.createPropertyAssignment("value", factory.createCallExpression(
                                factory.createIdentifier("typedToEndpoint"),
                                undefined,
                                [
                                  factory.createAsExpression(
                                    factory.createIdentifier("value"),
                                    factory.createTypeReferenceNode("Awaited<ReturnType<Endpoints[K]['get']>>")
                                  ),
                                  factory.createPropertyAccessExpression(
                                    factory.createElementAccessExpression(
                                      factory.createIdentifier("endpointIdMap"),
                                      factory.createIdentifier("prop")
                                    ),
                                    factory.createIdentifier("type")
                                  )
                                ]
                              )),
                              factory.createPropertyAssignment("endpointId", factory.createIdentifier("endpointId")),
                              factory.createPropertyAssignment("opcode", factory.createStringLiteral("WRITE")),
                              factory.createPropertyAssignment("reserved", factory.createNumericLiteral("0"))
                            ])
                          ]
                        )
                      ),
                      factory.createReturnStatement(factory.createTrue())
                    ], true)
                  )
                )
              ], true)
            )
          ], true)
        )
      ], true)
    ]
  );

}

function generateEndpointsMap(flat_endpoints: any) {
  const getType = (endpoint: { id: number, type: string }) => {
    if (!['uint64', 'uint32', 'uint8', 'uint16', 'int32', 'int64', 'float', 'bool'].includes(endpoint.type))
      throw 'error' + endpoint.type;
    if (endpoint.type.startsWith('uint') || endpoint.type.startsWith('int') || endpoint.type === 'float') return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    if (endpoint.type.startsWith('bool')) return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  }

  const getTypeString = (type: string) => {
    if (!['uint64', 'uint32', 'uint8', 'uint16', 'int32', 'int64', 'float', 'bool'].includes(type))
      throw 'error' + type;
    if (type.startsWith('uint')) return 'uint';
    if (type.startsWith('int')) return 'int';
    if (type === 'float') return 'float';
    if (type.startsWith('bool')) return 'boolean';
    throw new Error('invalid state')
  }

  const endpoints = Object.keys(flat_endpoints.endpoints).filter((endpoint) => !['endpoint_ref', 'function'].includes(flat_endpoints.endpoints[endpoint].type))

  return [
    factory.createInterfaceDeclaration(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier(`Endpoints`),
      undefined,
      undefined,
      endpoints.map((endpoint) =>
        factory.createPropertySignature(
          undefined,
          factory.createStringLiteral(endpoint),
          undefined,
          ts.factory.createTypeReferenceNode("Endpoint", [
            getType(flat_endpoints.endpoints[endpoint])!
          ])
        )
      )
    ),
    factory.createVariableStatement(
      [],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            'endpointIdMap',
            undefined,
            factory.createTypeReferenceNode("Record", [
              factory.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                factory.createTypeReferenceNode("Endpoints")
              ),
              factory.createTypeLiteralNode([
                factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier("id"),
                  undefined,
                  factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                ),
                factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier("type"),
                  undefined,
                  factory.createUnionTypeNode(['float', 'uint', 'int', 'boolean'].map(a => factory.createLiteralTypeNode(factory.createStringLiteral(a))))
                ),
              ])
            ]),
            factory.createObjectLiteralExpression(
              endpoints.map((endpoint) =>
                factory.createPropertyAssignment(
                  factory.createStringLiteral(endpoint),
                  factory.createObjectLiteralExpression([
                    factory.createPropertyAssignment(factory.createStringLiteral('id'), factory.createNumericLiteral(flat_endpoints.endpoints[endpoint].id)),
                    factory.createPropertyAssignment(factory.createStringLiteral('type'), factory.createStringLiteral(getTypeString(flat_endpoints.endpoints[endpoint].type))),
                  ])
                )
              ),
              true
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    )
  ]
}

export function generateTsDefinitionsFromDBC(dbc: DBC, axisCount: number, axisPackets: number, flat_endpoints: any) {
  const nodes: ts.Statement[] = [];

  nodes.push(...generateImports())

  dbc.messages.forEach((message) => {
    nodes.push(generateMessageInterface(message));
    nodes.push(...generateLookupsMaps(message));
    nodes.push(generateParseFunction(message));
    nodes.push(generateCreateBufferFunction(message));
  });

  nodes.push(generatePacketsEnum(dbc))
  nodes.push(...generatePacketsMaps(dbc))
  nodes.push(...generateEndpointsMap(flat_endpoints))
  nodes.push(generateAPIFunctions(dbc, axisCount, axisPackets));


  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const sourceFile = factory.createSourceFile(
    nodes,
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );

  return printer.printFile(sourceFile);
}

// Example usage
const filePath = 'odrive-protocol.dbc';
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  const dbcData = parseDBC(data);
  const axisCount = dbcData.messages.reduce((curr, { name }) => {
    const axisname = name.split('_')[0].substring('Axis'.length);
    if (!curr.includes(axisname))
      curr.push(axisname);
    return curr;
  }, [] as string[]).length;
  const axisPackets = dbcData.messages.filter(({ name }) => name.includes('Axis0')).reduce((curr, { id }) => Math.max(curr, id), 0) + 1;

  const flat_endpoints = JSON.parse(fs.readFileSync('flat_endpoints.json', 'utf8'));
  const tsDefinitions = generateTsDefinitionsFromDBC({ messages: dbcData.messages.filter(({ name }) => name.includes('Axis0')).map(({ name, ...fields }) => ({ name: name.substring('Axis0_'.length), ...fields })) }, axisCount, axisPackets, flat_endpoints);
  fs.writeFileSync(join(dirname(__dirname), '../src/generated-api.ts'), tsDefinitions, { encoding: 'utf-8' })
});