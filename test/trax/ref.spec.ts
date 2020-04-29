import * as assert from 'assert';
import { changeComplete, Data, ref, version } from '../..';

describe('@ref', () => {
    interface NameHolder {
        name: string;
    }

    @Data class Person {
        name: string;
    }

    @Data class Values {
        text1: string;
        @ref text2: string;     // no really useful for primitive types - except that not initialized;
        @ref quantity: number;
        @ref checked: boolean;
        @ref person: NameHolder;
    }

    it('should work for simple types and interfaces', async function () {
        const v = new Values();

        assert.equal(version(v), 0, "v version 0");
        assert.equal(v.text2, undefined, "v.text2 is undefined");
        assert.equal(v.quantity, undefined, "v.quantity is undefined");
        assert.equal(v.checked, undefined, "v.checked is undefined");
        assert.equal(v.person, undefined, "v.person is undefined");
        assert.equal(version(v), 0, "v version 0.1");

        v.text2 = "abc";
        assert.equal(version(v), 1, "v version 1");
        v.person = { name: "mickey" };

        await changeComplete(v);
        assert.equal(v.person.name, "mickey", "mickey");
        assert.equal(version(v), 2, "v version 2");
        v.person.name = "homer";
        assert.equal(version(v), 2, "v version 2.1");

        v.text2 = "def";
        assert.equal(version(v), 3, "v version 3");
    });

    it('should work with collections + depth', async function () {
        @Data class RefCol {
            @ref values: string[] = [];            // only 'values' reference is tracked, not the list
            @ref.depth(2) people: NameHolder[];    // ref and list are tracked (but not items)
            @ref.depth(3) names: { [name: string]: NameHolder[] }; // ref, dictionary and list are tracked, not the items
        }

        const r = new RefCol();
        assert.equal(version(r), 1, "r version 1"); // not 0 because values is initialized to []

        await changeComplete(r);
        assert.equal(r.values.length, 0, "values has been initialized and is empty");
        r.values.push("abc");
        assert.equal(version(r), 2, "r version 2");

        r.people.push({ name: "bart" });
        assert.equal(version(r), 3, "r version 3"); // people list is tracked

        await changeComplete(r);
        assert.equal(version(r), 4, "r version 4");
        r.people[0].name = "homer";
        assert.equal(version(r), 4, "r version 4.1"); // people list content is not tracked

        r.names["f"] = [];
        r.names["f"].push({ name: "marge" });
        assert.equal(version(r), 5, "r version 5");

        await changeComplete(r);
        assert.equal(version(r), 6, "r version 6");
        r.names["f"][0].name = "lisa";
        assert.equal(version(r), 6, "r version 6.1"); // item is not tracked

        r.names["f"].push({ name: "maggie" });
        assert.equal(version(r), 7, "r version 7"); // array is tracked

        await changeComplete(r);
        assert.equal(version(r), 8, "r version 8");
        r.values = [];
        assert.equal(version(r), 9, "r version 9"); // values ref is tracked
    });

    it('should not track sub trax objects', async function () {
        @Data class State {
            @ref person: Person;
        }

        const state = new State();
        state.person = new Person();
        state.person.name = "mickey";
        assert.equal(version(state), 1, "state version 1");

        await changeComplete(state);
        assert.equal(version(state), 2, "state version 2");
        state.person.name = "minnie";
        assert.equal(version(state), 2, "state version 2.1");

        state.person = new Person();
        state.person.name = "maggie";
        assert.equal(version(state), 3, "state version");
    });
});
