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
                "shallowRef": false,
                "type": {
                    "kind": "string"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 196,
                "namePos": 180,
                "name": "street2",
                "shallowRef": false,
                "type": {
                    "kind": "string"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 229,
                "namePos": 213,
                "name": "zipCode",
                "shallowRef": false,
                "type": {
                    "kind": "number"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 261,
                "namePos": 246,
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
            kind: "import",
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
                "shallowRef": false,
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
            kind: "import",
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
                "shallowRef": false,
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
            kind: "import",
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
            kind: "import",
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
            kind: "import",
            insertPos: 25,
            values: { Data: 1 }
        }, {
            "kind": "data",
            "className": "Foo",
            "pos": 42,
            "decoPos": 55,
            "classNameEnd": 70,
            "log": false,
            "members": [
                {
                    "kind": "property",
                    "defaultValue": { end: 98, pos: 94, text: " 123" },
                    "end": 99,
                    "namePos": 89,
                    "name": "bar",
                    "shallowRef": false,
                    "type": { "kind": "number" }
                },
                {
                    "kind": "property",
                    "defaultValue": { end: 134, pos: 128, text: ' "abc"' },
                    "end": 135,
                    "namePos": 116,
                    "name": "baz",
                    "shallowRef": false,
                    "type": { "kind": "string" }
                },
                {
                    "kind": "property",
                    "defaultValue": { end: 164, pos: 158, text: " false" },
                    "end": 165,
                    "namePos": 152,
                    "name": "bar2",
                    "shallowRef": false,
                    "type": { "kind": "boolean" }
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
                    "shallowRef": false,
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
                    "shallowRef": false,
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
                "shallowRef": false,
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
                "shallowRef": false,
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
                "shallowRef": false,
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
                "shallowRef": false,
                "type": {
                    "kind": "any"
                }
            }, {
                "kind": "property",
                "defaultValue": undefined,
                "end": 177,
                "namePos": 173,
                "name": "bar",
                "shallowRef": false,
                "type": {
                    "kind": "any"
                }
            }, {
                "defaultValue": undefined,
                "end": 204,
                "kind": "property",
                "name": "baz",
                "namePos": 194,
                "shallowRef": false,
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
                    "end": 104,
                    "pos": 94,
                    "text": "init(123)"
                },
                "end": 105,
                "kind": "property",
                "name": "bar",
                "namePos": 89,
                "shallowRef": false,
                "type": {
                    "kind": "any"
                }
            }, {
                "defaultValue": {
                    "end": 146,
                    "pos": 131,
                    "text": "new Bar(\"abc\")"
                },
                "end": 147,
                "kind": "property",
                "name": "baz",
                "namePos": 122,
                "shallowRef": false,
                "type": {
                    "identifier": "Bar",
                    "kind": "reference"
                }
            }],
            "pos": 42
        }]);
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
                    "shallowRef": false,
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
                    "shallowRef": false,
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

    it("should ignore function members if specified in options", async function () {
        let r = parse(`\
            import { Data } from "./trax";
            @Data class Foo {
                list?: TestNode[];
                foo: ()=>void;
                bar:(x:string)=>boolean;
            }
        `, "file1.ts", { ignoreFunctionProperties: true });

        assert.deepEqual(r, [{
            "insertPos": 25,
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
                    "shallowRef": false,
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
});