import typescript from 'rollup-plugin-typescript2';

// plugin configuration
export default {
    input: 'src/trax/rollup/rollup-plugin-trax.ts',
    output: {
        file: 'bin/rollup-plugin-trax.js',
        format: 'es'
    },
    external: [
        'typescript',
        'rollup-pluginutils',
        'fs',
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
};