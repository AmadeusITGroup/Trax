import * as assert from 'assert';
import * as fx from "./fixture";
import { isMutating, reset, changeComplete } from '../../trax';

describe('@computed', () => {

    it('should work for simple types', async function () {
        let initCount = fx.processLengthCounter,
            atn = new fx.ArrTestNode();

        assert.equal(fx.processLengthCounter, initCount, "processor not called by constructor");
        assert.equal(atn.listLength, 0, "listLength is 0 by default 1");
        assert.equal(fx.processLengthCounter, initCount + 1, "processor called once");
        assert.equal(atn.listLength, 0, "listLength is 0 by default 2");
        assert.equal(fx.processLengthCounter, initCount + 1, "processor still called once");

        let ls = reset(atn, "list");
        // list prop changed
        assert.equal(atn.listLength, 0, "listLength is 0 by default 3");
        assert.equal(fx.processLengthCounter, initCount + 2, "processor called twice");
        assert.equal(atn.listLength, 0, "listLength is 0 by default 4");
        assert.equal(fx.processLengthCounter, initCount + 2, "processor called twice 2");

        assert.equal(isMutating(ls), false, "ls is not mutating");
        ls.push(new fx.TestNode());
        assert.equal(isMutating(ls), true, "ls is mutating");
        assert.equal(atn.listLength, 1, "listLength is 1 (1)");
        assert.equal(fx.processLengthCounter, initCount + 3, "processor called 3 times");
        assert.equal(atn.listLength, 1, "listLength is 1 (2)");
        assert.equal(fx.processLengthCounter, initCount + 4, "processor called 4 times as list is mutating");

        await changeComplete(atn);
        assert.equal(atn.listLength, 1, "listLength is 1 (3)");
        assert.equal(fx.processLengthCounter, initCount + 5, "processor called 5 times as list has mutated");
        atn.name = "some new name";
        assert.equal(atn.listLength, 1, "listLength is 1 (4)");
        assert.equal(fx.processLengthCounter, initCount + 5, "processor called 5 times as list has not changed");

        atn.list[0]!.value = "v2";
        assert.equal(atn.listLength, 1, "listLength is 1 (5)");
        assert.equal(fx.processLengthCounter, initCount + 6, "processor called 6 times as list is mutating");

        await changeComplete(atn);
        assert.equal(atn.listLength, 1, "listLength is 1 (6)");
        assert.equal(fx.processLengthCounter, initCount + 7, "processor called 7 times as list has changed");
        assert.equal(atn.listLength, 1, "listLength is 1 (7)");
        assert.equal(fx.processLengthCounter, initCount + 7, "processor called 7 times as list has not changed");

        ls.push(new fx.TestNode());
        await changeComplete(atn);
        assert.equal(atn.listLength, 2, "listLength is 2");
        assert.equal(fx.processLengthCounter, initCount + 8, "processor called 8 times as list has changed");
    });

});