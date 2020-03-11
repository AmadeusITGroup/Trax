import { isMutating, changeComplete, Data, create, ref, isDataObject } from '../../trax';
import * as assert from 'assert';
import { TestNode, ArrTestNode } from './fixture';

describe('create', () => {
    it('should accept undefined data', async function () {
        const tn = create(TestNode, undefined as any);
        assert.equal(tn.value, "v1", "value has the right init value");
        assert.equal(isMutating(tn), false, "tn is not mutating");
    });

    it('should accept null data', async function () {
        const tn = create(TestNode, null as any);
        assert.equal(tn.value, "v1", "value has the right init value");
        assert.equal(isMutating(tn), false, "tn is not mutating");
    });

    it('should be supported to load simple type properties on data objects', async function () {
        @Data class ValueNode {
            text = "v1";
            isBig: boolean;
            quantity = 123;
            otherQuantity = 42;
            foo;
        }
        const v = create(ValueNode, { text: "init value", isBig: true, quantity: 234, foo: "bar" });
        assert.equal(v.text, "init value", "value has the right init value");
        assert.equal(v.isBig, true, "isBig is true");
        assert.equal(v.quantity, 234, "quantity is 234");
        assert.equal(v.otherQuantity, 42, "otherQuantity is 42");
        assert.equal(v.foo, "bar", "foo is bar");
        assert.equal(isMutating(v), false, "tn is not mutating");

        v.text = "v2";
        assert.equal(v.text, "v2", "value has changed to v2");
        assert.equal(isMutating(v), true, "tn is now mutating");
    });

    it('should be supported to load data node properties on data objects', async function () {
        const tn = create(TestNode, { value: "v2", node: { value: "v3", node: { value: "v4" } } });
        assert.equal(tn.value, "v2", "value has the right init value");
        assert.equal(tn.node!.value, "v3", "tn.node.value has the right init value");
        assert.equal(tn.node!.node!.value, "v4", "tn.node.node.value has the right init value");

        assert.equal(isMutating(tn), false, "tn is not mutating");
        assert.equal(isMutating(tn.node), false, "tn.node is not mutating");
        assert.equal(isMutating(tn.node!.node), false, "tn.node.node is not mutating");
    });

    it('should remove link with Δjson object after first read', async function () {
        const json = { value: "v2", node: { value: "v3", node: { value: "v4" } } },
            tn = create(TestNode, json);

        assert.equal(tn["Δjson"], undefined, "tn['Δjson'] is undefined");
        assert.deepEqual(tn["ΔΔnode"].Δjson, { value: "v3", node: { value: "v4" } }, "node json present");
        assert.equal(tn.node!.value, "v3", "tn.node.value has the right init value");
        assert.deepEqual(tn["ΔΔnode"].Δjson, undefined, "node json removed");
    });

    it('should not recreate a removed data object with the old json data', async function () {
        let json = { value: "v2", node: { value: "v3", node: { value: "v4" } } },
            tn = create(TestNode, json);

        assert.equal(tn.node!.value, "v3", "tn.node.value has the right init value");
        assert.equal(tn.node2, undefined, "node2 is undefined as it has not been set");
        const nd1 = tn.node!;
        (<any>tn).node = undefined;

        assert.equal(tn.node !== nd1, true, "new node created");
        assert.equal(tn.node.value, "v1", "new node has default initialization");
        assert.equal(isMutating(tn), true, "tn is mutating");
    });

    it('should support null or undefined in the json data', async function () {
        let json = { value: "v2", node: null, node2: undefined },
            tn = create(TestNode, json);

        assert.equal(tn.node.value, "v1", "node has been automatically created as data is null");
        assert.equal(tn.node2, undefined, "node2 is undefined as it has not been set");
    });

    it('should properly pass the $json reference to the new data node version', async function () {
        let json = { value: "v2", node: { value: "v3", node: { value: "v4" } }, node2: { value: "v5" } },
            tn = create(TestNode, json);

        // WARNING: debugger will call getter function and will reset the $json object!!!
        assert.equal(tn["Δjson"], undefined, "tn json is undefined");
        assert.equal(tn.node!.value, "v3", "node prop is properly initialized");
        assert.deepEqual(tn["ΔΔnode2"]["Δjson"], { value: "v5" }, "tn.node2 is not initialized");
        tn.value = "v2bis";

        await changeComplete(tn);
        assert.equal(tn.node2!.value, "v5", "node2 is loaded from the new tn version");
        assert.equal(tn.node2!["Δjson"], undefined, "tn.node2 Δjson is undefined");
        tn.node!.value = "v3bis";

        await changeComplete(tn);

        // read node on the immutable object
        assert.equal(tn.node.node.value, "v4", "v4 node");
        assert.equal(tn.node.node2, undefined, "node.node2 is undefined");
    });

    it('should support lists of trax objects', async function () {
        @Data class TestList {
            list: (TestNode | null)[];
        }
        const l = create(TestList, { list: [{ value: "a" }, null, { value: "c" }] });

        assert.equal(l.list.length, 3, "correct length");
        assert.equal(l.list[0]!.value, "a", "item 0 is a");
        assert.equal(l.list[1], null, "item 1 is null");
        assert.equal(isMutating(l), false, "l is not mutating");
        assert.deepEqual(l.list[2]!["Δjson"], { value: "c" }, "item 2 is ready for initialization");
        assert.equal(l.list[2]!.value, "c", "item 2 is c");
        assert.deepEqual(l.list[2]!["Δjson"], undefined, "item 2 has been initialized");
    });

    it('should support lists of primitive types', async function () {
        @Data class TestList {
            list: (string | null)[];
        }
        const l = create(TestList, { list: ["a", null, "c"] });

        assert.equal(l.list.length, 3, "correct length");
        assert.equal(l.list[0], "a", "item 0 is a");
        assert.equal(l.list[1], null, "item 1 is null");
        assert.equal(isMutating(l), false, "l is not mutating");
        assert.equal(l.list[2]!, "c", "item 2 is c");
    });

    it('should support data list in data objects with computed properties', async function () {
        let an = create(ArrTestNode, { name: "an123", list: [{ value: "a" }, { value: "b" }] });

        assert.equal(isMutating(an), false, "an is not mutating");
        assert.equal(an.name, "an123", "an.name is correct");

        assert.equal(an.listLength, 2, "listLength is 2");
        assert.equal(an.list.length, 2, "list length is 2");
        assert.equal(an.list[0]!.value, "a", "item 0 is a");
        assert.equal(isMutating(an), false, "an is not mutating (2)");
    });

    it('should load @ref properties', async function () {
        @Data class SimpleNode {
            @ref node: TestNode;    // will be automatically created
            @ref list: TestNode[];  // will be automatically created as it is a list
            data: any = null;
            @ref subNode: SimpleNode | undefined; // will not be automatically as defined as @ref
        }

        let hello = { blah: "hello" },
            json = {
                node: { value: "v2" },
                data: { someValue: 1, someOtherValue: hello },
                subNode: {
                    data: { a: 123, b: hello }
                }
            }, sn = create(SimpleNode, json);

        assert.equal(sn.data.someValue, 1, "data is loaded");
        assert.equal(sn.data.someOtherValue, hello, "hello is properly referenced");
        assert.equal(isDataObject(sn["ΔΔsubNode"]), false, "subNode is a JSON object");
        assert.equal(sn.subNode!.data.a, 123, "subNode and its data have been properly loaded");
        assert.deepEqual(sn.subNode!.data, { a: 123, b: hello }, "data is what it should be");
    });

    it('should support dictionaries of trax objects', async function () {
        @Data class TestDict {
            dict: { [k: string]: (TestNode | null) };
        }

        let d = create(TestDict, { dict: { a: { value: "a" }, c: { value: "c" } } });

        assert.equal(d.dict["a"]!.value, "a", "a is a");
        assert.equal(d.dict["c"]!["Δjson"] !== undefined, true, "c is ready for initialization");
        assert.equal(d.dict["c"]!.value, "c", "c is c");
        assert.equal(d.dict["c"]!["Δjson"] === undefined, true, "c is initialized");

        assert.equal(isMutating(d), false, "d is not mutating");

        d.dict["b"] = new TestNode();
        assert.equal(isMutating(d), true, "d is now mutating");
    });

    it('should support dictionaries of primitive types', async function () {
        @Data class TestDict {
            dict: { [k: string]: number | null };
        }

        let d = create(TestDict, { dict: { a: 1, c: 3, d: 4 } });

        assert.equal(d.dict["a"], 1, "a is 1");
        assert.equal(d.dict["b"], undefined, "b is undefined");
        assert.equal(d.dict["c"], 3, "c is 3");

        assert.equal(isMutating(d), false, "d is not mutating");

        d.dict["b"] = 2;
        assert.equal(isMutating(d), true, "d is now mutating");
    });

});
