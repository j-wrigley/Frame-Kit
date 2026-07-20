// Ships stylesheet + font sources alongside the JS bundle so consumers can
// import '@presentstandards/framekit-ui/styles.css' (everything), tokens.css, or fonts.css alone.
// Font files keep their relative ../fonts/ URLs in both src and dist layouts.
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

await cp(here('../src/styles'), here('../dist/styles'), { recursive: true });
await cp(here('../src/fonts'), here('../dist/fonts'), { recursive: true });
console.log('styles → dist/styles, fonts → dist/fonts');
