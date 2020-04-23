import typescript from "@rollup/plugin-typescript";
import resolve from '@rollup/plugin-node-resolve';
import trax from '../../rollup-plugin/index.js';
import { terser } from 'rollup-plugin-terser';

export default {
    input: `test/trax/testapp.ts`,
    output: {
        file: 'test/rollup/test.specs.js',
        format: 'cjs',
        sourcemap: false
    },
    external: [
        'assert'
    ],
    plugins: [
        resolve(),
        trax(),
        typescript({
            tsconfig: 'test/rollup/tsconfig.json'
        }),
        terser()
    ]
};
