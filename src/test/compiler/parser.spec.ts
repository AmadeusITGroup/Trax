// trax:ignore
import * as assert from 'assert';
import { parse } from '../../trax/compiler/parser';

describe('Parser', () => {

    it("should ignore files that don't contain @Data", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";
            
            function foo() {
                return "bar"
            }
        `, "file1.ts");

        assert.deepEqual(r, null, "1");
    });

    it("should ignore files that contain the ignore comment", async function () {
        let r = parse(`\
            // trax:ignore
            import { Data } from "./trax";
            
            @Data class Address {
                street1: string;
                street2: string;
                zipCode: number;
                valid: boolean;
            }
        `, "file1.ts");

        assert.deepEqual(r, null, "1");
    });

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
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Address",
            "classNameEnd": 128,
            "log": false,
            "pos": 95,
            "decoPos": 109,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 163,
                "namePos": 147,
                "name": "street1",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "string"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 196,
                "namePos": 180,
                "name": "street2",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "string"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 229,
                "namePos": 213,
                "name": "zipCode",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "number"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 261,
                "namePos": 246,
                "name": "valid",
                "shallowRef": 0,
                "shallowRefPos": 0,
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
            kind: "import",
            pos: 20,
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 42,
            "decoPos": 55,
            "classNameEnd": 70,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 98,
                "namePos": 89,
                "name": "bar",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "reference",
                    "identifier": "Bar"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 130,
                "namePos": 115,
                "name": "$content",
                "shallowRef": 0,
                "shallowRefPos": 0,
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
            kind: "import",
            pos: 20,
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 42,
            "decoPos": 55,
            "classNameEnd": 70,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 100,
                "namePos": 89,
                "name": "bar",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "array",
                    "itemType": {
                        "identifier": "Baz",
                        "kind": "reference"
                    }
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 131,
                "namePos": 117,
                "name": "blah",
                "shallowRef": 0,
                "shallowRefPos": 0,
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
            kind: "import",
            pos: 20,
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 42,
            "decoPos": 55,
            "classNameEnd": 70,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 119,
                "namePos": 89,
                "name": "dict",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "dictionary",
                    "indexName": "k",
                    "itemType": {
                        "kind": "reference",
                        "identifier": "Address"
                    },
                    "indexType": {
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
                @ref baz: Baz[][];
                @ref.depth(2) blah: Blah[][];
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 20,
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 42,
            "decoPos": 55,
            "classNameEnd": 70,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 103,
                "namePos": 94,
                "name": "bar",
                "shallowRef": 1,
                "shallowRefPos": 89,
                "type": {
                    "kind": "reference",
                    "identifier": "Bar"
                }
            }, {
                "defaultValue": undefined,
                "end": 138,
                "kind": "property",
                "name": "baz",
                "namePos": 125,
                "shallowRef": 1,
                "shallowRefPos": 120,
                "type": {
                    "itemType": {
                        "itemType": {
                            "identifier": "Baz",
                            "kind": "reference"
                        },
                        "kind": "array"
                    },
                    "kind": "array"
                }
            }, {
                "defaultValue": undefined,
                "end": 184,
                "kind": "property",
                "name": "blah",
                "namePos": 169,
                "shallowRef": 2,
                "shallowRefPos": 155,
                "type": {
                    "itemType": {
                        "itemType": {
                            "identifier": "Blah",
                            "kind": "reference"
                        },
                        "kind": "array"
                    },
                    "kind": "array"
                }
            }]
        }], "1");
    })

    it("should parse base type default values", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            let count = 0;
            @Data class Foo {
                bar = 123;
                baz:string = "abc";
                bar2 = false;
                bar3 = -123;
                bar4 = count++;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 20,
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 69,
            "decoPos": 82,
            "classNameEnd": 97,
            "log": false,
            "members": [
                {
                    "kind": "property",
                    "defaultValue": { end: 125, pos: 121, text: "123", fullText: " 123", isComplexExpression: false },
                    "end": 126,
                    "namePos": 116,
                    "name": "bar",
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": { "kind": "number" }
                },
                {
                    "kind": "property",
                    "defaultValue": { end: 161, pos: 155, text: '"abc"', fullText: ' "abc"', isComplexExpression: false },
                    "end": 162,
                    "namePos": 143,
                    "name": "baz",
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": { "kind": "string" }
                },
                {
                    "kind": "property",
                    "defaultValue": { end: 191, pos: 185, text: "false", fullText: " false", isComplexExpression: false },
                    "end": 192,
                    "namePos": 179,
                    "name": "bar2",
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": { "kind": "boolean" }
                },
                {
                    "defaultValue": { "end": 220, "pos": 215, "text": "-123", fullText: " -123", isComplexExpression: true },
                    "end": 221,
                    "kind": "property",
                    "name": "bar3",
                    "namePos": 209,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "number"
                    }
                },
                {
                    "defaultValue": { "end": 252, "pos": 244, "text": "count++", fullText: " count++", isComplexExpression: true },
                    "end": 253,
                    "kind": "property",
                    "name": "bar4",
                    "namePos": 238,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "any"
                    }
                }
            ]
        }], "1");
    })

    it("should parse multiple Data objects in the same file", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";

            @Data class Foo {
                prop: string;
            }

            @Data class Bar {
                prop: string;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1 }
        }, {
            "className": "Foo",
            "classNameEnd": 95,
            "log": false,
            "kind": "data",
            "pos": 66,
            "decoPos": 80,
            "members": [
                {
                    "kind": "property",
                    "defaultValue": undefined,
                    "end": 127,
                    "namePos": 114,
                    "name": "prop",
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "string"
                    }
                }
            ]
        }, {
            "className": "Bar",
            "classNameEnd": 170,
            "log": false,
            "kind": "data",
            "pos": 141,
            "decoPos": 155,
            "members": [
                {
                    "kind": "property",
                    "defaultValue": undefined,
                    "end": 202,
                    "namePos": 189,
                    "name": "prop",
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "string"
                    }
                }
            ]
        }], "1");
    });

    it("should support log flag", async function () {
        let r = parse(`\
            // sample 1
            import { Data, log } from "./trax";
            let foo = "bar";

            @Data @log class Address {
                street: string;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1, log: 1 },
        }, {
            "kind": "data",
            "className": "Address",
            "classNameEnd": 138,
            "pos": 100,
            "decoPos": 114,
            "log": true,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 172,
                "namePos": 157,
                "name": "street",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "string"
                }
            }]
        }], "1");
    });

    it("should support union types with null", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";
            let foo = "bar";

            @Data class Address {
                foo: Bar | null;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1 },
        }, {
            "kind": "data",
            "className": "Address",
            "classNameEnd": 128,
            "pos": 95,
            "decoPos": 109,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 163,
                "namePos": 147,
                "name": "foo",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "reference",
                    "identifier": "Bar",
                    "canBeNull": true,
                    "canBeUndefined": false
                }
            }]
        }], "1");
    });

    it("should support union types with null on arrays", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";
            let foo = "bar";

            @Data class Address {
                foo: (Bar | null)[];
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1 },
        }, {
            "kind": "data",
            "className": "Address",
            "classNameEnd": 128,
            "pos": 95,
            "decoPos": 109,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 167,
                "namePos": 147,
                "name": "foo",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "array",
                    "itemType": {
                        "kind": "reference",
                        "canBeNull": true,
                        "canBeUndefined": false,
                        "identifier": "Bar"
                    }
                }
            }]
        }], "1");
    });

    it("should support any type", async function () {
        let r = parse(`\
            // sample 1
            import { Data } from "./trax";
            let foo = "bar";

            @Data class Address {
                foo: any;
                bar;
                baz: any[]
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            kind: "import",
            pos: 44,
            insertPos: 49,
            values: { Data: 1 },
        }, {
            "kind": "data",
            "className": "Address",
            "classNameEnd": 128,
            "pos": 95,
            "decoPos": 109,
            "log": false,
            "members": [{
                "kind": "property",
                "defaultValue": undefined,
                "end": 156,
                "namePos": 147,
                "name": "foo",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "any"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 177,
                "namePos": 173,
                "name": "bar",
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "any"
                }
            }, {
                "defaultValue": undefined,
                "end": 204,
                "kind": "property",
                "name": "baz",
                "namePos": 194,
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "itemType": {
                        "kind": "any"
                    },
                    "kind": "array"
                }
            }]
        }], "1");
    });

    it("should parse new and function call default values", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                bar = init(123);
                baz:Bar = new Bar("abc");
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            "insertPos": 25,
            "pos": 20,
            "kind": "import",
            "values": {
                "Data": 1
            }
        }, {
            "className": "Foo",
            "classNameEnd": 70,
            "decoPos": 55,
            "kind": "data",
            "log": false,
            "members": [{
                "defaultValue": {
                    end: 104,
                    pos: 94,
                    text: "init(123)",
                    fullText: " init(123)",
                    isComplexExpression: true
                },
                "end": 105,
                "kind": "property",
                "name": "bar",
                "namePos": 89,
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "kind": "any"
                }
            }, {
                "defaultValue": {
                    end: 146,
                    pos: 131,
                    text: "new Bar(\"abc\")",
                    fullText: " new Bar(\"abc\")",
                    isComplexExpression: true
                },
                "end": 147,
                "kind": "property",
                "name": "baz",
                "namePos": 122,
                "shallowRef": 0,
                "shallowRefPos": 0,
                "type": {
                    "identifier": "Bar",
                    "kind": "reference"
                }
            }],
            "pos": 42
        }]);
    });

    it("should parse Array literals default values", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                bar:number[] = [1,2,3];
            }
        `, "file1.ts");

        assert.deepEqual(r, [
            {
                "insertPos": 25,
                "pos": 20,
                "kind": "import",
                "values": {
                    "Data": 1
                }
            },
            {
                "className": "Foo",
                "classNameEnd": 70,
                "decoPos": 55,
                "kind": "data",
                "log": false,
                "pos": 42,
                "members": [
                    {
                        "defaultValue": { "end": 111, "pos": 103, "text": "[1,2,3]", fullText: " [1,2,3]", isComplexExpression: true },
                        "end": 112,
                        "kind": "property",
                        "name": "bar",
                        "namePos": 89,
                        "shallowRef": 0,
                        "shallowRefPos": 0,
                        "type": {
                            "itemType": {
                                "kind": "number"
                            },
                            "kind": "array"
                        }
                    }
                ]
            }
        ]);
    });

    it("should parse @computed properties", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                list?: TestNode[];
                @computed get listLength() {
                    if (!this.list) return 0;
                    return this.list.length;
                }
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            "insertPos": 25,
            "pos": 20,
            "kind": "import",
            "values": {
                "Data": 1
            }
        }, {
            "className": "Foo",
            "classNameEnd": 70,
            "decoPos": 55,
            "kind": "data",
            "log": false,
            "members": [
                {
                    "defaultValue": undefined,
                    "end": 107,
                    "kind": "property",
                    "name": "list",
                    "namePos": 89,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "array",
                        "canBeUndefined": true,
                        "itemType": {
                            "identifier": "TestNode",
                            "kind": "reference",
                        }
                    }
                }
            ],
            "pos": 42
        }
        ]);
    });

    it("should accept methods if specified in options", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                list?: TestNode[];
                foo() {
                    bar(this);
                }
            }
        `, "file1.ts", { acceptMethods: true });

        assert.deepEqual(r, [{
            "insertPos": 25,
            "pos": 20,
            "kind": "import",
            "values": {
                "Data": 1
            }
        }, {
            "className": "Foo",
            "classNameEnd": 70,
            "decoPos": 55,
            "kind": "data",
            "log": false,
            "members": [
                {
                    "defaultValue": undefined,
                    "end": 107,
                    "kind": "property",
                    "name": "list",
                    "namePos": 89,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "array",
                        "canBeUndefined": true,
                        "itemType": {
                            "identifier": "TestNode",
                            "kind": "reference",
                        }
                    }
                }
            ],
            "pos": 42
        }
        ]);
    });

    it("should accept null as default value", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                foo: Bar | null = null;
                bar = null;
            }
        `, "file1.ts");

        assert.deepEqual(r, [{
            "insertPos": 25,
            "pos": 20,
            "kind": "import",
            "values": {
                "Data": 1
            }
        },
        {
            "className": "Foo",
            "classNameEnd": 70,
            "decoPos": 55,
            "kind": "data",
            "log": false,
            "members": [
                {
                    "defaultValue": {
                        "end": 111,
                        "fullText": " null",
                        "isComplexExpression": false,
                        "pos": 106,
                        "text": "null"
                    },
                    "end": 112,
                    "kind": "property",
                    "name": "foo",
                    "namePos": 89,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "canBeNull": true,
                        "canBeUndefined": false,
                        "identifier": "Bar",
                        "kind": "reference"
                    }
                },
                {
                    "defaultValue": {
                        "end": 139,
                        "fullText": " null",
                        "isComplexExpression": false,
                        "pos": 134,
                        "text": "null"
                    },
                    "end": 140,
                    "kind": "property",
                    "name": "bar",
                    "namePos": 129,
                    "shallowRef": 0,
                    "shallowRefPos": 0,
                    "type": {
                        "kind": "any"
                    }
                }
            ],
            "pos": 42
        }], "1");
    })

});