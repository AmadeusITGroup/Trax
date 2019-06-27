import * as assert from 'assert';
import { TestNode } from "./fixture";
import { isMutating, changeComplete, version, Data, create } from '../../trax';

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

});
