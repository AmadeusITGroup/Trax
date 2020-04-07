import * as assert from 'assert';
import { changeComplete, Data, version, dispose, hasParents } from '../../src';
import { TestNode } from './fixture';

describe('Dispose', () => {

    @Data class Person {
        name: string;
    }

    @Data class Book {
        title: string;
        owner: Person;
        author: Person;
        mainCharacter: Person | null = null;
    }

    function createPerson(name: string) {
        const p = new Person();
        p.name = name;
        return p;
    }

    it("should disconnect all child properties", async function () {
        const b = new Book();
        b.title = "Catch 22";
        b.author = createPerson("Joseph Heller");
        b.owner = createPerson("Wes Anderson");

        assert.equal(version(b), 1, "b version 1");
        const author = b.author;

        await changeComplete(b);
        assert.equal(version(author), 2, "author version 2");

        assert.equal(hasParents(author), true, "author has a parent");
        dispose(b);
        assert.equal(hasParents(author), false, "author doesn't have any parents");

        assert.equal(b.author !== author, true, "new author created");
        assert.equal(version(b.author), 0, "b.author version 0");
        assert.equal(version(author), 2, "author version 2.1");
    });

    it("should work for lists (one parent)", async function () {
        @Data class DataList {
            list: TestNode[];
        }

        const dl = new DataList(), ls = dl.list,
            nda = ls[0] = new TestNode(),
            ndb = ls[1] = new TestNode();

        nda.value = "a";
        ndb.value = "b";
        await changeComplete(ls);

        assert.equal(hasParents(nda), true, "nda has a parent");
        assert.equal(hasParents(dl.list), true, "list has a parent");

        const ls1 = dl.list;
        dispose(ls1);
        assert.equal(hasParents(nda), false, "nda has no parents");
        assert.equal(hasParents(ls1), false, "list has no parents");
        assert.equal(version(dl), 3, "dl version 3");
    });

    it("should work for dictionaries (two parents)", async function () {
        @Data class DataDict {
            dict: { [key: string]: Person };
        }

        const d1 = new DataDict();
        const pa = d1.dict["a"] = createPerson("Person A");
        d1.dict["b"] = createPerson("Person B");

        const d2 = new DataDict();
        d2.dict = d1.dict;

        await changeComplete(d1);
        assert.equal(version(d1), 2, "d1 version 2");
        assert.equal(version(d2), 2, "d2 version 2");

        d2.dict["a"].name = "Person AAA";
        assert.equal(version(d1), 3, "d1 version 3");
        assert.equal(version(d2), 3, "d2 version 3");

        await changeComplete(d1);
        const dict = d1.dict;
        assert.equal(hasParents(dict), true, "dict has parents");
        assert.equal(hasParents(pa), true, "pa has parents");
        dispose(d1.dict);
        assert.equal(hasParents(pa), false, "pa has no more parents");
        assert.equal(hasParents(dict), false, "dict has no more parents");

        assert.equal(version(d1), 5, "d1 version 5");
        assert.equal(version(d2), 5, "d2 version 5");
        assert.equal(d1.dict !== dict, true, "d1 has a new dict");
        assert.equal(d2.dict !== dict, true, "d2 has a new dict");

    });

    it("should work recursively", async function () {
        @Data class DataDict {
            persons: { [key: string]: Person };
        }

        @Data class DataList {
            persons: Person[];
        }

        @Data class DataGroup {
            subGroup?: DataGroup;
            dict: DataDict;
            list: DataList;
        }

        const g = new DataGroup();
        const pa = g.dict.persons["a"] = createPerson("Person A");
        assert.equal(g.subGroup, undefined, "subgroup is undefined");
        g.subGroup = new DataGroup();
        const gsd = g.subGroup.dict;
        const pb = g.subGroup.dict.persons["b"] = createPerson("Person B");
        const pc = g.list.persons[0] = createPerson("Person C");

        assert.equal(version(g), 1, "g version 1");
        assert.equal(version(gsd), 1, "gsd version 1");
        assert.equal(hasParents(gsd), true, "gsd has parents");
        assert.equal(hasParents(pa), true, "pa has parents");
        assert.equal(hasParents(pb), true, "pb has parents");
        assert.equal(hasParents(pc), true, "pc has parents");

        await changeComplete(g);
        dispose(g, true);
        assert.equal(hasParents(gsd), false, "gsd has no parents");
        assert.equal(hasParents(pa), false, "pa has no parents");
        assert.equal(hasParents(pb), false, "pb has no parents");
        assert.equal(hasParents(pc), false, "pc has no parents");

    });

    // todo: work with ref
});
