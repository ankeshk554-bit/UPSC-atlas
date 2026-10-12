import { build as buildClient } from 'vite';
import { build as buildServer } from 'esbuild';

await buildClient();
await buildServer({
  entryPoints: ['server.ts'],
  outfile: 'dist/server/server.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
