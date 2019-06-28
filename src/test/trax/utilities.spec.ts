import * as assert from 'assert';
import { TestNode } from "./fixture";
import { isMutating, changeComplete, version, Data, create, reset, hasProperty } from '../../trax';

describe('Trax utilities', () => {

    it('should allow to get the version of an object', async function () {
        let n = new TestNode();

        assert.equal(version(n), 0, "pristine version is 0");
        assert.equal(version({}), 0, "version of non-trax object is 0");

        n.value = "abc";
        let v1 = version(n);
        assert.equal(v1, 1, "version changed to 1");

        n.value = "def";
        assert.equal(version(n), v1, "version is still 1");
        assert.equal(isMutating(n), true, "n is being changed");

        await changeComplete(n);
        let v2 = version(n);
        assert.equal(v2, 2, "version is now 2 (stable");
        n.value = "def";
        assert.equal(version(n), 2, "version is still 2 (unchanged)");
        n.value = "123";
        assert.equal(version(n), 3, "version moved to 3");
    });

    it('should allow to create an object even if it can be undefined or null', async function () {
        @Data class TestData {
            prop?: number;
            node?: TestNode;
            value: string | null;
        }
        let d = new TestData(), v: any;
        assert.equal(d.prop, undefined, "initial prop is undefined");
        v = create(d, "prop");
        assert.equal(v, 0, "0");
        assert.equal(v, d.prop, "v===d.prop");

        assert.equal(d.node, undefined, "initial node is undefined");
        v = create(d, "node");
        assert.notEqual(v, undefined, "node is defined");
        assert.equal(v.value, "v1", "v1");
        assert.equal(v, d.node, "v===d.node");

        assert.equal(d.value, null, "value is null");
        v = create(d, "value");
        assert.equal(v, "", "empty string created");
        assert.equal(d.value, v, "d.value === v");
    });

    it("should allow to reset a property to its default value", function () {
        @Data class TestData {
            value1?: number;           // will be reset to undefined
            value2: string | null;     // will be reset to null
            value3: string;            // will be reset to ""
            value4 = "abc";            // will be reset to "abc"
            node: TestNode;            // will be reset to new TestNode();
        }

        let d = new TestData(), v: any;
        assert.equal(d.value1, undefined, "value1 is undefined");
        d.value1 = 123;
        assert.equal(d.value1, 123, "new value1");
        v = reset(d, "value1");
        assert.equal(v, undefined, "value1 is undefined (2)");
        assert.equal(v, d.value1, "d.value1 reset");

        assert.equal(d.value2, null, "value2 is null");
        d.value2 = "abc";
        assert.equal(d.value2, "abc", "new value2");
        v = reset(d, "value2");
        assert.equal(v, null, "value2 is null (2)");
        assert.equal(v, d.value2, "d.value2 reset");

        assert.equal(d.value3, "", "value3 is empty string");
        d.value3 = "abc";
        assert.equal(d.value3, "abc", "new value3");
        v = reset(d, "value3");
        assert.equal(v, "", "value3 is empty string (2)");
        assert.equal(v, d.value3, "d.value3 reset");

        assert.equal(d.value4, "abc", "value4 is abc");
        d.value4 = "def";
        assert.equal(d.value4, "def", "new value4");
        v = reset(d, "value4");
        assert.equal(v, "abc", "value4 is abc (2)");
        assert.equal(v, d.value4, "d.value4 reset");

        assert.equal(d.node.value, "v1", "node.value is v1");
        d.node.value = "v2";
        let node1 = d.node;
        assert.equal(d.node.value, "v2", "new node value");
        v = reset(d, "node");
        assert.equal(v.value, "v1", "node.value is back to v1 (2)");
        assert.equal(v, d.node, "d.node reset");
        assert.notEqual(d.node, node1, "node changed");
    });

    it("should allow to know if a Data object supports a given property", function () {
        let n = new TestNode();
        assert.equal(hasProperty(n, "value"), true, "1");
        assert.equal(hasProperty(n, "node"), true, "2");
        assert.equal(hasProperty(n, "node2"), true, "3");

        n.node.value = "v2";
        assert.equal(hasProperty(n, "node"), true, "4");

        assert.equal(hasProperty(undefined, "foo"), false, "5");
        assert.equal(hasProperty(1234, "foo"), false, "6");
        assert.equal(hasProperty(false, "foo"), false, "7");
        assert.equal(hasProperty("", "foo"), false, "8");
        assert.equal(hasProperty(null, "foo"), false, "9");
        assert.equal(hasProperty(n, "foo"), false, "10");
    });

});
