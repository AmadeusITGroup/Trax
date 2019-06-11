import * as assert from 'assert';
import { TestNode } from "./fixture";
import { isBeingChanged } from '../../trax';

describe('Data objects', () => {

    it('should have correct init values', () => {
        let nd = new TestNode();
        assert.equal(nd['ΔΔvalue'], "v1", "v1 init value string");
        assert.equal(nd['ΔΔnode'], undefined, "node is undefined");
        assert.equal(nd['ΔΔnode2'], undefined, "null init node2");
        assert.equal(isBeingChanged(nd), false, "not mutating after creation");
    });

});
