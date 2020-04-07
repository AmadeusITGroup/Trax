// trax:ignore
import * as assert from 'assert';
import { generate } from '../../src/compiler/generator';
import { formatError } from './utils';

describe('Compilation errors', () => {

    function error(src, options?) {
        try {
            options = options || {};
            options.logErrors = false;
            generate(src, "file.ts", options);
        } catch (err) {
            return formatError(err, true);
        }
        return "No Error";
    }

    it("should forward parsing errors", function () {
        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                constructor() {
                    this.bar=123;
                }
            }
        `), `
            TRAX: Constructors are not authorized in Data objects
            File: file.ts - Line 4 / Col 31
            Extract: >> constructor() { <<
        `, "1");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class {
                p: string;
            }
        `), `
            TRAX: Data class name must be defined
            File: file.ts - Line 3 / Col 13
            Extract: >> @Data class { <<
        `, "2");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                prop:boolean;

                foo() {
                    // do sth
                }
            }
        `, { acceptMethods: false }), `
            TRAX: Methods cannot be defined in this object
            File: file.ts - Line 6 / Col 17
            Extract: >> foo() { <<
        `, "3");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                prop: number;
                bar: "abc";
            }
        `), `
            TRAX: Unsupported use case [187]
            File: file.ts - Line 5 / Col 22
            Extract: >> bar: "abc"; <<
        `, "4");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                prop: number;
                bar: Bar | Baz;
            }
        `), `
            TRAX: Multiple data types are not supported
            File: file.ts - Line 5 / Col 22
            Extract: >> bar: Bar | Baz; <<
        `, "5");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                prop: number;
                bar: Bar | "abc";
            }
        `), `
            TRAX: Unsupported type
            File: file.ts - Line 5 / Col 28
            Extract: >> bar: Bar | "abc"; <<
        `, "6");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                dict: {[k:Bar]: string};
            }
        `), `
            TRAX: Dictionaries can only be indexed by strings
            File: file.ts - Line 4 / Col 23
            Extract: >> dict: {[k:Bar]: string}; <<
        `, "7");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                list: Array<string>;
            }
        `), `
            TRAX: Array collections must be defined through the xxx[] notation
            File: file.ts - Line 4 / Col 23
            Extract: >> list: Array<string>; <<
        `, "8");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                dict: Map<string>;
            }
        `), `
            TRAX: Maps and Sets are not supported. Please use Dictionary Objects instead
            File: file.ts - Line 4 / Col 23
            Extract: >> dict: Map<string>; <<
        `, "9");

        assert.equal(error(`
            import { Data } from 'trax';
            @Data class Foo {
                dict: WeakSet<string>;
            }
        `), `
            TRAX: Maps and Sets are not supported. Please use Dictionary Objects instead
            File: file.ts - Line 4 / Col 23
            Extract: >> dict: WeakSet<string>; <<
        `, "10");
    });

    it("should forward typescript parsing errors", function () {
        assert.equal(error(`
            import { Data } from 'trax';
            @Data class. Foo {
                bar=123;
            }
        `), `
            TS: '{' expected.
            File: file.ts - Line 3 / Col 24
            Extract: >> @Data class. Foo { <<
        `, "1");
    });

    it("should handle generator errors", function () {
        assert.equal(error(`
            import { Data } from 'trax';
            import { Data } from 'trax2';
            @Data class Foo {
                bar=123;
            }
        `), `
            TRAX: Duplicate Data import
            File: file.ts - Line 3 / Col 21
            Extract: >> import { Data } from 'trax2'; <<
        `, "1");

        assert.equal(error(`
            import { Xxx } from 'trax';

            @Data class Foo {
                bar=123;
            }
        `), `
            TRAX: @Data import not found
            File: file.ts - Line 0 / Col 0
            Extract: >>  <<
        `, "2");
    });
});