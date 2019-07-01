import { parse, ParserSymbols, getSymbols } from './parser';
import { DataObject, TraxImport, DataProperty, ComputedProperty, DataType, DataMember } from './types';

const PRIVATE_PREFIX = "ΔΔ",
    CLASS_DECO = "ΔD", RX_LOG = /\/\/\s*trax\:\s*log/,
    RX_NULL_TYPE = /\|\s*null$/;

export function generate(src: string, filePath: string, symbols?: ParserSymbols, libPrefix = ""): string {
    const SYMBOLS = getSymbols(symbols);

    let output = src,
        outputShift = 0,
        ast: null | (TraxImport | DataObject)[],
        traxImport: TraxImport,
        importList: string[] = [], // list of new imports
        importDict: { [key: string]: 1 };

    try {
        ast = parse(src, filePath, symbols);
        if (ast && ast.length) {
            initImports(ast);

            let len = ast.length;
            for (let i = 1; len > i; i++) {
                if (ast[i].kind === "import") {
                    error("Duplicate Data import", ast[i]);
                } else {
                    processDataObject(ast[i] as DataObject);
                }
            }
            updateImports();
        }
    } catch (ex) {
        error(ex);
    }

    if (src.match(RX_LOG)) {
        console.log("-----------------------------------------------------------------------------");
        console.log("Trax Ouput:");
        console.log(output);
    }

    return output;

    function error(msg: string, node: DataObject | TraxImport | null = null) {
        // todo
        throw new Error("[TRAX]" + msg + " - file: " + filePath);
    }

    function initImports(ast: (TraxImport | DataObject)[]) {
        if (ast[0].kind !== "import") {
            error("@Data import not found", null);
            return; // not reachable as error throws
        }
        traxImport = ast[0] as TraxImport;
        importDict = traxImport.values;
    }

    function addImport(symbol: string) {
        if (!importDict[symbol]) {
            importDict[symbol] = 1;
            importList.push(symbol);
        }
    }

    function updateImports() {
        // must be called at the end as it resets outputShift

        outputShift = 0; // to use insert() or replace() from the beginning
        replace(SYMBOLS.Data, importList.join(", "), traxImport.insertPos - SYMBOLS.Data.length);
    }

    // insert must be called in incremental order - i.e. n+1 calls must have a bigger position 
    // (otherwise will lead to unexpected result!)
    function insert(text: string, position: number) {
        // console.log("insert at", position, ": ", text);
        let pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + text + output.slice(pos);
            outputShift += text.length;
        }
    }

    function replace(str1: string, str2: string, position: number) {
        let pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + str2 + output.slice(pos + str1.length);
            outputShift += str2.length - str1.length;
        }
    }

    function endsWithSemiColon(position: number): boolean {
        let pos = position + outputShift;
        if (output && output.slice(0, pos).match(/\;\s*$/)) {
            return true;
        }
        return false
    }

    function processDataObject(n: DataObject) {
        // transform @Data decorator -> @ΔD()
        replace("@" + SYMBOLS.Data, getClassDecorator(libPrefix), n.decoPos);
        addImport(libPrefix + CLASS_DECO);

        let len = n.members.length,
            prop: DataProperty,
            m: DataProperty | ComputedProperty,
            tp: DataType | undefined,
            defaultValues: string[] = [],
            lastInsertPos = -1;
        for (let i = 0; len > i; i++) {
            m = n.members[i]
            if (m.kind === "property") {
                try {
                    prop = m as DataProperty;
                    insert(PRIVATE_PREFIX, prop.namePos);

                    tp = prop.type;
                    if (tp) {
                        if (!endsWithSemiColon(prop.end)) {
                            insert(";", prop.end);
                        }
                        // add new property definition
                        // e.g. @Δp(ΔfStr) street: string;
                        insert(" " + propertyDefinition(prop, false), prop.end);
                        lastInsertPos = prop.end;
                        // insert(` @Δp(${factory}${nullArg1}) ${prop.name}: ${typeRef};`, prop.end);

                        if (prop.defaultValue) {
                            defaultValues.push(`case "${prop.name}": return ${prop.defaultValue.text}`);
                        }
                    } else {
                        throw new Error("Untyped property are not supported");
                    }
                } catch (ex) {
                    error(ex.message, n);
                }
            }
        }
        if (defaultValues.length && lastInsertPos > -1) {
            // build default value function
            addImport(libPrefix + "Δu");
            insert(` ΔDefault(n) {switch (n) {${defaultValues.join("; ")}}; return ${libPrefix}Δu;};`, lastInsertPos);
        }
    }


    function getClassDecorator(libPrefix = "", addImport?: (symbol: string) => void) {
        if (addImport) {
            addImport(libPrefix + CLASS_DECO);
        }
        return "@" + libPrefix + CLASS_DECO;
    }

    function getPropertyDefinition(m: DataMember) {
        return propertyDefinition(m, true);
    }

    function propertyDefinition(m: DataMember, includePrivateDefinition = true): string {
        let tp = m.type, { typeRef, factory } = getTypeInfo(tp), privateDef = "", nullUndefinedArg = "", questionSymbol = "";
        if (tp && (tp.canBeNull || tp.canBeUndefined)) {
            if (tp.canBeNull && tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 3";
            } else if (tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 2";
            } else {
                nullUndefinedArg = ", 1";
            }
        }

        if (includePrivateDefinition) {
            privateDef = `${PRIVATE_PREFIX}${m.name}: ${typeRef}; `
        }

        addImport(libPrefix + "Δp");
        return `${privateDef}@${libPrefix}Δp(${factory}${nullUndefinedArg}) ${m.name}${questionSymbol}: ${typeRef};`;
    }


    function getTypeInfo(tp: DataType | undefined): { typeRef: string, factory: string } {
        let typeRef = "", factory = "";
        if (!tp) {
            return { typeRef: "any", factory: "" };
        }

        if (tp.kind === "any") {
            typeRef = "any";
            factory = "";
        } else if (tp.kind === "string") {
            typeRef = "string";
            factory = libPrefix + "ΔfStr";
            addImport(factory);
        } else if (tp.kind === "number") {
            typeRef = "number";
            factory = libPrefix + "ΔfNbr";
            addImport(factory);
        } else if (tp.kind === "boolean") {
            typeRef = "boolean";
            factory = libPrefix + "ΔfBool";
            addImport(factory);
        } else if (tp.kind === "reference") {
            typeRef = tp.identifier;
            factory = libPrefix + "Δf(" + typeRef + ")";
            addImport(libPrefix + "Δf");
        } else if (tp.kind === "array") {
            if (tp.itemType) {
                let info = getTypeInfo(tp.itemType);
                if (info.typeRef.match(RX_NULL_TYPE)) {
                    typeRef = "(" + info.typeRef + ")[]"
                } else {
                    typeRef = info.typeRef + "[]"
                }
                factory = libPrefix + "Δlf(" + info.factory + ")";
                addImport(libPrefix + "Δlf");
            } else {
                throw new Error("Item type must be specified in Arrays");
            }
        } else {
            throw new Error("Generator doesn't support type " + tp.kind + " yet");
        }
        if (tp.canBeNull) {
            typeRef += " | null";
        }
        return { typeRef, factory };
    }
}
