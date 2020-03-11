import { convertToJson, isMutating, changeComplete, JSConversionContext, Data, create } from '../../trax';
import * as assert from 'assert';
import { TestNode, initNewArrTestNode } from './fixture';

describe('convertToJson', () => {
    const defaultObject = { foo: "bar" };

    class Counter {
        duration: number;

        constructor(d: number) {
            this.duration = d;
        }
    }

    @Data class ValueNode {
        message = "hello";
        isOK = true;
        quantity = 42;
        someObject = defaultObject;
        counter = new Counter(42);

        message2: any;
        isOK2: any;
        quantity2: any;
        someObject2: any;
    }
    it("should ignore undefined properties", async function () {
        let sn = new ValueNode();

        assert.deepEqual(convertToJson(sn), {
            isOK: true,
            message: "hello",
            quantity: 42,
            someObject: defaultObject,
            counter: { duration: 42 }
        }, "toJS works on new objects");

        sn.message2 = "m2";
        assert.equal(isMutating(sn), true, "sn is mutating");
        assert.deepEqual(convertToJson(sn), {
            isOK: true,
            message: "hello",
            quantity: 42,
            someObject: defaultObject,
            message2: "m2",
            counter: { duration: 42 }
        }, "toJS works on mutating objects");

        await changeComplete(sn);
        assert.deepEqual(convertToJson(sn), {
            isOK: true,
            message: "hello",
            quantity: 42,
            someObject: defaultObject,
            message2: "m2",
            counter: { duration: 42 }
        }, "toJS works on changed objects");
    });

    it("should support conversion for datanode properties", async function () {
        let tn = new TestNode();

        assert.deepEqual(convertToJson(tn), {
            value: "v1"
        }, "toJS works on new objects");

        tn.node = new TestNode();
        tn.node.value = "v2";
        assert.equal(isMutating(tn), true, "tn is mutating");
        assert.equal(tn["ΔtoJsResult"], undefined, "ΔtoJsResult cleaned");

        assert.deepEqual(convertToJson(tn), {
            value: "v1",
            node: {
                value: "v2"
            }
        }, "toJS on mutating object");
        assert.equal(tn["ΔtoJsResult"], undefined, "ΔtoJsResult cleaned 2");

        await changeComplete(tn);
        assert.deepEqual(convertToJson(tn), {
            value: "v1",
            node: {
                value: "v2"
            }
        }, "toJS on mutated object");
        assert.equal(tn["ΔtoJsResult"], undefined, "ΔtoJsResult cleaned 3");
    });

    it("should not convert the same node twice", async function () {
        let tn1 = new TestNode(), tn2 = new TestNode(), tn3 = new TestNode();
        tn2.value = "v2";
        tn3.value = "v3";
        tn1.node = tn2;
        tn2.node = tn3;
        tn2.node2 = tn3;

        let jsNd = convertToJson(tn1);
        assert.deepEqual(jsNd, {
            value: "v1",
            node: {
                value: "v2",
                node: {
                    value: "v3"
                },
                node2: {
                    value: "v3"
                }
            }
        }, "toJS on mutating object");
        assert.strictEqual(jsNd.node.node, jsNd.node.node2, "same v3 object");

        assert.equal(isMutating(tn1), true, "tn1 is mutating");

        await changeComplete(tn1);
        jsNd = convertToJson(tn1);
        assert.deepEqual(jsNd, {
            value: "v1",
            node: {
                value: "v2",
                node: {
                    value: "v3"
                },
                node2: {
                    value: "v3"
                }
            }
        }, "toJS on mutating object (2)");
        assert.strictEqual(jsNd.node.node, jsNd.node.node2, "same v3 object (2)");
    });

    it("should support custom converters", async function () {
        let tn1 = new TestNode(), tn2 = new TestNode(), tn3 = new TestNode();
        tn2.value = "v2";
        tn3.value = "v3";
        tn1.node = tn2;
        tn2.node = tn3;
        tn2.node2 = tn3;

        function c(o: any, cc: JSConversionContext) {
            if (o.constructor === TestNode) {
                if (o.value === "v3") {
                    return "tn3";
                } else if (o.value === "v2") {
                    let r = cc.getDefaultConversion();
                    r.isV2 = true;
                    return r;
                } else {
                    return cc.getDefaultConversion();
                }
            }
        }

        assert.deepEqual(convertToJson(tn1, c), {
            value: "v1",
            node: {
                value: "v2",
                isV2: true,
                node: "tn3",
                node2: "tn3"
            }
        }, "conversion on mutating object");

        await changeComplete(tn1);
        assert.deepEqual(convertToJson(tn1, c), {
            value: "v1",
            node: {
                value: "v2",
                isV2: true,
                node: "tn3",
                node2: "tn3"
            }
        }, "conversion on mutating object");
    });

    it("should ignore nodes through custom converters", async function () {
        let tn1 = new TestNode(), tn2 = new TestNode(), tn3 = new TestNode();
        tn2.value = "v2";
        tn3.value = "v3";
        tn1.node = tn2;
        tn2.node = tn3;
        tn2.node2 = tn3;

        function c(o: any, cc: JSConversionContext) {
            if (o.constructor === TestNode) {
                if (o.value === "v3") {
                    return undefined;
                } else {
                    return cc.getDefaultConversion();
                }
            }
            return undefined;
        }

        assert.deepEqual(convertToJson(tn1, c), {
            value: "v1",
            node: {
                value: "v2"
            }
        }, "conversion on mutating object");

        await changeComplete(tn1);
        assert.deepEqual(convertToJson(tn1, c), {
            value: "v1",
            node: {
                value: "v2"
            }
        }, "conversion on mutating object");
    });

    it("should convert lists", async function () {
        let nd = initNewArrTestNode();

        assert.deepEqual(convertToJson(nd), {
            name: "no name",
            list: [{ value: "i1" }, { value: "i2" }, { value: "i3" }]
        }, "conversion on mutating object");

        await changeComplete(nd);
        assert.deepEqual(convertToJson(nd), {
            name: "no name",
            list: [{ value: "i1" }, { value: "i2" }, { value: "i3" }]
        }, "conversion on changed object");

    });

    it("should convert dictionaries", async function () {
        @Data class DictTestNode {
            name = "map";
            dict: { [k: string]: TestNode | null };
        }

        let d = new DictTestNode(), item: TestNode;
        item = new TestNode();
        item.value = "item A";
        d.dict["a"] = item;
        item = new TestNode();
        item.value = "item B";
        d.dict["b"] = item;
        d.dict["c"] = null;

        assert.deepEqual(convertToJson(d), {
            name: "map",
            dict: { a: { value: "item A" }, b: { value: "item B" }, c: null }
        }, "conversion on mutating object");

        await changeComplete(d);
        assert.deepEqual(convertToJson(d), {
            name: "map",
            dict: { a: { value: "item A" }, b: { value: "item B" }, c: null }
        }, "conversion on changed object");
    });

    it("should return parts of original json when created through create", async function () {
        let json = { value: "v2", node: { value: "v3", node: { value: "v4" } } },
            tn = create(TestNode, json), tjs: any;

        assert.equal(isMutating(tn), false, "tn is not mutating");
        tjs = convertToJson(tn);
        assert.deepEqual(tjs, json, "tjs is equal to json");
        assert.strictEqual(tjs.node, json.node, "tjs.node is strictly identical to json.node");

        tn.value = "v3";
        assert.equal(isMutating(tn), true, "tn is now mutating");
        tjs = convertToJson(tn);
        assert.deepEqual(tjs, {
            value: "v3",
            node: json.node
        }, "tjs is equal to json");
        assert.strictEqual(tjs.node, json.node, "tjs.node is identical to json.node (2)");

        tn.node = new TestNode();
        tn.node.value = "v4";
        assert.equal(tn.node["Δjson"], undefined, "new node has no Δjson");

        tjs = convertToJson(tn);
        assert.deepEqual(tjs, {
            value: "v3",
            node: {
                value: "v4" // node doesn't show up as it has not been created
            }
        }, "tjs update");

        await changeComplete(tn);
        assert.equal(isMutating(tn), false, "tn is not mutating");
        assert.deepEqual(convertToJson(tn), {
            value: "v3",
            node: {
                value: "v4"
            }
        }, "tjs update after mutation");
    });
});
