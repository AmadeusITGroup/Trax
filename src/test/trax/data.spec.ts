import * as assert from 'assert';
import { TestNode, SubTestNode, SimpleNode, AnyNode } from "./fixture";
import { isMutating, changeComplete, isDataObject, version, numberOfWatchers } from '../../trax';

describe('Data objects', () => {
    const MP_META_DATA = "ΔMd", MP_VERSION = "ΔChangeVersion";

    it('should have correct init values', () => {
        let nd = new TestNode();
        assert.equal(nd['ΔΔvalue'], "v1", "v1 init value string");
        assert.equal(nd['ΔΔnode'], undefined, "node is undefined");
        assert.equal(nd['ΔΔnode2'], undefined, "null init node2");
        assert.equal(nd[MP_VERSION], 0, "never changed");
        assert.equal(isMutating(nd), false, "not mutating after creation");
    });

    it('should tell if an object is being changed', async function () {
        let nd = new TestNode();
        assert.equal(isMutating(nd), false, "no mutation on original state");
        nd.value = "v2";
        assert.equal(isMutating(nd), true, "mutation starts after first change");
        await changeComplete(nd);
        assert.equal(isMutating(nd), false, "no mutation on frozen object");
        assert.equal(nd.value, "v2", "new version holds new value");
        nd.value = "v3";
        await changeComplete(nd);
        assert.equal(isMutating(nd), false, "no mutation on frozen object 2");
        assert.equal(nd.value, "v3", "new version holds new value");
    });

    it("should tell if an object is a dataset", function () {
        let n = new TestNode();
        assert.equal(isDataObject(n), true, "n is a data object");
        assert.equal(isDataObject({}), false, "js object is not a data object");
        assert.equal(isDataObject(true), false, "true is not a data object");
        assert.equal(isDataObject(undefined), false, "undefined is not a data object");
        // TODO
        // let ls = list(String);
        // assert.equal(isDataset(ls), true, "HList is a data object");
        // let d = map(String);
        // assert.equal(isDataset(d), true, "HDictionary is a data object");
    });

    it('should support changeComplete on unchanged objects', async function () {
        let nd = new TestNode();
        let cc = changeComplete(nd);
        assert.equal(numberOfWatchers(nd), 0, "0 watchers (changeComplete immediate cb)");
        await cc;
        assert.equal(isMutating(nd), false, "no mutation after mutation complete");
        assert.equal(numberOfWatchers(nd), 0, "no watchers");
    });

    it('should support numberOfWatchers', async function () {
        let nd = new TestNode();
        nd.value = "v2";
        let cc = changeComplete(nd);
        assert.equal(numberOfWatchers(nd), 1, "1 watcher (changeComplete cb)");
        await cc;
        assert.equal(isMutating(nd), false, "no mutation after mutation complete");
        assert.equal(numberOfWatchers(nd), 0, "no watchers");
    });

    it('should support child data nodes', async function () {
        let node1 = new TestNode();
        assert.equal(isMutating(node1), false, "initially pristine");

        // check that new parent version is created when child node is set
        let node2 = new TestNode();
        node1.node = node2;
        assert.equal(isMutating(node2), false, "sub node pristine after assignment");
        assert.equal(isMutating(node1), true, "not pristine 1");
        assert.equal(node1["ΔΔnode"], node2, "node2 in private property");

        await changeComplete(node1);
        assert.equal(isMutating(node1), false, "pristine 2");
        assert.equal(node1.node, node2, "new node value");

        // check that new parent version is created when child changes
        node1.node.value = "abc";
        assert.equal(isMutating(node2), true, "node2 touched");
        assert.equal(isMutating(node1), true, "node1 touched");

        await changeComplete(node1);
        assert.equal(node1.node, node2, "node1.node is still node2");
        assert.equal(node1.node ? node1.node.value : "x", "abc", "sub node ok");

        // check that child is processed before parent even if mutation is done is reverse order
        node1.value = "node13";
        node1.node.value = "node2x";

        await changeComplete(node1);
        assert.equal(isMutating(node1), false, "node13 is pristine");
        assert.equal(node1.value, "node13", "node14 value");
        assert.equal(node1.node ? node1.node.value : "x", "node2x", "node14.node value");

        assert.equal(node2[MP_META_DATA].parents, node1, "node1 is node2 parent");
        let node3 = new TestNode();
        node1.node = node3;
        assert.equal(node2[MP_META_DATA].parents, undefined, "node2 parent is undefined");
        assert.equal(node3[MP_META_DATA].parents, node1, "node1 is now node3 parent");
    });

    it('should correctly set value back after 2 consecutive changes', async function () {
        let node1 = new TestNode();

        assert.equal(isMutating(node1), false, "node1 is pristine");
        assert.equal(node1.value, "v1", "init value is v1");
        node1.value = "abc";
        node1.value = "def";
        assert.equal(node1.value, "def", "def value");

        await changeComplete(node1);
        assert.equal(isMutating(node1), false, "node11 is pristine");
        assert.equal(node1.value, "def", "node11 value is still def");
    });

    it('should properly update child refs: null->null', async function () {
        // null -> null       : nothing to do
        let node1 = new TestNode();

        assert.equal(node1.node2, null, "node2 is null by default");
        assert.equal(isMutating(node1), false, "node1 is unchanged");
        node1.node2 = null;
        assert.equal(isMutating(node1), false, "node1 is still unchanged");

        let node2 = new TestNode();
        node1.node2 = node2;
        await changeComplete(node1);

        assert.equal(isMutating(node1), false, "node1 is back to unchanged");
        assert.equal(node1.node2, node2, "node2 is set");
        assert.equal(node2[MP_META_DATA].parents, node1, "node2.parent is node1");
        node1.node2 = null;
        assert.equal(isMutating(node1), true, "node1 changed again");
        assert.equal(node1.node2, null, "node1.node2 is null");
        assert.equal(node2[MP_META_DATA].parents, undefined, "node2.parent is undefined");

        await changeComplete(node1);
        assert.equal(isMutating(node1), false, "node1 is back to unchanged (2)");
    });

    it('should properly update child refs: sth->sth', async function () {
        // sth -> sth         : no change, still reference the same item
        let node1 = new TestNode(), node2 = new TestNode();
        node2.value = "v2";
        node1.node2 = node2;
        await changeComplete(node1);
        let node12 = node1.node2;
        assert.equal(node1, node1, "changeComplete returns its argument");

        assert.equal(isMutating(node1), false, "node11 is pristine");
        node1.node2 = node12;
        assert.equal(isMutating(node1), false, "node11 is still pristine");
        node1.node2 = null;
        assert.equal(isMutating(node1), true, "node11 has changed");
        node1.node2 = node12;

        await changeComplete(node1);
        assert.equal(node1.node2, node12, "node12 sub node hasn't changed");
    });

    it('should properly support multiple parents (2 parents)', async function () {
        let node1 = new TestNode(), node2 = node1.node;
        assert.equal(node2.value, "v1", "node2 is properly initialized");
        assert.equal(isMutating(node2), false, "node2 unchanged");
        assert.equal(isMutating(node1), false, "node1 unchanged");

        let node3 = new TestNode();
        node3.node = node2;
        assert.deepEqual(node2[MP_META_DATA].parents, [node1, node3], "node1 + node3 parent");
        assert.equal(isMutating(node3), true, "node3 is changed");

        await changeComplete(node3);
        node1.node = new TestNode();
        assert.equal(node2[MP_META_DATA].parents, node3, "node3 is node2 parent");
        assert.equal(isMutating(node1), true, "node1 is changed");
        assert.equal(isMutating(node3), false, "node3 is unchanged");

        node3.node = new TestNode();
        assert.equal(node2[MP_META_DATA].parents, undefined, "node2 parent is now undefined");
        assert.deepEqual(node2[MP_META_DATA].nextParents, undefined, "node2.nextParents is still undefined");
        assert.equal(isMutating(node3), true, "node3 is now changed");
    });

    it('should properly support multiple parents (3 parents)', async function () {
        let node1 = new TestNode(), node2 = new TestNode(), node3 = new TestNode(), child = new TestNode();
        node1.node2 = child;
        node2.node2 = child;
        node3.node2 = child;

        assert.deepEqual(child[MP_META_DATA].parents, [node1, node2, node3], "parent: [node1, node2, node3]");
        node1.node2 = null;
        assert.deepEqual(child[MP_META_DATA].parents, [node2, node3], "node2 is first parent");

        node2.node2 = null;
        assert.equal(child[MP_META_DATA].parents, node3, "node3 is first parent");

        node3.node2 = null;
        assert.equal(child[MP_META_DATA].parents, undefined, "parent is undefined");

        // back to first state
        node1.node2 = child;
        node2.node2 = child;
        node3.node2 = child;

        assert.deepEqual(child[MP_META_DATA].parents, [node1, node2, node3], "node1 is first parent (2)");

        node2.node2 = null;
        assert.deepEqual(child[MP_META_DATA].parents, [node1, node3], "node1 + node3 (2)");

        node3.node2 = null;
        assert.equal(child[MP_META_DATA].parents, node1, "node1 is only parent (2)");

        node1.node2 = null;
        assert.equal(child[MP_META_DATA].parents, undefined, "first parent is undefined (2)");
    });

    it('should properly update child refs: sth->sthV2', async function () {
        // sth -> sthV2       : reference sthV2, clean sth, add item to sthV2 parents
        let node1 = new TestNode(), node2 = new TestNode();
        node1.node2 = node2;
        node2.value = "v2";

        await changeComplete(node1);
        assert.equal(node1.node2!.value, "v2", "new v2 value");

        node1.node2!.value = "v21";
        await changeComplete(node1);
        assert.equal(node1.node2!.value, "v21", "v21");

        // change, set to null and set back
        node1.node2!.value = "v22";
        let n = node1.node2;
        node1.node2 = null;
        node1.node2 = n;

        await changeComplete(node1);
        assert.equal(node1.node2!.value, "v22", "v22");
    });

    it('should properly update 2 refs to the same child', async function () {
        let node1 = new TestNode(), node2 = new TestNode();
        node1.node = node2;
        node2.value = "v2";
        node1.node2 = node2;

        assert.deepEqual(node2[MP_META_DATA].parents, [node1, node1], "parent:[node1,node1]");

        await changeComplete(node1);
        assert.equal(node1.node!.value, "v2", "node value updated");
        assert.equal(node1.node2!.value, "v2", "node2 value updated");
        assert.deepEqual(node1.node2![MP_META_DATA].parents, [node1, node1], "parent:[node1,node1] (2)");
        assert.equal(node1.node, node1.node2, "child nodes are identical");

        node1.node2 = null;
        assert.equal(node2![MP_META_DATA].parents, node1, "node1 is only parent");

        node1.node = new TestNode();
        assert.equal(node2![MP_META_DATA].parents, undefined, "parent is empty");
    });

    it("should support inheritance", async function () {
        let nd = new SubTestNode();

        assert.equal(nd.value, "v2", "overridden value");
        assert.equal(nd.quantity, 42, "nd support it own properties");
        assert.equal(nd.node.value, "v1", "inherited property");
        assert.equal(isMutating(nd), false, "unchanged");

        nd.node = new TestNode();
        nd.node.value = "v2";
        assert.equal(isMutating(nd), true, "nd changed");
        nd.quantity = 123;

        await changeComplete(nd);
        assert.equal(nd.quantity, 123, "quantity is now 123");
        assert.equal(nd.node!.value, "v2", "nd.node has properly mutated");
    });

    it("should support all base types", function () {
        let n = new SimpleNode();
        assert.equal(n.value, "", "default string");
        assert.equal(n.quantity, 0, "default number");
        assert.equal(n.ready, false, "default boolean");
    });

    it('should support version()', async function () {
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

    it("should support properties with any type", async function () {
        let n = new AnyNode(), tn = new TestNode();

        assert.equal(isMutating(n), false, "unchanged");

        n.foo = tn;
        assert.equal(isMutating(n), true, "changed");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (2)");

        tn.value = "abc";
        assert.equal(n.foo.value, "abc", "value properly set");
        assert.equal(isMutating(n), true, "changed (2)");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (3)");

        // set non-data object
        n.foo = { a: "AAA", b: "BBB" };
        assert.equal(isMutating(n), true, "changed (3)");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (4)");

        n.foo.a = "abc";
        assert.equal(n.foo.a, "abc", "value properly set (2)");
        assert.equal(isMutating(n), false, "unchanged (5)");

        // set back new data object
        n.foo = new TestNode();
        assert.equal(isMutating(n), true, "changed (6)");

        await changeComplete(n);
        assert.equal(n.foo.value, "v1", "value correctly read");
        n.foo.value = "v2";
        assert.equal(isMutating(n), true, "changed (7)");
    });

    it("should support properties with any[] type", async function () {
        let n = new AnyNode(), tn = new TestNode();

        assert.equal(isMutating(n), false, "unchanged");

        n.arr[0] = tn;
        assert.equal(isMutating(n), true, "changed");
        assert.equal(n.arr[0].value, "v1", "v1");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (2)");

        tn.value = "abc";
        assert.equal(n.arr[0].value, "abc", "value properly set");

        assert.equal(isMutating(n), true, "changed (2)");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (3)");

        // set non-data object
        n.arr[1] = { a: "AAA", b: "BBB" };
        assert.equal(isMutating(n), true, "changed (3)");

        await changeComplete(n);
        assert.equal(isMutating(n), false, "unchanged (4)");

        n.arr[1].a = "abc";
        assert.equal(n.arr[1].a, "abc", "value properly set (2)");
        assert.equal(isMutating(n), false, "unchanged (5)");

        // set back new data object
        n.arr[1] = new TestNode();
        assert.equal(isMutating(n), true, "changed (6)");

        await changeComplete(n);
        assert.equal(n.arr[1].value, "v1", "value correctly read");
        n.arr[1].value = "v2";
        assert.equal(isMutating(n), true, "changed (7)");
    });

});
