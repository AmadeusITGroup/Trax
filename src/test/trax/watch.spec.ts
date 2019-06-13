import { TestNode } from './fixture';
import * as assert from 'assert';
import { changeComplete, watch, unwatch } from '../../trax';

describe('Watchers', () => {

    it('should support watch and unwatch', async function () {
        let node = new TestNode(), watcherCalls1 = 0, watcherCalls2 = 0;
        node.value = "v2";

        // 1st watcher
        let watchRef = watch(node, () => {
            watcherCalls1++;
        });

        await changeComplete();
        assert.equal(watcherCalls1, 1, "1 watcher1 call");

        // 2nd watcher
        let watchRef2 = watch(node, () => {
            watcherCalls2++;
        });

        node.value = "ABC";
        await changeComplete();
        assert.equal(watcherCalls1, 2, "2 watcher1 calls");
        assert.equal(watcherCalls2, 1, "1 watcher2 calls");

        unwatch(node, watchRef);

        node.value = "ABC2";
        await changeComplete();
        assert.equal(watcherCalls1, 2, "still 2 watcher1 calls");
        assert.equal(watcherCalls2, 2, "2 watcher2 calls");

        unwatch(node, watchRef2);

        node.value = "ABC3";
        await changeComplete();
        assert.equal(watcherCalls1, 2, "2 watcher1 calls (2)");
        assert.equal(watcherCalls2, 2, "2 watcher2 calls (2)");
    });

    // it('should support watch and unwatch', async function () {
    //     let node = initNewArrTestNode(), watcherCalls = 0;

    //     let watchRef = watch(node, (newNode) => {
    //         watcherCalls++;
    //         node = newNode;
    //     });

    //     await changeComplete(node);

    //     assert.equal(watcherCalls, 1, "1 watcher call");
    //     assert.equal(node.list!.length, 3, "3 items in the node list");
    //     assert.equal(node.name, "no name", "node name is no name");

    //     node.name = "ABC";
    //     let itm = new TestNode();
    //     itm.value = "last item";
    //     node.list.push(itm);

    //     await changeComplete(node);

    //     assert.equal(watcherCalls, 2, "2 watcher calls");
    //     assert.equal(node.list!.length, 4, "4 items in the node list");
    //     assert.equal(node.name, "ABC", "node name is ABC");

    //     unwatch(node, watchRef);

    //     node.name = "ABC2";

    //     await changeComplete(node);

    //     assert.equal(watcherCalls, 2, "still 2 watcher calls");
    //     assert.equal(node.list!.length, 4, "4 items in the node list");
    //     assert.equal(node.name, "ABC2", "node name is now ABC2");
    // });
});
