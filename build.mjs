/**
 * Build webflow-utils v2
 *
 *   dist/wu.js                     loader ESM (une seule balise, modules via attributs)
 *   dist/chunks/*.js               un chunk par module + core partagé (chargés à la demande)
 *   dist/standalone/<cat>/<m>.js   un script classique par module, comme en v1
 *   dist/snippets/…                snippets HTML à coller inline (head de page-transition)
 *
 *   node build.mjs            build
 *   node build.mjs --watch    rebuild à chaque modification
 */
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const watch = process.argv.includes('--watch');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const banner = { js: `/*! webflow-utils v${pkg.version} | MIT | github.com/Vaaaaal/webflow-utils-v2 */` };

const MODULES = fs
  .readdirSync('src/modules', { recursive: true })
  .filter(f => f.endsWith('.js'))
  .map(f => f.split(path.sep).join('/').replace(/\.js$/, ''));

fs.rmSync('dist', { recursive: true, force: true });

const common = {
  bundle: true,
  minify: true,
  target: ['es2020'],
  banner,
  legalComments: 'none',
  logLevel: 'info'
};

const loader = {
  ...common,
  entryPoints: { wu: 'src/wu.js' },
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]'
};

const standalone = {
  ...common,
  entryPoints: MODULES.map(m => ({ in: `wu-standalone:${m}`, out: `standalone/${m}` })),
  outdir: 'dist',
  format: 'iife',
  plugins: [
    {
      // Une entrée virtuelle par module : import + boot, comme un script v1.
      name: 'wu-standalone',
      setup(build) {
        build.onResolve({ filter: /^wu-standalone:/ }, args => ({
          path: args.path.slice('wu-standalone:'.length),
          namespace: 'wu-standalone'
        }));
        build.onLoad({ filter: /.*/, namespace: 'wu-standalone' }, args => ({
          contents: `import m from './modules/${args.path}.js';\nimport { boot } from './core/boot.js';\nboot(m);\n`,
          resolveDir: path.resolve('src')
        }));
      }
    }
  ]
};

function copySnippets() {
  fs.cpSync('snippets', 'dist/snippets', { recursive: true });
}

if (watch) {
  const ctxs = await Promise.all([esbuild.context(loader), esbuild.context(standalone)]);
  copySnippets();
  await Promise.all(ctxs.map(c => c.watch()));
  console.log('watching…');
} else {
  await Promise.all([esbuild.build(loader), esbuild.build(standalone)]);
  copySnippets();
}
