// trax:ignore
import * as assert from 'assert';
import { generate } from '../../trax/compiler/generator';
import { formatError } from './utils';

describe('Compilation errors', () => {

    function error(src) {
        try {
            generate(src, "file.ts", { logErrors: false });
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
            File: file.ts - Line 4 / Col 30
            Extract: >> constructor() { <<
        `, "1");
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
    });
});