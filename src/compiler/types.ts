
export interface TraxImport {
    insertPos: number;              // position after the Data import
    values: { [key: string]: 1 };   // list of identifiers defined in the import statement
}

export interface DataObject {
    pos: number;
    className: string;
    classNameEnd: number;
    properties: DataProperty[];
    computedProperties: ComputedProperty[];
    // constructor: xxx - tbd: shall we support constructor?
    // validator: xxx - tbd: validator function?
}

export interface DataProperty {
    end: number,
    name: string;
    type: DataType | undefined;
    shallowRef: boolean;
    defaultValue: CodeFragment | undefined;
    // getter: xxx - tbd: shall we support getter functions?
    // setter: xxx - tbd: shall we support setter functions?
}

export interface ComputedProperty {
    name: string;
    code: CodeFragment;
}

interface CodeFragment {
    pos: number;
    end: number;
    text: string;
}

export type DataType = BaseType | RefType | CollectionType;

interface BaseType {
    kind: "string" | "number" | "boolean";
}

interface RefType {
    kind: "reference";
    identifier: string;        // e.g. "Foo"
}

interface CollectionType {
    kind: "array" | "map" | "dictionary";
    itemType: DataType;
}
