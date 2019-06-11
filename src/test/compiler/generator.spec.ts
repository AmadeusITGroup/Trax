// trax:ignore
import * as assert from 'assert';
import { generate } from '../../compiler/generator';

describe('Generator', () => {

    it("should support simple types", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street: string
                zipCode: number;
                valid: boolean;
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, ΔfNbr, ΔfBool } from "./trax";

            @ΔD class Address {
                ΔΔstreet: string; @Δp(ΔfStr) street: string;
                ΔΔzipCode: number; @Δp(ΔfNbr) zipCode: number;
                ΔΔvalid: boolean; @Δp(ΔfBool) valid: boolean;
            }
        `, "1");
    });

    it("should support types that can be undefined", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street: string | undefined
                valid: boolean  | undefined;
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, ΔfBool } from "./trax";

            @ΔD class Address {
                ΔΔstreet: string | undefined; @Δp(ΔfStr, 1) street: string | undefined;
                ΔΔvalid: boolean  | undefined; @Δp(ΔfBool, 1) valid: boolean | undefined;
            }
        `, "1");
    });

    it("should support Data object types", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                sth: string;
            }

            @Data class Bar {
                theFoo: Foo
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, Δf } from "./trax";

            @ΔD class Foo {
                ΔΔsth: string; @Δp(ΔfStr) sth: string;
            }

            @ΔD class Bar {
                ΔΔtheFoo: Foo; @Δp(Δf(Foo)) theFoo: Foo;
            }
        `, "1");
    });

    // todo support import Data from "./trax" -> default import ?;
});