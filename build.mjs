import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
await cp(resolve(root, 'site'), resolve(root, 'dist'), { recursive: true });
console.log('Static website built to dist/');
