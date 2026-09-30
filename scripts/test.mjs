import ts from 'typescript';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
await mkdir('.test-build', { recursive: true });
await writeFile('.test-build/package.json', JSON.stringify({ type: 'commonjs' }));
for (const directory of ['server', 'shared', 'tests']) {
  await mkdir('.test-build/' + directory, { recursive: true });
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.ts')) continue;
    const source = await readFile(directory + '/' + name, 'utf8');
    const result = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } });
    await writeFile('.test-build/' + directory + '/' + name.replace(/\.ts$/, '.js'), result.outputText);
  }
}
const files = (await readdir('tests')).filter(name => name.endsWith('.test.ts'));
const child = spawn(process.execPath, ['--test', ...files.map(name => '.test-build/tests/' + name.replace(/\.ts$/, '.js'))], { stdio: 'inherit' });
child.on('exit', code => { process.exitCode = code || 0; });
