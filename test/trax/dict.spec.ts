import * as assert from 'assert';
import { changeComplete, Data, version, hasParents } from '../..';

describe('Dictionaries', () => {

    @Data class Person {
        name: string;
    }

    async function createDict() {
        @Data class Dict {
            persons: { [name: string]: Person };
        }

        const d = new Dict();
        d.persons["a"] = createPerson("Marge");
        d.persons["b"] = createPerson("Lisa");
        d.persons["c"] = createPerson("Maggie");

        await changeComplete(d);
        return d;
    }

    function createPerson(name: string) {
        const p = new Person();
        p.name = name;
        return p;
    }

    it("should be supported for trax objects", async function () {
        @Data class Dict {
            persons: { [name: string]: Person };
        }

        const p = new Person();
        p.name = "Homer";
        await changeComplete(p);
        assert.equal(version(p), 2, "p version");

        let d = new Dict();
        assert.equal(version(d), 0, "d version 0");
        d.persons["Homer"] = p;
        assert.equal(version(d), 1, "d version 1");

        await changeComplete(d);
        assert.equal(version(d), 2, "d version 2");
        assert.equal(d.persons["Homer"].name, "Homer", "name");
        assert.equal(d.persons["xyz"], undefined, "xyz");
        assert.equal(version(d), 2, "d version 2.1");

        p.name = "Homer2";
        assert.equal(version(d), 3, "d version 3");

        await changeComplete(d);
        assert.equal(version(d), 4, "d version 4");

        const p2 = new Person();
        p2.name = "Marge";
        d.persons["M"] = p2;
        assert.equal(version(d), 5, "d version 5");
        assert.equal(d.persons["M"].name, "Marge", "name 2");

        await changeComplete(d);
        assert.equal(version(d), 6, "d version 6");
        assert.equal(hasParents(p2), true, "p2 has parents");

        const p3 = new Person();
        p2.name = "Bart";
        d.persons["M"] = p3;

        await changeComplete(d);
        assert.equal(hasParents(p2), false, "p2 has no parents");
    });

    it("should be supported for base types (string)", async function () {
        @Data class Dict {
            names: { [firstName: string]: string };
        }

        const d = new Dict();
        d.names["Bart"] = "Simpson";
        d.names["Mickey"] = "Mouse";

        assert.equal(version(d), 1, "d version 1");
        assert.equal(d.names["Bart"], "Simpson", "bart");
        assert.equal(d.names["Mickey"], "Mouse", "mickey");
        assert.equal(d.names["xyz"], undefined, "xyz");

        await changeComplete(d);
        assert.equal(version(d), 2, "d version 2");

        d.names["Bart"] = "Simpson2";
        assert.equal(version(d), 3, "d version 3");

        await changeComplete(d);
        assert.equal(version(d), 4, "d version 4");
        d.names["Bart"] = "Simpson2";
        assert.equal(version(d), 4, "d version 4.1");
    });

    it("should be supported for trax objects that can be null (union type)", async function () {
        @Data class Dict {
            persons: { [name: string]: Person | null };
        }

        const d = new Dict();
        const pA = d.persons["A"] = new Person();
        pA.name = "Homer";
        d.persons["B"] = new Person();
        d.persons["B"]!.name = "Bart";

        assert.equal(version(d), 1, "d version 1");
        assert.equal(hasParents(pA), true, "pA has parents");

        await changeComplete(d);
        assert.equal(version(d), 2, "d version 2");
        assert.equal(version(pA), 2, "pA version 2");
        d.persons["A"] = null;
        assert.equal(hasParents(pA), false, "pA has no parents");
        assert.equal(version(pA), 2, "pA version 2.1");
    });

    it("should support for ... in", async function () {
        const d = await createDict();

        assert.equal(version(d), 2, "d version 2");

        const indexes: string[] = [];
        for (let k in d.persons) if (d.persons.hasOwnProperty(k)) {
            indexes.push(k);
        }

        assert.equal(indexes.join(","), "a,b,c", "indexes");
        assert.equal(version(d), 2, "d version 2.1");
    });

    it("should support delete", async function () {
        const d = await createDict();
        const maggie = d.persons["c"];

        assert.equal(version(d), 2, "d version 2");
        assert.equal(version(maggie), 2, "maggie version 2");
        assert.equal(hasParents(maggie), true, "maggie has parents");

        delete d.persons["c"];
        assert.equal(version(d), 3, "d version 3");
        assert.equal(d.persons["c"], undefined, "c deleted");
        assert.equal(hasParents(maggie), false, "maggie has no parents");
        assert.equal(version(maggie), 2, "maggie version 2.1");

        const indexes: string[] = [];
        for (let k in d.persons) if (d.persons.hasOwnProperty(k)) {
            indexes.push(k);
        }

        assert.equal(indexes.join(","), "a,b", "indexes");
        assert.equal(version(d), 3, "d version 3.1");
    });

    it("should support replace with empty {}", async function () {
        const d = await createDict();
        const persons = d.persons;

        assert.equal(hasParents(persons), true, "persons has parents");

        d.persons = {};
        assert.equal(hasParents(persons), false, "persons has no parents");
        assert.equal(version(d), 3, "d version 3");

        await changeComplete(d);
        d.persons["homer"] = createPerson("Homer");
        assert.equal(version(d), 5, "d version 5");

        await changeComplete(d);
        assert.equal(d.persons["homer"].name, "Homer", "homer is Homer");
        assert.equal(version(d), 6, "d version 6");
    });

    it("should support a dictionaries of dictionaries", async function () {
        @Data class DictOfDict {
            students: { [gender: string]: { [name: string]: Person } };
        }

        const d = new DictOfDict();
        d.students["m"] = {};
        const males = d.students["m"]; // cannot be on the previous line because of a bug in some JS engines

        assert.equal(version(d.students), 1, "d.students version 1");
        males["hs"] = createPerson("Homer");
        assert.equal(version(males), 1, "males version 1");
        assert.equal(d.students["m"] !== undefined, true, "d.students['m'] is not undefined");
        males["bs"] = createPerson("Bart");
        d.students["f"] = {};
        d.students["f"]["ms"] = createPerson("Marge");
        d.students["f"]["ls"] = createPerson("Lisa");
        d.students["f"]["mgs"] = createPerson("Maggie");

        assert.equal(version(d), 1, "d version 1");

        await changeComplete(d);
        assert.equal(version(d), 2, "d version 2");

        const arr: string[] = [];
        for (let gender in d.students) if (d.students.hasOwnProperty(gender)) {
            for (let initials in d.students[gender]) if (d.students[gender].hasOwnProperty(initials)) {
                arr.push(gender + ":" + initials + ":" + d.students[gender][initials].name);
            }
        }
        assert.equal(arr.join("/"), "m:hs:Homer/m:bs:Bart/f:ms:Marge/f:ls:Lisa/f:mgs:Maggie", "collection content");
        assert.equal(version(d), 2, "d version 2.1");
    });

    it("should support a dictionaries of lists", async function () {
        @Data class DictOfList {
            students: { [gender: string]: Person[] };
        };

        const d = new DictOfList();
        d.students["m"] = []; // create new list
        const ml = d.students["m"];
        assert.equal(version(d), 1, "d version 1");
        ml.push(createPerson("Homer"));
        ml.push(createPerson("Bart"));
        d.students["f"] = [];
        const fl = d.students["f"];
        fl.push(createPerson("Marge"));
        fl.push(createPerson("Lisa"));
        fl.push(createPerson("Maggie"));
        assert.equal(version(d), 1, "d version 1");

        await changeComplete(d);
        assert.equal(version(d), 2, "d version 2");

        const arr: string[] = [];
        ml.forEach((p: Person, idx: number) => {
            arr.push("m:" + idx + ":" + p.name);
        });
        fl.forEach((p: Person, idx: number) => {
            arr.push("f:" + idx + ":" + p.name);
        });
        assert.equal(arr.join("/"), "m:0:Homer/m:1:Bart/f:0:Marge/f:1:Lisa/f:2:Maggie", "collection content");
        assert.equal(version(d), 2, "d version 2.1");
    });
});