import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

function git(...args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

let dirty;
let commit;
try {
  dirty = git('status', '--porcelain=v1', '--untracked-files=all');
  commit = git('rev-parse', 'HEAD');
} catch (error) {
  console.error('Build-ul trebuie rulat dintr-un repository Git cu cel puțin un commit.');
  process.exit(1);
}

if (dirty) {
  console.error('Build oprit: working tree-ul trebuie să fie curat. Commită mai întâi toate schimbările.');
  console.error(dirty);
  process.exit(1);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of ['index.html', 'styles.css', 'app.js']) {
  await cp(resolve(root, file), resolve(dist, file));
}

await writeFile(resolve(dist, '.nojekyll'), '');
await writeFile(
  resolve(dist, 'build-info.json'),
  `${JSON.stringify({ commit, builtAt: new Date().toISOString() }, null, 2)}\n`,
);

console.log(`Build creat în dist/ din commit ${commit.slice(0, 12)}.`);
