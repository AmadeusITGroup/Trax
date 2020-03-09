// trax:ignore
import * as assert from 'assert';
import { generate } from '../../trax/compiler/generator';
import { DataMember } from '../../trax/compiler/types';
import { formatError } from './utils';

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
                foo?;
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, Δf, Δlf } from "./trax";

            @ΔD class Address {
                ΔΔstreet?: string; @Δp(ΔfStr, 2) street?: string;
                ΔΔbar: Bar[] | undefined | null; @Δp(Δlf(Δf(Bar)), 3) bar?: Bar[] | null;
                ΔΔbaz?: Bar[][]; @Δp(Δlf(Δlf(Δf(Bar))), 2) baz?: Bar[][];
                ΔΔfoo?; @Δp(0, 2) foo?: any;
            }
        `, "1");
    });

    it("should generate ΔDefault method", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street?: string = "";
                zip: number = 12345;
                country
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfStr, Δp, ΔfNbr, Δu } from "./trax";

            @ΔD class Address {
                ΔΔstreet?: string = ""; @Δp(ΔfStr, 2) street?: string;
                ΔΔzip: number = 12345; @Δp(ΔfNbr) zip: number;
                ΔΔcountry; @Δp() country: any; ΔDefault(n) {switch (n) {case "street": return ""; case "zip": return 12345}; return Δu;};
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

    it("should support different symbols and generation prefixes", async function () {
        assert.equal(generate(`
            import { MyData } from "./foobar";

            @MyData class Foo {
                sth: string;
            }

            @MyData class Bar {
                theFoo: Foo = new Foo();
            }
        `, 'myFile.ts', { symbols: { Data: "MyData", ref: "myRef" }, libPrefix: "x" }), `
            import { xΔD, xΔfStr, xΔp, xΔf, xΔu } from "./foobar";

            @xΔD class Foo {
                ΔΔsth: string; @xΔp(xΔfStr) sth: string;
            }

            @xΔD class Bar {
                ΔΔtheFoo: Foo; @xΔp(xΔf(Foo)) theFoo: Foo = new Foo(); ΔDefault(n) {switch (n) {case "theFoo": return new Foo()}; return xΔu;};
            }
        `, "1");
    });

    it("should support ΔD as Data decorator", async function () {
        assert.equal(generate(`
            import { xΔD } from "./foobar";

            @xΔD class Foo {
                sth: string;
            }
        `, 'myFile.ts', { symbols: { Data: "xΔD" }, libPrefix: "x" }), `
            import { xΔD, xΔfStr, xΔp } from "./foobar";

            @xΔD class Foo {
                ΔΔsth: string; @xΔp(xΔfStr) sth: string;
            }
        `, "1");
    });

    it("should support custom validators", function () {
        let logs: any[] = [];

        function validate(m: DataMember) {
            logs.push([m.name, m.type ? m.type.kind : "", m.defaultValue ? m.defaultValue.text : ""]);
            return null;
        }

        generate(`
            import { Data } from "./trax";

            @Data class Foo {
                sth: string[];
            }

            @Data class Bar {
                theFoo: Foo = new Foo();
            }
        `, 'myFile.ts', { validator: validate });

        assert.deepEqual(logs, [
            ["sth", "array", ""],
            ["theFoo", "reference", "new Foo()"]
        ], "logs");

        const RX_LIST = /List$/;
        function listValidator(m: DataMember) {
            if (m && m.type && m.type.kind === "array") {
                if (!m.name.match(RX_LIST)) {
                    return "Array properties should use the List suffix, e.g. " + m.name + "List";
                }
            }
            return null;
        }

        let errMsg = "";
        try {
            generate(`
                import { Data } from "./trax";

                @Data class Foo {
                    sth: string[];
                }
            `, 'myFile.ts', { validator: listValidator, logErrors: false });
        } catch (ex) {
            errMsg = formatError(ex);
        }
        assert.equal(errMsg, `
            TRAX: Array properties should use the List suffix, e.g. sthList
            File: myFile.ts - Line 5 / Col 21
            Extract: >> sth: string[]; <<
        `, "validation error");

        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                optionList: string[];
            }
        `, 'myFile.ts', { validator: listValidator }), `
            import { ΔD, ΔfStr, Δlf, Δp } from "./trax";

            @ΔD class Foo {
                ΔΔoptionList: string[]; @Δp(Δlf(ΔfStr)) optionList: string[];
            }
        `, "1");

    });

    it("should accept methods if specified in options", async function () {
        assert.equal(generate(`
            import { MyData } from "./trax";

            @MyData class Address {
                streets: any[]
                bar;

                doSomething(x) {
                    this.bar = x;
                }
            }
        `, 'myFile.ts', { symbols: { Data: "MyData" }, acceptMethods: true }), `
            import { ΔD, Δlf, Δp } from "./trax";

            @ΔD class Address {
                ΔΔstreets: any[]; @Δp(Δlf()) streets: any[];
                ΔΔbar; @Δp() bar: any;

                doSomething(x) {
                    this.bar = x;
                }
            }
        `, "1");
    });

    it("should avoid changing the Data decorator if specified in options", async function () {
        assert.equal(generate(`
            import { MyData } from "./trax";

            @MyData class Address {
                streets: any[]
                bar;

                doSomething(x) {
                    this.bar = x;
                }
            }
        `, 'myFile.ts', { symbols: { Data: "MyData" }, acceptMethods: true, replaceDataDecorator: false, libPrefix: "x" }), `
            import { MyData, xΔlf, xΔp } from "./trax";

            @MyData class Address {
                ΔΔstreets: any[]; @xΔp(xΔlf()) streets: any[];
                ΔΔbar; @xΔp() bar: any;

                doSomething(x) {
                    this.bar = x;
                }
            }
        `, "1");
    });

    it("should support function properties", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                streets: any[]
                bar: Function;
                baz: () => void;
                foo: (x, y:string)=>number;
            }
        `, 'myFile.ts'), `
            import { ΔD, Δlf, Δp } from "./trax";

            @ΔD class Address {
                ΔΔstreets: any[]; @Δp(Δlf()) streets: any[];
                ΔΔbar: Function; @Δp() bar: any;
                ΔΔbaz: () => void; @Δp() baz: any;
                ΔΔfoo: (x, y:string)=>number; @Δp() foo: any;
            }
        `, "1");
    });

    it("should support optional interfaceTypes declaration", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Address {
                street: string | null;
                $content: IvContent;
            }
        `, 'myFile.ts', { interfaceTypes: ["IvContent"] }), `
            import { ΔD, ΔfStr, Δp } from "./trax";

            @ΔD class Address {
                ΔΔstreet: string | null; @Δp(ΔfStr, 1) street: string | null;
                ΔΔ$content: IvContent; @Δp() $content: any;
            }
        `, "1");
    });

    it("should support initialization with complex values", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                arr:string[] = ["abc"];
            }
        `, 'myFile.ts', { interfaceTypes: ["IvContent"] }), `
            import { ΔD, ΔfStr, Δlf, Δp, Δu } from "./trax";

            @ΔD class Foo {
                ΔΔarr:string[]; @Δp(Δlf(ΔfStr)) arr: string[] = ["abc"]; ΔDefault(n) {switch (n) {case "arr": return ["abc"]}; return Δu;};
            }
        `, "1");
    });

    it("should support initialization with null", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                bar: Bar | null = null;
            }
        `, 'myFile.ts', { interfaceTypes: ["IvContent"] }), `
            import { ΔD, Δf, Δp, Δu } from "./trax";

            @ΔD class Foo {
                ΔΔbar: Bar | null = null; @Δp(Δf(Bar), 1) bar: Bar | null; ΔDefault(n) {switch (n) {case "bar": return null}; return Δu;};
            }
        `, "1");
    });

    it("should support Dictionaries", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                persons: { [name: string]: Person };
                bar: {[name:string]: string};
                baz: {[name:string]: Address | null};
            }
        `, 'myFile.ts'), `
            import { ΔD, Δf, Δdf, Δp, ΔfStr } from "./trax";

            @ΔD class Foo {
                ΔΔpersons: { [name: string]: Person }; @Δp(Δdf(Δf(Person))) persons: { [name: string]: Person };
                ΔΔbar: {[name:string]: string}; @Δp(Δdf(ΔfStr)) bar: { [name: string]: string };
                ΔΔbaz: {[name:string]: Address | null}; @Δp(Δdf(Δf(Address))) baz: { [name: string]: Address | null };
            }
        `, "1");


        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                students: { [gender: string]: { [name: string]: Person } };
            }
        `, 'myFile.ts'), `
            import { ΔD, Δf, Δdf, Δp } from "./trax";

            @ΔD class Foo {
                ΔΔstudents: { [gender: string]: { [name: string]: Person } }; @Δp(Δdf(Δdf(Δf(Person)))) students: { [gender: string]: { [name: string]: Person } };
            }
        `, "2");
    });

    it("should support @ref properties", async function () {
        assert.equal(generate(`
            import { Data } from "./trax";

            @Data class Foo {
                @ref data: string;
                @ref person: NameHolder;
                @ref.depth(2) persons: SomeInterface[];
                @ref.depth(3) misc: SomeInterface[][];
                @ref.depth(2) dict: {[k:string]: SomeInterface[]};
            }
        `, 'myFile.ts'), `
            import { ΔD, ΔfRef, Δp, Δlf, Δdf } from "./trax";

            @ΔD class Foo {
                ΔΔdata: string; @Δp(ΔfRef) data: string;
                ΔΔperson: NameHolder; @Δp(ΔfRef) person: NameHolder;
                ΔΔpersons: SomeInterface[]; @Δp(Δlf(ΔfRef)) persons: SomeInterface[];
                ΔΔmisc: SomeInterface[][]; @Δp(Δlf(Δlf(ΔfRef))) misc: SomeInterface[][];
                ΔΔdict: {[k:string]: SomeInterface[]}; @Δp(Δdf(ΔfRef)) dict: { [k: string]: SomeInterface[] };
            }
        `, "1");
    });

    // todo support import Data from "./trax" -> default import ?;
});