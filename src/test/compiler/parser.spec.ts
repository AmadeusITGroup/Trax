// trax:ignore
import * as assert from 'assert';
import { parse } from '../../compiler/parser';

describe('Parser', () => {

    it("should parse simple types", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";
            let foo = "bar";

            @Data class Address {
                street1: string;
                street2: string;
                zipCode: number;
                valid: boolean;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 49,
            values: { Data: 1 }
        }, {
            "className": "Address",
            "classNameEnd": 128,
            "computedProperties": [],
            "pos": 95,
            "properties": [{
                "defaultValue": undefined,
                "end": 154,
                "name": "street1",
                "shallowRef": false,
                "type": {
                    "kind": "string"
                }
            }, {
                "defaultValue": undefined,
                "end": 187,
                "name": "street2",
                "shallowRef": false,
                "type": {
                    "kind": "string"
                }
            }, {
                "defaultValue": undefined,
                "end": 220,
                "name": "zipCode",
                "shallowRef": false,
                "type": {
                    "kind": "number"
                }
            }, {
                "defaultValue": undefined,
                "end": 251,
                "name": "valid",
                "shallowRef": false,
                "type": {
                    "kind": "boolean"
                }
            }]
        }], "1");
    });

    it("should parse reference types", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                bar: Bar;
                $content: Blah;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "pos": 42,
            "classNameEnd": 70,
            "computedProperties": [],
            "properties": [{
                "defaultValue": undefined,
                "end": 92,
                "name": "bar",
                "shallowRef": false,
                "type": {
                    "kind": "reference",
                    "identifier": "Bar"
                }
            }, {
                "defaultValue": undefined,
                "end": 123,
                "name": "$content",
                "shallowRef": false,
                "type": {
                    "identifier": "Blah",
                    "kind": "reference"
                }
            }]
        }], "1");
    })

    it("should parse Arrays", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                bar: Baz[];
                blah: Baz[][];
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "pos": 42,
            "classNameEnd": 70,
            "computedProperties": [],
            "properties": [{
                "defaultValue": undefined,
                "end": 92,
                "name": "bar",
                "shallowRef": false,
                "type": {
                    "kind": "array",
                    "itemType": {
                        "identifier": "Baz",
                        "kind": "reference"
                    }
                }
            }, {
                "defaultValue": undefined,
                "end": 121,
                "name": "blah",
                "shallowRef": false,
                "type": {
                    "itemType": {
                        "itemType": {
                            "identifier": "Baz",
                            "kind": "reference"
                        },
                        "kind": "array",
                    },
                    "kind": "array"
                }
            }]
        }], "1");
    });

    it("should parse Dictionaries", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                dict: { [k: string]: Address }
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "pos": 42,
            "classNameEnd": 70,
            "computedProperties": [],
            "properties": [{
                "defaultValue": undefined,
                "end": 93,
                "name": "dict",
                "shallowRef": false,
                "type": {
                    "kind": "dictionary",
                    "itemType": {
                        "kind": "string"
                    }
                }
            }]
        }], "1");
    });

    it("should parse @ref decorators", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                @ref bar: Bar;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "pos": 42,
            "classNameEnd": 70,
            "computedProperties": [],
            "properties": [{
                "defaultValue": undefined,
                "end": 97,
                "name": "bar",
                "shallowRef": true,
                "type": {
                    "kind": "reference",
                    "identifier": "Bar"
                }
            }]
        }], "1");
    })

    it("should parse base type default values", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                bar = 123;
                baz:string = "abc";
                bar2 = false;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "pos": 42,
            "classNameEnd": 70,
            "computedProperties": [],
            "properties": [
                {
                    "defaultValue": { end: 98, pos: 94, text: " 123" },
                    "end": 92,
                    "name": "bar",
                    "shallowRef": false,
                    "type": { "kind": "number" }
                },
                {
                    "defaultValue": { end: 134, pos: 128, text: ' "abc"' },
                    "end": 119,
                    "name": "baz",
                    "shallowRef": false,
                    "type": { "kind": "string" }
                },
                {
                    "defaultValue": { end: 164, pos: 158, text: " false" },
                    "end": 156,
                    "name": "bar2",
                    "shallowRef": false,
                    "type": { "kind": "boolean" }
                }
            ]
        }], "1");
    })

    // todo parse @computed
});