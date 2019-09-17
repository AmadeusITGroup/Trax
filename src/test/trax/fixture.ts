import { Data, computed } from '../../trax';

export let processLengthCounter = 0;

/**
 * TestNode 
 * Definition when code generator is implemented
 */
@Data export class TestNode {
    value = "v1";
    node: TestNode;            // a TestNode will automatically be created on first get
    node2: TestNode | null;    // null by default (not auto created)
}

function init(nbr) {
    return "v" + nbr;
}
class Bar {
    v: string;
    constructor(val: string) {
        this.v = "X" + val + "X";
    }
}

let count = 0;

export function resetCount() {
    count = 0;
}

@Data export class TestNode2 {
    value = init("42");
    bar = new Bar("the_bar");
    quantity = -1;
    count = count++;
}

@Data export class TestNode3 {
    arr1: number[] = [1, 2, 3];
    arr2: string[] = ["abc"];
    arr3: any[] = [];
}

@Data export class SimpleNode {
    value: string;
    quantity: number;
    ready: boolean;
}

@Data export class AnyNode {
    foo: any;
    arr: any[];
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

    @computed get listLength() {
        processLengthCounter++;
        if (!this.list) return 0;
        return this.list.length;
    }
}

// TODO
// @Data export class TestDictionary {
//     dict: { [key: string]: string };
// }

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