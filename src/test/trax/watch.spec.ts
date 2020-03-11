import { TestNode, initNewArrTestNode } from './fixture';
import * as assert from 'assert';
import { changeComplete, watch, unwatch, numberOfWatchers, version, commitChanges, isMutating, createNewRefreshContext } from '../../trax';

describe('Watchers', () => {

    it('should support watch and unwatch', async function () {
        let node = new TestNode(), watcherCalls1 = 0, watcherCalls2 = 0;
        node.value = "v2";

        // 1st watcher
        let watchRef = watch(node, () => {
            watcherCalls1++;
        });

        await changeComplete(node);
        assert.equal(watcherCalls1, 1, "1 watcher1 call");
        assert.equal(numberOfWatchers(node), 1, "1 registered watcher");

        // 2nd watcher
        let watchRef2 = watch(node, () => {
            watcherCalls2++;
        });
        assert.equal(numberOfWatchers(node), 2, "2 registered watchers");

        node.value = "ABC";
        await changeComplete(node);
        assert.equal(watcherCalls1, 2, "2 watcher1 calls");
        assert.equal(watcherCalls2, 1, "1 watcher2 calls");

        unwatch(node, watchRef);
        assert.equal(numberOfWatchers(node), 1, "1 registered watcher (2)");

        node.value = "ABC2";
        await changeComplete(node);
        assert.equal(watcherCalls1, 2, "still 2 watcher1 calls");
        assert.equal(watcherCalls2, 2, "2 watcher2 calls");

        unwatch(node, watchRef2);
        assert.equal(numberOfWatchers(node), 0, "0 registered watchers (2)");

        node.value = "ABC3";
        await changeComplete(node);
        assert.equal(watcherCalls1, 2, "2 watcher1 calls (2)");
        assert.equal(watcherCalls2, 2, "2 watcher2 calls (2)");
    });

    it('should accept undefined values for watch()', async function () {
        function f() { }
        assert.equal(watch(undefined, f), null, "watch not registered");
    });

    function performChanges(node: TestNode, value: string, watchFn: (() => void) | null) {
        if (!isMutating(node)) {
            createNewRefreshContext();
        }

        unwatch(node, watchFn);
        node.value = value;
        commitChanges(node);
        watch(node, watchFn as any);
    }

    it('should work with commitChanges', async function () {
        let node1 = new TestNode(), node2 = new TestNode(), watcherCalls1 = 0, watcherCalls2 = 0;

        assert.equal(version(node1), 0, "pristine");
        node2.value = "v2";

        assert.equal(version(node2), 1, "node2 in version 1");

        function watchFn() {
            watcherCalls1++;
        }

        watch(node1, watchFn);
        assert.equal(version(node1), 0, "pristine (2)");

        performChanges(node1, "node1-v2", null);
        assert.equal(watcherCalls1, 1, "watcherCalls1=1");
        assert.equal(node1.value, "node1-v2", "node1.value ok");
        assert.equal(version(node1), 2, "node1 in version 2");
        assert.equal(version(node2), 1, "node2 in version 1 (2)");

        performChanges(node1, "node1-v3", watchFn);
        assert.equal(watcherCalls1, 1, "watcherCalls1=1");
        assert.equal(node1.value, "node1-v3", "node1.value ok (2)");
        assert.equal(version(node1), 4, "node1 in version 4");
        assert.equal(version(node2), 1, "node2 in version 1 (2)");
    });

    it('should support watch and unwatch on lists', async function () {
        let node = initNewArrTestNode(), watcherCalls = 0;

        let watchRef = watch(node, (newNode) => {
            watcherCalls++;
            node = newNode as any;
        });

        await changeComplete(node);

        assert.equal(watcherCalls, 1, "1 watcher call");
        assert.equal(node.list!.length, 3, "3 items in the node list");
        assert.equal(node.name, "no name", "node name is no name");

        node.name = "ABC";
        let itm = new TestNode();
        itm.value = "last item";
        node.list.push(itm);

        await changeComplete(node);

        assert.equal(watcherCalls, 2, "2 watcher calls");
        assert.equal(node.list!.length, 4, "4 items in the node list");
        assert.equal(node.name, "ABC", "node name is ABC");

        unwatch(node, watchRef);

        node.name = "ABC2";

        await changeComplete(node);

        assert.equal(watcherCalls, 2, "still 2 watcher calls");
        assert.equal(node.list!.length, 4, "4 items in the node list");
        assert.equal(node.name, "ABC2", "node name is now ABC2");
    });
});
