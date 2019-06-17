import { TraxImport, DataObject, DataProperty, DataType } from './types';
import * as ts from "typescript";

const DATA = "Data",
    LOG = "log",
    REF = "ref",
    RX_IGNORE_COMMENT = /\/\/\s*trax:ignore/i,
    RX_FILE = /\@Data/;

export function parse(src: string, filePath: string): (TraxImport | DataObject)[] | null {
    if (!isTraxFile(src)) return null;

    let srcFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, /*setParentNodes */ true);
    let traxImportFound = false, result: (TraxImport | DataObject)[] | null = [];

    let diagnostics = srcFile['parseDiagnostics'];
    if (diagnostics && diagnostics.length) {
        let d: ts.Diagnostic = diagnostics[0] as any;
        // TODO
        // this.logError("TypeScript parsing error: " + d.messageText.toString(), d.start || 0)
        result = null;
    } else {
        // process all parts
        scan(srcFile);
    }

    return result;

    function error(message: string, node: ts.Node) {
        // TODO
        throw new Error(message + " at pos: " + node.pos);
    }

    function scan(node: ts.Node) {
        if (processNode(node)) {
            ts.forEachChild(node, scan);
        }
    }

    function processNode(node: ts.Node): boolean {
        if (!result) return false;

        if (node.kind === ts.SyntaxKind.ImportClause) {
            processImport(node as ts.ImportClause);
            return false;
        } else if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            processClass(node as ts.ClassDeclaration);
            return false;
        } else {
            //console.log("Node: ", node.kind)
            //debugger
        }

        return true;
    }

    function isTraxFile(source: string): boolean {
        return (!source.match(RX_IGNORE_COMMENT) && source.match(RX_FILE) !== null);
    }

    function processImport(node: ts.ImportClause) {
        if (traxImportFound) return;
        if (node.namedBindings) {
            let nmi = <ts.NamedImports>node.namedBindings;
            if (nmi.elements) {
                let idx = nmi.elements.length, traxImport: TraxImport | undefined;
                while (idx--) {
                    if (nmi.elements[idx].name.text === DATA) {
                        traxImport = {
                            kind: "import",
                            insertPos: nmi.elements[idx].end,
                            values: {}
                        }
                        break;
                    }
                }
                if (traxImport) {
                    traxImportFound = true;
                    idx = nmi.elements.length;
                    while (idx--) {
                        traxImport.values[nmi.elements[idx].name.text] = 1
                    }
                    result!.push(traxImport);
                }
            }
        }
    }

    function processClass(node: ts.ClassDeclaration) {
        let isData = false, decoPos = 0, printLogs = false;
        if (node.decorators) {
            let decorators = node.decorators, idx = decorators.length, d: ts.Decorator;
            while (idx--) {
                d = decorators[idx];
                if (d.expression.kind === ts.SyntaxKind.Identifier) {
                    if (d.expression.getText() === DATA) {
                        isData = true;
                        decoPos = d.expression.pos - 1;
                        // comment the dataset expression to remove it from generated code (and don't impact line numbers)
                        // this.insert("/* ", d.expression.pos - 1);
                        // this.insert(" */", d.expression.end);
                    } else if (d.expression.getText() === LOG) {
                        printLogs = true;
                    }
                }
            }
        }
        if (!isData) return;

        if (!node.name) {
            error("Data class name must be defined", node);
        }

        let obj: DataObject = {
            kind: "data",
            pos: node.pos,
            decoPos: decoPos,
            className: node.name!.text,
            classNameEnd: node.name!.end,
            log: printLogs,
            members: []
        }

        if (node.members) {
            let members = node.members, name, isSimpleType = false, processedPropData: [string, string] | null, typeName: string, canBeUndefined: boolean;
            for (let i = 0, len = members.length; len > i; i++) {
                isSimpleType = false;
                canBeUndefined = false;
                typeName = "";
                let m = members[i];
                // processedPropData = this.processProcessorDecorator(m);

                if (m.kind === ts.SyntaxKind.Constructor) {
                    error("Constructors are not authorized in Data objects", m);
                } else if (m.kind !== ts.SyntaxKind.PropertyDeclaration) {
                    error("Invalid Data object member [kind: " + m.kind + "]", m);
                }

                // add $$ in front of the property name
                let prop: DataProperty = {
                    kind: "property",
                    name: "",
                    namePos: 0,
                    end: m.end,
                    shallowRef: hasRefDecorator(m),
                    type: undefined,
                    defaultValue: undefined
                }
                m.forEachChild((c) => {
                    if (c.kind === ts.SyntaxKind.Identifier) {
                        prop.name = c.getText();
                        prop.namePos = c.end - prop.name.length;
                    } else {
                        let tp = getTypeObject(c, false);
                        if (tp) {
                            prop.type = tp;
                        } else if (!handleDefaultValue(c, prop) && c.kind !== ts.SyntaxKind.Decorator) {
                            if (c.kind !== ts.SyntaxKind.Parameter && c.getText() !== "any") {
                                error("Unsupported syntax", c);
                            }
                        }
                    }
                });
                if (!prop.type) {
                    prop.type = { kind: "any" };
                }
                obj.members.push(prop);
            }
        }

        result!.push(obj);
    }

    function hasRefDecorator(m: ts.ClassElement): boolean {
        if (m.decorators) {
            let decorators = m.decorators, idx = decorators.length, d: ts.Decorator;
            while (idx--) {
                d = decorators[idx];
                let e = d.expression;
                if (e.getText() === REF) return true
            }
        }
        return false;
    }

    function getTypeObject(n: ts.Node, raiseErrorIfInvalid = false, canBeUnion = true): DataType | null {
        if (n) {
            if (n.kind === ts.SyntaxKind.ParenthesizedType) {
                let count = 0, childNd: ts.Node | undefined;
                (n as ts.ParenthesizedTypeNode).forEachChild((c) => {
                    count++;
                    childNd = c;
                });
                if (childNd && count === 1) {
                    n = childNd;
                } else {
                    error("Unsupported parenthesized type", n);
                }
            }
            if (n.kind === ts.SyntaxKind.AnyKeyword) {
                return { kind: "any" }
            } if (n.kind === ts.SyntaxKind.StringKeyword) {
                return { kind: "string" }
            } else if (n.kind === ts.SyntaxKind.BooleanKeyword) {
                return { kind: "boolean" }
            } else if (n.kind === ts.SyntaxKind.NumberKeyword) {
                return { kind: "number" }
            } else if (n.kind === ts.SyntaxKind.TypeReference) {
                return {
                    kind: "reference",
                    identifier: n.getText()
                }
            } else if (n.kind === ts.SyntaxKind.ArrayType) {
                return {
                    kind: "array",
                    itemType: getTypeObject(n["elementType"], true, true) as any
                }
            } else if (n.kind === ts.SyntaxKind.TypeLiteral) {
                // expected to be something like dict: { [key: string]: Address }
                let members = (n as ts.TypeLiteralNode).members;
                if (members && members.length === 1 && members[0].kind === ts.SyntaxKind.IndexSignature) {
                    let idxSignature = members[0] as ts.IndexSignatureDeclaration, parameters = idxSignature.parameters;
                    if (parameters && parameters.length === 1) {
                        let tp = getTypeObject(parameters[0].type!);
                        return {
                            kind: "dictionary",
                            itemType: tp!
                        }
                    }
                }
            } else if (canBeUnion && n.kind === ts.SyntaxKind.UnionType) {
                // types should be either undefined or DataNode types
                let ut = <ts.UnionTypeNode>n, canBeNull = false;
                if (ut.types) {
                    let idx = ut.types.length, dt: DataType | null = null;
                    while (idx--) {
                        let tp = ut.types[idx];
                        if (tp.kind === ts.SyntaxKind.NullKeyword) {
                            canBeNull = true;
                        } else {
                            dt = getTypeObject(tp, false, false);
                            if (!dt) {
                                error("Invalid value in union type", tp);
                                return null;
                            }
                        }
                    }
                    if (dt && canBeNull) {
                        dt.canBeNull = true;
                        return dt;
                    }
                }
            }
        }
        if (raiseErrorIfInvalid && n.kind !== ts.SyntaxKind.Decorator) {
            console.log("Unsupported type", n)
            error("Unsupported type", n);
        }
        return null;
    }

    function handleDefaultValue(n: ts.Node, prop: DataProperty): boolean {
        if (n) {
            let v: string = "", kind = "";
            if (n.kind === ts.SyntaxKind.StringLiteral) {
                kind = "string";
            } else if (n.kind === ts.SyntaxKind.NumericLiteral) {
                kind = "number";
            } else if (n.kind === ts.SyntaxKind.TrueKeyword || n.kind === ts.SyntaxKind.FalseKeyword) {
                kind = "boolean";
            }
            if (kind !== "") {
                prop.defaultValue = {
                    pos: n.pos,
                    end: n.end,
                    text: n.getFullText()
                }
                if (!prop.type) {
                    prop.type = {
                        kind: kind as any
                    }
                }
                return true;
            }
        }
        return false;
    }
}

