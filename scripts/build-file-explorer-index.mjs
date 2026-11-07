import { readdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const explorerDirectory = resolve('FileExplorer');
const indexPath = resolve(explorerDirectory, 'file-index.json');

async function readDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const visibleEntries = entries
    .filter(entry => entry.name !== 'file-index.json' && !entry.name.endsWith(".css") && !entry.name.endsWith(".js") && !entry.name.startsWith('.'))
    .sort((left, right) => {
      if (left.isDirectory() !== right.isDirectory()) return left.isDirectory() ? -1 : 1;
      return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' });
    });

  return Promise.all(visibleEntries.map(async entry => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return { type: 'directory', name: entry.name, children: await readDirectory(entryPath) };
    }

    return {
      type: 'file',
      name: entry.name,
      path: relative(process.cwd(), entryPath).split(sep).join('/')
    };
  }));
}

const files = await readDirectory(explorerDirectory);
await writeFile(indexPath, `${JSON.stringify(files, null, 2)}\n`);
console.log(`Updated ${relative(process.cwd(), indexPath)} with ${files.length} root entries.`);
