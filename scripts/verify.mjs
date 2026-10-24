import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = ['index.html', 'styles.css', 'app.js'];
const failures = [];
const contents = {};

for (const file of requiredFiles) {
  try {
    contents[file] = await readFile(resolve(root, file), 'utf8');
  } catch {
    failures.push(`Lipsește fișierul obligatoriu: ${file}`);
    contents[file] = '';
  }
}

for (const [file, content] of Object.entries(contents)) {
  if (content.trim().length < 100) failures.push(`${file} nu conține suficient conținut.`);
  if (/\b(?:TODO|FIXME|lorem ipsum|coming soon)\b/i.test(content)) {
    failures.push(`${file} conține text placeholder.`);
  }
}

const html = contents['index.html'];
for (const expected of [
  '<!doctype html',
  'styles.css',
  'app.js',
  'program',
  'pacien',
  'sedii',
  'SMS',
]) {
  if (!html.toLocaleLowerCase('ro-RO').includes(expected.toLocaleLowerCase('ro-RO'))) {
    failures.push(`index.html nu include reperul obligatoriu: ${expected}`);
  }
}

if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
  failures.push('index.html nu are meta viewport.');
}

if (!/aria-label|aria-labelledby/i.test(html)) {
  failures.push('index.html nu expune etichete accesibile pentru controale sau regiuni.');
}

if (/<script[^>]+src=["']https?:\/\//i.test(html) || /@import\s+url\(["']?https?:\/\//i.test(contents['styles.css'])) {
  failures.push('Prezentarea nu trebuie să depindă de biblioteci externe.');
}

try {
  execFileSync(process.execPath, ['--check', resolve(root, 'app.js')], { stdio: 'pipe' });
} catch {
  failures.push('app.js nu trece verificarea de sintaxă Node.js.');
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Verificare reușită: sursele sunt complete, autonome și JavaScript-ul este valid.');
