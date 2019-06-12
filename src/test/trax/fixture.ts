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
