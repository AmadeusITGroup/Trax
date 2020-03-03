import typescript from 'rollup-plugin-typescript2';
import trax from '../../../bin/rollup-plugin-trax';

export default {
    input: `src/test/trax/testapp.ts`,
    output: {
        file: 'dist/rollup.test.specs.js',
        format: 'cjs',
        sourcemap: false
    },
    external: [
        'assert'
    ],
    plugins: [
        trax(),
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
};
