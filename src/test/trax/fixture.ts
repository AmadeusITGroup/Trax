import { Data } from '../../trax';

/**
 * TestNode 
 * Definition when code generator is implemented
 */
@Data export class TestNode {
    value = "v1";
    node: TestNode;            // a TestNode will automatically be created on first get
    node2: TestNode | null;    // null by default (not auto created)
}

@Data export class SimpleNode {
    value: string;
    quantity: number;
    ready: boolean;
}

@Data export class BaseTestNode {
    value = "v1";
    node: TestNode;
}

@Data export class SubTestNode extends BaseTestNode {
    quantity: number = 42;
    value = "v2";
}

@Data export class TestList {
    list: TestNode[];
}

@Data export class ArrTestNode {
    name = "no name";
    list: (TestNode | null)[];

    // @computed() get listLength() {
    //     processLengthCounter++;
    //     if (!this.list) return 0;
    //     return this.list.length;
    // }
}

export function initNewArrTestNode(): ArrTestNode {
    let node10 = new ArrTestNode(),
        list = node10.list,
        itm = new TestNode();

    list.push(itm);
    itm.value = "i1";
    itm = new TestNode();
    list.push(itm);
    itm.value = "i2";
    itm = new TestNode();
    list.push(itm);
    itm.value = "i3";
    return node10;
}