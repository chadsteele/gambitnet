import { copyFile, readFile, writeFile } from 'node:fs/promises';

const extensionRoot = new URL('../apps/extension/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', extensionRoot), 'utf8'));
manifest.action.default_popup = 'src/popup/index.html';
manifest.options_page = 'src/settings/index.html';
manifest.background.service_worker = 'src/background/background.js';
manifest.content_scripts = manifest.content_scripts.map(script => ({ ...script, js: ['src/content/content.js'] }));
await copyFile(new URL('manifest.json', extensionRoot), new URL('dist/manifest.source.json', extensionRoot));
await writeFile(new URL('dist/manifest.json', extensionRoot), `${JSON.stringify(manifest, null, 2)}\n`);