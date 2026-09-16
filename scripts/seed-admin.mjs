#!/usr/bin/env node
// Generates a random admin username + password, hashes the password with the
// exact PBKDF2 scheme used by worker/auth.ts, and inserts it into D1.
//
// Usage:
//   node scripts/seed-admin.mjs --local     (seeds your local dev D1 database)
//   node scripts/seed-admin.mjs --remote    (seeds the real, deployed D1 database)
//
// Safe to re-run: if an admin_users row already exists, it does nothing and
// tells you to delete the existing row first if you really want to reset it.

import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const DB_NAME = 'lahab-db';
const ITERATIONS = 100_000;
const mode = process.argv.includes('--remote') ? '--remote' : '--local';

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `pbkdf2$${ITERATIONS}$${toHex(salt.buffer)}$${toHex(derivedBits)}`;
}

// shell: true is required on Windows, where `npx` is actually `npx.cmd` and
// execFileSync can't find it without going through a shell.
//
// We always pass SQL via a temp --file instead of --command: with shell:true,
// a --command string containing spaces/parentheses/quotes gets re-split by
// the shell and breaks (this bit us with "SELECT COUNT(*)..." on both
// Windows cmd.exe and POSIX sh). A file path has none of those problems.
function runSqlFile(mode, sql) {
  const sqlFile = `.seed-admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sql`;
  writeFileSync(sqlFile, sql);
  try {
    return execFileSync('npx', ['wrangler', 'd1', 'execute', DB_NAME, mode, '--json', '--file', sqlFile], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });
  } finally {
    unlinkSync(sqlFile);
  }
}

async function main() {
  console.log(`Checking for an existing admin account (${mode})...`);
  let existingCount = '0';
  try {
    const out = runSqlFile(mode, 'SELECT COUNT(*) as c FROM admin_users;');
    const parsed = JSON.parse(out);
    existingCount = String(parsed?.[0]?.results?.[0]?.c ?? '0');
  } catch (err) {
    console.error('Could not query D1. Have you run migrations yet? (npm run db:migrate:' + mode.replace('--', '') + ')');
    console.error('Underlying error:', err.message || err);
    process.exit(1);
  }

  if (existingCount !== '0') {
    console.log('\nAn admin account already exists. Doing nothing.');
    console.log('To reset it, delete the row from admin_users and re-run this script:');
    console.log(`  npx wrangler d1 execute ${DB_NAME} ${mode} --command "DELETE FROM admin_users"\n`);
    return;
  }

  const username = `admin_${randomBytes(3).toString('hex')}`;
  const password = randomBytes(18).toString('base64url');
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const escapedHash = passwordHash.replace(/'/g, "''");

  try {
    runSqlFile(
      mode,
      `INSERT INTO admin_users (username, passwordHash, createdAt) VALUES ('${username}', '${escapedHash}', '${now}');`
    );
  } catch (err) {
    console.error('Failed to insert the admin account.');
    console.error('Underlying error:', err.message || err);
    process.exit(1);
  }

  console.log('\n========================================================');
  console.log(`  LAHAB ADMIN PANEL — FIRST-TIME CREDENTIALS (${mode}, shown once)`);
  console.log('  Username:', username);
  console.log('  Password:', password);
  console.log('  Save these now — they will not be shown again.');
  console.log('========================================================\n');
}

main();

