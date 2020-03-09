import { createFilter } from 'rollup-pluginutils';
import { createSourceFile, ScriptTarget, forEachChild, SyntaxKind } from 'typescript';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var LOG = "log", RX_IGNORE_COMMENT = /\/\/\s*trax:\s*ignore/i, RX_LIST_PATTERN = /Array\s*\</, RX_DICT_PATTERN = /(Map\s*\<)|(Set\s*\<)/, RX_REF_DEPTH = /^ref\.depth\(\s*(\d+)\s*\)$/, RX_LEAD_SPACE = /^(\s+)/, SK = SyntaxKind;
function getSymbols(symbols) {
    var Data = "Data", ref = "ref", computed = "computed";
    if (!symbols) {
        return { Data: Data, ref: ref, computed: computed };
    }
    else {
        return {
            Data: symbols.Data || Data,
            ref: symbols.ref || ref,
            computed: symbols.computed || computed
        };
    }
}
function parse(src, filePath, options) {
    var SYMBOLS = getSymbols(options ? options.symbols : undefined);
    if (!isTraxFile(src))
        return null;
    var srcFile = createSourceFile(filePath, src, ScriptTarget.Latest, /*setParentNodes */ true);
    var result = [];
    var diagnostics = srcFile['parseDiagnostics'];
    if (diagnostics && diagnostics.length) {
        var d = diagnostics[0];
        var info = getLineInfo(src, d.start || -1);
        throw {
            kind: "#Error",
            origin: "TS",
            message: d.messageText.toString(),
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    else {
        // process all parts
        scan(srcFile);
    }
    return result;
    function error(message, node) {
        var txt = node.getFullText() || "";
        var shift = 0;
        if (txt.match(/^(\s+)/)) {
            shift = RegExp.$1.length;
        }
        var info = getLineInfo(src, node.pos + shift);
        throw {
            kind: "#Error",
            origin: "TRAX",
            message: message,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    function scan(node) {
        if (processNode(node)) {
            forEachChild(node, scan);
        }
    }
    function processNode(node) {
        if (!result)
            return false;
        if (node.kind === SK.ImportClause) {
            processImport(node);
            return false;
        }
        else if (node.kind === SK.ClassDeclaration) {
            processClass(node);
            return false;
        }
        return true;
    }
    function isTraxFile(source) {
        return (!source.match(RX_IGNORE_COMMENT) && source.indexOf("@" + SYMBOLS.Data) > -1);
    }
    function processImport(node) {
        if (node.namedBindings) {
            var nmi = node.namedBindings;
            if (nmi.elements) {
                var idx = nmi.elements.length, traxImport = void 0;
                while (idx--) {
                    if (nmi.elements[idx].name.text === SYMBOLS.Data) {
                        traxImport = {
                            kind: "import",
                            pos: nmi.elements[idx].pos,
                            insertPos: nmi.elements[idx].end,
                            values: {}
                        };
                        break;
                    }
                }
                if (traxImport) {
                    idx = nmi.elements.length;
                    while (idx--) {
                        traxImport.values[nmi.elements[idx].name.text] = 1;
                    }
                    result.push(traxImport);
                }
            }
        }
    }
    function processClass(node) {
        var isData = false, decoPos = 0, printLogs = false, decoNode;
        if (node.decorators) {
            var decorators = node.decorators, idx = decorators.length, d = void 0;
            while (idx--) {
                d = decorators[idx];
                if (d.expression.kind === SK.Identifier) {
                    if (d.expression.getText() === SYMBOLS.Data) {
                        isData = true;
                        decoPos = d.expression.pos - 1;
                        decoNode = d;
                        // comment the dataset expression to remove it from generated code (and don't impact line numbers)
                        // this.insert("/* ", d.expression.pos - 1);
                        // this.insert(" */", d.expression.end);
                    }
                    else if (d.expression.getText() === LOG) {
                        printLogs = true;
                    }
                }
            }
        }
        if (!isData)
            return;
        if (!node.name) {
            error("Data class name must be defined", decoNode);
        }
        var obj = {
            kind: "data",
            pos: node.pos,
            decoPos: decoPos,
            className: node.name.text,
            classNameEnd: node.name.end,
            log: printLogs,
            members: []
        };
        if (node.members) {
            var members = node.members, canBeUndefined_1;
            var _loop_1 = function (i, len) {
                canBeUndefined_1 = false;
                var m = members[i];
                // processedPropData = this.processProcessorDecorator(m);
                if (m.kind === SK.Constructor) {
                    error("Constructors are not authorized in Data objects", m["body"] || m);
                }
                else if (m.kind === SK.GetAccessor) {
                    // check @computed properties
                    if (m.decorators && m.decorators.length === 1) {
                        if (m.decorators[0].getText() === "@computed")
                            return "continue";
                    }
                    error("Getters can only be used for @computer properties", m);
                }
                else if (m.kind === SK.SetAccessor) {
                    error("Setters are not supported in trax objects", m);
                }
                else if (m.kind === SK.MethodDeclaration) {
                    if (options && options.acceptMethods)
                        return "continue";
                    error("Methods cannot be defined in this object", m);
                }
                else if (m.kind !== SK.PropertyDeclaration) {
                    error("Invalid class member in trax object", m);
                }
                // add $$ in front of the property name
                var prop = {
                    kind: "property",
                    name: "",
                    namePos: 0,
                    end: m.end,
                    shallowRef: 0,
                    shallowRefPos: 0,
                    type: undefined,
                    defaultValue: undefined
                };
                updateShallowRef(m, prop);
                m.forEachChild(function (c) {
                    if (c.kind === SK.Identifier && !prop.name) {
                        prop.name = c.getText();
                        prop.namePos = c.end - prop.name.length;
                    }
                    else if (c.kind === SK.QuestionToken) {
                        canBeUndefined_1 = true;
                    }
                    else {
                        var tp = getTypeObject(c, false);
                        if (tp) {
                            prop.type = tp;
                        }
                        else if (!handleDefaultValue(c, prop) && c.kind !== SK.Decorator) {
                            if (c.kind === SK.CallExpression || c.kind === SK.NewExpression || c.kind === SK.Identifier) {
                                prop.defaultValue = {
                                    pos: c.pos,
                                    end: c.end,
                                    text: c.getText(),
                                    fullText: c.getFullText(),
                                    isComplexExpression: true
                                };
                            }
                            else if (c.kind === SK.FunctionType) {
                                prop.type = { kind: "any" };
                            }
                            else if (c.kind !== SK.Parameter && c.getText() !== "any") {
                                // console.log(c.getText(), c);
                                error("Unsupported use case [" + c.kind + "]", c);
                            }
                        }
                    }
                });
                if (!prop.type) {
                    prop.type = { kind: "any" };
                }
                if (canBeUndefined_1) {
                    prop.type.canBeUndefined = true;
                }
                {
                    obj.members.push(prop);
                }
            };
            for (var i = 0, len = members.length; len > i; i++) {
                _loop_1(i, len);
            }
        }
        result.push(obj);
    }
    function updateShallowRef(m, prop) {
        if (m.decorators) {
            var decorators = m.decorators, idx = decorators.length, d = void 0;
            while (idx--) {
                d = decorators[idx];
                var e = d.expression.getText();
                if (e === SYMBOLS.ref) {
                    prop.shallowRef = 1;
                }
                else if (e.match(RX_REF_DEPTH)) {
                    prop.shallowRef = parseInt(RegExp.$1, 10);
                }
                if (prop.shallowRef) {
                    prop.shallowRefPos = d.pos;
                    if (d.getFullText().match(RX_LEAD_SPACE)) {
                        prop.shallowRefPos += RegExp.$1.length;
                    }
                }
            }
        }
        return 0;
    }
    function getTypeObject(n, raiseErrorIfInvalid, canBeUnion) {
        if (raiseErrorIfInvalid === void 0) { raiseErrorIfInvalid = false; }
        if (canBeUnion === void 0) { canBeUnion = true; }
        if (n) {
            if (n.kind === SK.ParenthesizedType) {
                var count_1 = 0, childNd_1;
                n.forEachChild(function (c) {
                    count_1++;
                    childNd_1 = c;
                });
                if (childNd_1 && count_1 === 1) {
                    n = childNd_1;
                }
                else {
                    error("Unsupported case", n);
                }
            }
            if (n.kind === SK.AnyKeyword) {
                return { kind: "any" };
            }
            if (n.kind === SK.StringKeyword) {
                return { kind: "string" };
            }
            else if (n.kind === SK.BooleanKeyword) {
                return { kind: "boolean" };
            }
            else if (n.kind === SK.NumberKeyword) {
                return { kind: "number" };
            }
            else if (n.getText() === "Function") {
                return { kind: "any" };
            }
            else if (n.kind === SK.TypeReference) {
                if (options && options.interfaceTypes
                    && options.interfaceTypes.indexOf(n.getText()) > -1) {
                    return { kind: "any" };
                }
                var ref = n.getText();
                if (ref.match(RX_LIST_PATTERN)) {
                    error("Array collections must be defined through the xxx[] notation", n);
                }
                else if (ref.match(RX_DICT_PATTERN)) {
                    error("Maps and Sets are not supported. Please use Dictionary Objects instead", n);
                }
                return {
                    kind: "reference",
                    identifier: ref
                };
            }
            else if (n.kind === SK.ArrayType) {
                return {
                    kind: "array",
                    itemType: getTypeObject(n["elementType"], true, true)
                };
            }
            else if (n.kind === SK.TypeLiteral) {
                // expected to be something like dict: { [key: string]: Address }
                var members = n.members;
                if (members && members.length === 1 && members[0].kind === SK.IndexSignature) {
                    var idxSignature = members[0], parameters = idxSignature.parameters;
                    if (parameters && parameters.length === 1) {
                        var idxType = getTypeObject(parameters[0].type, true, true);
                        var itmType = getTypeObject(idxSignature.type, true, true);
                        if (!idxType || idxType.kind !== "string") {
                            error("Dictionaries can only be indexed by strings", n);
                        }
                        return {
                            kind: "dictionary",
                            indexName: parameters[0].name.getText(),
                            indexType: idxType,
                            itemType: itmType
                        };
                    }
                }
            }
            else if (canBeUnion && n.kind === SK.UnionType) {
                // types should be either undefined or DataNode types
                var ut = n, canBeNull = false, canBeUndefined = false;
                if (ut.types) {
                    var idx = ut.types.length, dt = null;
                    while (idx--) {
                        var tp = ut.types[idx];
                        if (tp.kind === SK.NullKeyword) {
                            canBeNull = true;
                        }
                        else if (tp.kind === SK.UndefinedKeyword) {
                            canBeUndefined = true;
                        }
                        else {
                            if (dt !== null) {
                                error("Multiple data types are not supported", tp);
                            }
                            dt = getTypeObject(tp, false, false);
                            if (!dt) {
                                error("Unsupported type", tp);
                                return null;
                            }
                        }
                    }
                    if (dt && (canBeNull || canBeUndefined)) {
                        dt.canBeNull = dt.canBeNull || canBeNull;
                        dt.canBeUndefined = dt.canBeUndefined || canBeUndefined;
                        return dt;
                    }
                }
            }
        }
        if (raiseErrorIfInvalid && n.kind !== SK.Decorator) {
            // console.log("Unsupported type", n)
            error("Unsupported type", n);
        }
        return null;
    }
    function handleDefaultValue(n, prop) {
        if (n) {
            var kind = "", complexExpr = false;
            if (n.kind === SK.StringLiteral) {
                kind = "string";
            }
            else if (n.kind === SK.NumericLiteral) {
                kind = "number";
            }
            else if (n.kind === SK.PrefixUnaryExpression || n.kind === SK.PostfixUnaryExpression) {
                var operand = n.operand;
                if (operand.kind === SK.NumericLiteral) {
                    kind = "number";
                }
                else if (operand.kind === SK.Identifier) {
                    kind = "any";
                }
                complexExpr = true;
            }
            else if (n.kind === SK.TrueKeyword || n.kind === SK.FalseKeyword) {
                kind = "boolean";
            }
            else if (n.kind === SK.ArrayLiteralExpression) {
                kind = "any";
                complexExpr = true;
            }
            else if (n.kind === SK.NullKeyword || n.kind === SK.UndefinedKeyword) {
                if (prop.type && prop.type.kind) {
                    kind = prop.type.kind;
                }
                else {
                    kind = "any";
                }
            }
            if (kind !== "") {
                prop.defaultValue = {
                    pos: n.pos,
                    end: n.end,
                    text: n.getText(),
                    fullText: n.getFullText(),
                    isComplexExpression: complexExpr
                };
                if (!prop.type) {
                    prop.type = {
                        kind: kind
                    };
                }
                return true;
            }
        }
        return false;
    }
}
function getLineInfo(src, pos) {
    var lines = src.split("\n"), lineLen = 0, posCount = 0, idx = 0;
    if (pos > -1) {
        while (idx < lines.length) {
            lineLen = lines[idx].length;
            if (posCount + lineLen < pos) {
                // continue
                idx++;
                posCount += lineLen + 1; // +1 for carriage return
            }
            else {
                // stop
                return {
                    lineNbr: idx + 1,
                    lineContent: lines[idx],
                    columnNbr: 1 + pos - posCount
                };
            }
        }
    }
    return {
        lineNbr: 0,
        lineContent: "",
        columnNbr: 0
    };
}

var PRIVATE_PREFIX = "ΔΔ", CLASS_DECO = "ΔD", RX_LOG = /\/\/\s*trax\:\s*log/, RX_NULL_TYPE = /\|\s*null$/, SEPARATOR = "----------------------------------------------------------------------------------------------------";
function generate(src, filePath, options) {
    var symbols = getSymbols(options ? options.symbols : undefined), libPrefix = options ? (options.libPrefix || "") : "", logErrors = options ? (options.logErrors !== false) : true;
    var output = src, outputShift = 0, ast, traxImport, importList = [], // list of new imports
    importDict, importDictForced = {};
    try {
        ast = parse(src, filePath, {
            symbols: symbols,
            acceptMethods: options ? options.acceptMethods : true,
            interfaceTypes: options ? options.interfaceTypes : undefined
        });
        if (ast && ast.length) {
            initImports(ast);
            var len = ast.length;
            for (var i = 1; len > i; i++) {
                if (ast[i].kind === "import") {
                    error("Duplicate Data import", ast[i]);
                }
                else {
                    processDataObject(ast[i]);
                }
            }
            updateImports();
        }
    }
    catch (e) {
        if (logErrors) {
            var err = e, msg = void 0;
            if (err.kind === "#Error") {
                var ls = "  >  ";
                msg = ls + " " + err.origin + ": " + e.message + "\n"
                    + (ls + " File: " + e.file + " - Line " + e.line + " / Col " + e.column + "\n")
                    + (ls + " Extract: >> " + e.lineExtract + " <<");
            }
            else {
                msg = e.message || e;
            }
            console.error("\n" + SEPARATOR + "\n" + msg + "\n" + SEPARATOR);
        }
        throw e;
    }
    if (src.match(RX_LOG)) {
        console.log(SEPARATOR);
        console.log("Trax Output:");
        console.log(output);
    }
    return output;
    function error(msg, node) {
        if (node === void 0) { node = null; }
        var info = getLineInfo(src, node ? node["pos"] || node["namePos"] || -1 : -1);
        throw {
            kind: "#Error",
            origin: "TRAX",
            message: msg,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    function initImports(ast) {
        if (ast[0].kind !== "import") {
            error("@" + symbols.Data + " import not found", null);
            return; // not reachable as error throws
        }
        traxImport = ast[0];
        importDict = traxImport.values;
    }
    function addImport(symbol, force) {
        if (force === void 0) { force = false; }
        if ((force && !importDictForced[symbol]) || !importDict[symbol]) {
            importDict[symbol] = 1;
            importList.push(symbol);
            if (force) {
                importDictForced[symbol] = 1;
            }
        }
    }
    function updateImports() {
        // must be called at the end as it resets outputShift
        outputShift = 0; // to use insert() or replace() from the beginning
        replace(symbols.Data, importList.join(", "), traxImport.insertPos - symbols.Data.length);
    }
    // insert must be called in incremental order - i.e. n+1 calls must have a bigger position 
    // (otherwise will lead to unexpected result!)
    function insert(text, position) {
        // console.log("insert at", position, ": ", text);
        var pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + text + output.slice(pos);
            outputShift += text.length;
        }
    }
    function replace(str1, str2, position) {
        var pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + str2 + output.slice(pos + str1.length);
            outputShift += str2.length - str1.length;
        }
    }
    function replaceRegExp(rx, str, position) {
        var pos = position + outputShift, output1 = output.slice(0, pos), len1 = output1.length, output2 = output1.replace(rx, str);
        // console.log("-----")
        // console.log("output1",output1+"<<")
        // console.log("output2",output2+"<<")
        // console.log("shift", output2.length - len1)
        outputShift += output2.length - len1;
        output = output2 + output.slice(pos);
    }
    function endsWithSemiColon(position) {
        var pos = position + outputShift;
        if (output && output.slice(0, pos).match(/\;\s*$/)) {
            return true;
        }
        return false;
    }
    function processDataObject(n) {
        // transform @Data decorator -> @ΔD()
        if (!options || options.replaceDataDecorator !== false) {
            replace("@" + symbols.Data, getClassDecorator(libPrefix), n.decoPos);
            addImport(libPrefix + CLASS_DECO, true);
        }
        else {
            addImport(symbols.Data, true);
        }
        var len = n.members.length, prop, m, tp, defaultValues = [], lastInsertPos = -1;
        for (var i = 0; len > i; i++) {
            m = n.members[i];
            if (m.kind === "property") {
                try {
                    prop = m;
                    if (m.shallowRef > 0) {
                        // remove @ref reference
                        replaceRegExp(/\@ref(\.depth\(\s*\d+\s*\))?\s*$/, "", prop.namePos);
                    }
                    insert(PRIVATE_PREFIX, prop.namePos);
                    tp = prop.type;
                    if (tp) {
                        if (m.defaultValue && m.defaultValue.isComplexExpression) {
                            replaceRegExp(/\s*\=\s*$/, "", m.defaultValue.pos);
                            replace(m.defaultValue.fullText, "", m.defaultValue.pos);
                        }
                        if (!endsWithSemiColon(prop.end)) {
                            insert(";", prop.end);
                        }
                        // add new property definition
                        // e.g. @Δp(ΔfStr) street: string;
                        insert(" " + propertyDefinition(prop, false), prop.end);
                        lastInsertPos = prop.end;
                        // insert(` @Δp(${factory}${nullArg1}) ${prop.name}: ${typeRef};`, prop.end);
                        if (prop.defaultValue) {
                            defaultValues.push("case \"" + prop.name + "\": return " + prop.defaultValue.text);
                        }
                    }
                    else {
                        // this case should not be reachable
                        error("Invalid case", n);
                    }
                }
                catch (ex) {
                    error(ex.message, n);
                }
            }
            if (options && options.validator) {
                var errMsg = options.validator(m);
                if (errMsg) {
                    error(errMsg, m);
                }
            }
        }
        if (defaultValues.length && lastInsertPos > -1) {
            // build default value function
            addImport(libPrefix + "Δu");
            insert(" \u0394Default(n) {switch (n) {" + defaultValues.join("; ") + "}; return " + libPrefix + "\u0394u;};", lastInsertPos);
        }
    }
    function getClassDecorator(libPrefix) {
        if (libPrefix === void 0) { libPrefix = ""; }
        return "@" + libPrefix + CLASS_DECO;
    }
    function propertyDefinition(m, includePrivateDefinition) {
        if (includePrivateDefinition === void 0) { includePrivateDefinition = true; }
        var tp = m.type, _a = getTypeInfo(tp, m.shallowRef || 1000), typeRef = _a.typeRef, factory = _a.factory, privateDef = "", nullUndefinedArg = "", questionSymbol = "";
        if (tp && (tp.canBeNull || tp.canBeUndefined)) {
            if (tp.canBeNull && tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 3";
            }
            else if (tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 2";
            }
            else {
                nullUndefinedArg = ", 1";
            }
        }
        if (includePrivateDefinition) {
            privateDef = "" + PRIVATE_PREFIX + m.name + ": " + typeRef + "; ";
        }
        if (nullUndefinedArg) {
            factory = factory || "0"; // factory arg cannot be empty if second argument is passed
        }
        addImport(libPrefix + "Δp");
        var dv = '';
        if (m.defaultValue && m.defaultValue.isComplexExpression) {
            dv = " = " + m.defaultValue.text;
        }
        return privateDef + "@" + libPrefix + "\u0394p(" + factory + nullUndefinedArg + ") " + m.name + questionSymbol + ": " + typeRef + dv + ";";
    }
    function getTypeInfo(tp, refDepth) {
        var typeRef = "", factory = "";
        if (!tp) {
            return { typeRef: "any", factory: "" };
        }
        if (tp.kind === "any") {
            typeRef = "any";
            factory = "";
        }
        else if (tp.kind === "string") {
            typeRef = "string";
            factory = libPrefix + "ΔfStr";
        }
        else if (tp.kind === "number") {
            typeRef = "number";
            factory = libPrefix + "ΔfNbr";
        }
        else if (tp.kind === "boolean") {
            typeRef = "boolean";
            factory = libPrefix + "ΔfBool";
        }
        else if (tp.kind === "reference") {
            typeRef = tp.identifier;
            factory = libPrefix + "Δf(" + typeRef + ")";
        }
        else if (tp.kind === "array") {
            if (tp.itemType) {
                var info = getTypeInfo(tp.itemType, refDepth - 1);
                if (info.typeRef.match(RX_NULL_TYPE)) {
                    typeRef = "(" + info.typeRef + ")[]";
                }
                else {
                    typeRef = info.typeRef + "[]";
                }
                factory = libPrefix + "Δlf(" + info.factory + ")";
            }
            else {
                // this case should not occur (caught by parser)
                throw "Item type must be specified in Arrays";
            }
        }
        else if (tp.kind === "dictionary") {
            if (tp.itemType) {
                var info = getTypeInfo(tp.itemType, refDepth - 1);
                typeRef = "{ [" + tp.indexName + ": string]: " + info.typeRef + " }";
                factory = libPrefix + "Δdf(" + info.factory + ")";
            }
            else {
                // this case should not occur (caught by parser)
                throw "Invalid Dictionary type";
            }
        }
        else {
            // this case will only occur when a new type kind is introduced
            throw "TODO: support type " + tp.kind;
        }
        if (tp.canBeNull) {
            typeRef += " | null";
        }
        if (refDepth <= 1) {
            factory = "ΔfRef";
            addImport("ΔfRef");
        }
        else if (factory !== "" && factory.match(/^([^\(]+)/)) {
            addImport(RegExp.$1);
        }
        return { typeRef: typeRef, factory: factory };
    }
}

function ivy(opts) {
    if (opts === void 0) { opts = {}; }
    if (!opts.include) {
        opts.include = '**/*.ts';
    }
    var filter = createFilter(opts.include, opts.exclude);
    return {
        name: 'trax',
        transform: function (code, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    if (!filter(fileId))
                        return [2 /*return*/, null];
                    try {
                        result = generate(code, fileId);
                    }
                    catch (e) {
                        this.error(e.message || e);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, result];
                });
            });
        }
    };
}

export default ivy;
