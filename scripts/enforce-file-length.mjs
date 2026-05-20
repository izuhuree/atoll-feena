#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { extname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const MAX_LINES = Number(process.env.MAX_FILE_LINES || 500);

const CHECKED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.html',
  '.rules'
]);

const EXCLUDED_PREFIXES = ['node_modules/', 'dist/', '.git/', '.firebase/', 'public/'];
const EXCLUDED_FILES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']);

const trackedFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .map(file => file.trim())
  .filter(file => file && existsSync(file));

const shouldCheckFile = (file) => {
  if (EXCLUDED_FILES.has(file)) return false;
  if (EXCLUDED_PREFIXES.some(prefix => file.startsWith(prefix))) return false;
  return CHECKED_EXTENSIONS.has(extname(file));
};

const getLineCount = (file) => {
  const content = readFileSync(file, 'utf8');
  return content.split(/\r?\n/).length;
};

const violations = trackedFiles
  .filter(shouldCheckFile)
  .map(file => ({ file, lines: getLineCount(file) }))
  .filter(entry => entry.lines > MAX_LINES)
  .sort((a, b) => b.lines - a.lines);

if (violations.length > 0) {
  console.error(`\nFile length check failed. Maximum allowed lines per file: ${MAX_LINES}.\n`);
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.lines} lines`);
  }
  console.error('\nRefactor these files into smaller modules before continuing.\n');
  process.exit(1);
}

console.log(`File length check passed. All checked files are <= ${MAX_LINES} lines.`);
