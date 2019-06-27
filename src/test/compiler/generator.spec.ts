// trax:ignore
import * as assert from 'assert';
import { generate, getPropertyDefinition, getClassDecorator } from '../../trax/compiler/generator';

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

    it("should support types that can be null", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street: string | null
                valid: boolean  | null;
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, ΔfBool } from "./trax";

            @ΔD class Address {
                ΔΔstreet: string | null; @Δp(ΔfStr, 1) street: string | null;
                ΔΔvalid: boolean  | null; @Δp(ΔfBool, 1) valid: boolean | null;
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

    it("should support types that can be null", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                streets: string[]
                bar: Bar[] | null;
                baz: Bar[][] | null;
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δlf, Δp, Δf } from "./trax";

            @ΔD class Address {
                ΔΔstreets: string[]; @Δp(Δlf(ΔfStr)) streets: string[];
                ΔΔbar: Bar[] | null; @Δp(Δlf(Δf(Bar)), 1) bar: Bar[] | null;
                ΔΔbaz: Bar[][] | null; @Δp(Δlf(Δlf(Δf(Bar))), 1) baz: Bar[][] | null;
            }
        `, "1");
    });

    it("should support types that can be undefined", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street?: string
                bar: Bar[] | undefined | null;
                baz?: Bar[][];
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, Δf, Δlf } from "./trax";

            @ΔD class Address {
                ΔΔstreet?: string; @Δp(ΔfStr, 2) street?: string;
                ΔΔbar: Bar[] | undefined | null; @Δp(Δlf(Δf(Bar)), 3) bar?: Bar[] | null;
                ΔΔbaz?: Bar[][]; @Δp(Δlf(Δlf(Δf(Bar))), 2) baz?: Bar[][];
            }
        `, "1");
    });

    it("should support Arrays with item types that can be null", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                bar: (Bar | null)[]
            }
        `, 'myFile.ts'), `
            import { ΔD, Δf, Δlf, Δp } from "./trax";

            @ΔD class Address {
                ΔΔbar: (Bar | null)[]; @Δp(Δlf(Δf(Bar))) bar: (Bar | null)[];
            }
        `, "1");
    });

    it("should support any types", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                streets: any[]
                bar;
                baz: any;
            }
        `, 'myFile.ts'), `
            import { ΔD, Δlf, Δp } from "./trax";

            @ΔD class Address {
                ΔΔstreets: any[]; @Δp(Δlf()) streets: any[];
                ΔΔbar; @Δp() bar: any;
                ΔΔbaz: any; @Δp() baz: any;
            }
        `, "1");
    });

    it("should allow to generate any property individually", async function () {
        assert.equal(getPropertyDefinition({ name: "foo" }),
            "ΔΔfoo: any; @Δp() foo: any;",
            "1");

        assert.equal(getPropertyDefinition({ name: "foo", type: { kind: "string" } }, "x."),
            "ΔΔfoo: string; @x.Δp(x.ΔfStr) foo: string;",
            "2");

        let imports = {}
        function addImport(symbol) {
            imports[symbol] = 1;
        }

        assert.equal(getPropertyDefinition({ name: "bar", type: { kind: "array", itemType: { kind: "reference", identifier: "Bar" } } }, "xxx", addImport),
            "ΔΔbar: Bar[]; @xxxΔp(xxxΔlf(xxxΔf(Bar))) bar: Bar[];",
            "3");

        assert.deepEqual(imports, {
            "xxxΔf": 1, "xxxΔlf": 1, "xxxΔp": 1
        }, "4");
    });

    it("should allow to generate class decorator individually", async function () {
        let imports = {}
        function addImport(symbol) {
            imports[symbol] = 1;
        }

        assert.equal(getClassDecorator("xxx", addImport), "@xxxΔD", "1");
        assert.deepEqual(imports, { "xxxΔD": 1 }, "2");
    });

    // todo export property generator
    // todo support import Data from "./trax" -> default import ?;
});