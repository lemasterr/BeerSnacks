// Usage: node remove.mjs <input.png|jpg> <output.png>  [more pairs...]
// Removes background with @imgly/background-removal-node (runs locally, ISNet model).
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const [input, output] = [args[i], args[i + 1]];
  try {
    const blob = await removeBackground(pathToFileURL(input).href, { model: 'medium', output: { format: 'image/png' } });
    await writeFile(output, Buffer.from(await blob.arrayBuffer()));
    console.log('ok', output);
  } catch (e) {
    console.log('FAIL', input, e.message);
  }
}
