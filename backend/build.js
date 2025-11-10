import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    'express',
    'pg',
    'passport',
    'passport-google-oauth20',
    'jsonwebtoken',
    'cookie-parser',
    'cors',
    'dotenv'
  ],
  sourcemap: true,
});

console.log('✓ Build complete');