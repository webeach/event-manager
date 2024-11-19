import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        dir: './lib/esm',
        format: 'es',
        preserveModules: true,
        sourcemap: true,
      },
      {
        dir: './lib/cjs',
        format: 'cjs',
        preserveModules: true,
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: './lib/types.d.ts',
        format: 'cjs',
      },
    ],
    plugins: [dts()],
  },
];

export default config;
