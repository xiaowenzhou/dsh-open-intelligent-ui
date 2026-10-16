import { build } from 'esbuild';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const bundleResults = [];
await mkdir('dist', { recursive: true });
const shared = { bundle: true, target: 'es2022', jsx: 'automatic', legalComments: 'eof', logLevel: 'info', metafile: true, define: { 'process.env.NODE_ENV': '"production"' } };
// React belongs to DSH's module table. Never bundle a second copy into the page.
bundleResults.push(await build({ ...shared, entryPoints: ['src/client.jsx'], outfile: 'dist/client.js', platform: 'browser', format: 'cjs', external: ['react', 'react/*', 'react-dom', 'react-dom/*'], minify: true, banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(manifest.name)}, factory: (require) => { const module = { exports: {} }; const exports = module.exports;` }, footer: { js: 'return module.exports; } });' } }));
bundleResults.push(await build({ ...shared, entryPoints: ['src/index.js'], outfile: 'dist/index.js', platform: 'node', format: 'esm', external: ['react', 'react/*'], minify: true }));
bundleResults.push(await build({ ...shared, entryPoints: ['src/library.jsx'], outfile: 'dist/library.js', platform: 'node', format: 'esm', external: ['react', 'react/*'], minify: true }));
const { library } = await import('../dist/library.js?build=' + Date.now());
const { examples } = await import('../src/examples.js');
let guide = library.prompt({ bindings: true, toolCalls: false, builtinFunctions: false, examples: examples.slice(0, 2).map(e => e.program), additionalRules: ['Use only this library. No Query, Mutation, Each, Range, Run, OpenUrl, HTML or JavaScript.', 'All interactive values must bind to $variables with scalar literal defaults; displayed totals and charts derive from ordinary declarations. No dead controls. @Set only accepts a scalar literal value. Do not use reserved object keys k, type, typeName, __reactive, steps or prototype keys; use Chart(data) point labels/values, not raw runtime objects.', 'Use @Set and @Reset for local changes. Use @ToAssistant only for explicit follow-up requests.', 'Define root = Dashboard(...), use plain OpenUI Lang (no Markdown fences). Keep below 150 statements and 64000 characters.', 'Use the user language. Label fictional/example data. Do not fabricate live data, links, images, prices or bookings.'] });
// The SDK's stock prompt advertises OpenUrl and insists on source-only chat output;
// neither belongs to our tool-mediated subset. Remove these contradictory examples.
guide = guide.replace(/^You are an AI assistant[^\n]*\n/, 'Use the following OpenUI reference for the program argument of render_intelligent_ui. Respond through that tool, not with UI source in chat.\n')
  .replace(/, @OpenUrl/g, '')
  .replace(/Put several steps in Action\(\[\.\.\.\]\), e\.g\.[^\n]*/, 'Put several supported steps in Action([...]), e.g. Button("Reset", Action([@Reset($income), @Reset($housing)])).')
  .replace(/^- @OpenUrl[^\n]*\n/gm, '')
  .replace(/Example — simple nav:\n```[\s\S]*?```\n/, '')
  .replace('data[index]', 'data[0] (only literal safe keys or numeric indices)')
  .replace('Undeclared $variables are auto-created with null default.', 'Declare each state variable with a scalar literal default.');
await writeFile('dist/guide.txt', guide);
// Include every dependency that contributes bytes, not just direct SDK dependencies.
const packageDirs = new Set();
for (const result of bundleResults) {
  for (const output of Object.values(result.metafile.outputs)) {
    for (const [input, contribution] of Object.entries(output.inputs)) {
      if (!contribution.bytesInOutput || !input.includes('node_modules/')) continue;
      let directory = path.dirname(path.resolve(input));
      while (directory !== path.dirname(directory)) {
        try {
          const info = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
          if (info.name && info.version) { packageDirs.add(directory); break; }
          directory = path.dirname(directory);
        } catch (error) { if (error.code !== 'ENOENT') throw error; directory = path.dirname(directory); }
      }
    }
  }
}
let notices = 'Bundled third-party dependencies; see each upstream package for complete licensing.\n';
for (const packageDir of [...packageDirs].sort()) {
  const info = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'));
  const license = (await readdir(packageDir)).find(file => /^licen[cs]e(?:\.|$)/i.test(file));
  if (!license) throw new Error(`Missing license file for bundled package ${info.name}.`);
  notices += `\n--- ${info.name}@${info.version} ---\n${await readFile(path.join(packageDir, license), 'utf8')}\n`;
}
await writeFile('dist/THIRD-PARTY-NOTICES.txt', notices);
console.log(`Guide: ${guide.length} characters (loaded on demand, not injected into every turn).`);
