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
            import { ΔfStr, Δp, ΔfNbr, ΔfBool } from "./trax";

            @ΔD() class Address {
                ΔΔstreet: string; @Δp(ΔfStr) street: string;
                ΔΔzipCode: number; @Δp(ΔfNbr) zipCode: number;
                ΔΔvalid: boolean; @Δp(ΔfBool) valid: boolean;
            }
        `, "1");
    });

    // todo support import Data from "./trax" -> default import ?;
});