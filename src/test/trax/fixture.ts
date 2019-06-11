import { Data } from '../../trax';

/**
 * TestNode 
 * Definition when code generator is implemented
 */
@Data export class TestNode {
    value = "v1";
    node: TestNode;                 // a TestNode will automatically be created at first get
    node2: TestNode | undefined;    // undefined by default (not auto created)
}
