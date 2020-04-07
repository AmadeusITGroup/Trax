import fs from "fs";
import typescript from "@rollup/plugin-typescript";

const ts_plugin = typescript({
    tsconfig: "src/tsconfig.json",
});

// Compiler typings file
fs.mkdirSync('compiler', { recursive: true });
fs.writeFileSync('compiler/index.d.ts', 'export * from "../typings/compiler";');
fs.writeFileSync('compiler/package.json', `{
    "main": "index.js",
    "types": "index.d.ts"
}`);

// Rollup plugin local package.json
fs.mkdirSync('rollup-plugin', { recursive: true });
fs.writeFileSync('rollup-plugin/package.json', `{
    "main": "index.js"
}`);

// Webpack loader local package.json
fs.mkdirSync('webpack-loader', { recursive: true });
fs.writeFileSync('webpack-loader/package.json', `{
    "main": "index.js"
}`);

export default [
    /* Runtime */
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'runtime/index.mjs',
                format: 'esm',
                sourcemap: true
            },
            {
                file: 'runtime/index.js',
                format: 'cjs',
                sourcemap: true
            },
        ],
        plugins: [ ts_plugin ]
    }, 
    /* Compiler*/
    {
        input: 'src/compiler/index.ts',
        output: {
            file: 'compiler/index.js',
            format: 'cjs',
            sourcemap: true
        },
        external: ['typescript'],
        plugins: [ ts_plugin ]
    },
    /* Rollup plugin */
    {
        input: 'src/rollup/rollup-plugin-trax.ts',
        output: {
            file: 'rollup-plugin/index.js',
            format: 'es'
        },
        external: [
            'typescript',
            'rollup-pluginutils',
            'fs',
        ],
        plugins: [ts_plugin]
    },
    /* Webpack loader */
    {
        input: 'src/webpack/loader.ts',
        output: {
            file: 'webpack-loader/index.js',
            format: 'cjs'
        },
        external: [
            'typescript',
        ],
        plugins: [ts_plugin]
    }
]