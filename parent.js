#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const node = process.execPath;
const preload = path.join(__dirname, 'sandbox-preload.js');

function printUsageAndExit() {
  console.error('Usage: node parent.js [childScript] [childArgs...]');
  console.error('If childScript is omitted, ./child.js (next to parent.js) is used.');
  process.exit(1);
}

const rawArgs = process.argv.slice(2);

// Support an explicit "--" separator (optional) to pass args to child
// e.g. parent.js /path/to/script.js -- foo bar
let childArgIndex = 0;
let childSpecified = false;
let childScriptCandidate;
if (rawArgs.length === 0) {
  // no args -> default child.js next to this file
  childScriptCandidate = path.join(__dirname, 'child.js');
} else {
  // If first arg is "--", skip it and use default child.js
  if (rawArgs[0] === '--') {
    childScriptCandidate = path.join(__dirname, 'child.js');
    childArgIndex = 1;
  } else {
    childScriptCandidate = rawArgs[0];
    childSpecified = true;
    childArgIndex = 1;
  }
}

// Build the resolved child script path or module
let childScriptPath = childScriptCandidate;
let resolvedByRequireResolve = false;

function tryResolveScript(candidate) {
  // If candidate looks like a path (starts with ./, ../, /), resolve to absolute path
  if (candidate.startsWith('./') || candidate.startsWith('../') || path.isAbsolute(candidate)) {
    return path.resolve(candidate);
  }
  // Otherwise, try to resolve as a local file relative to cwd first
  const localTry = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(localTry)) return localTry;
  // Next try to resolve as a module using require.resolve (may throw)
  try {
    const resolved = require.resolve(candidate, { paths: [process.cwd(), __dirname] });
    resolvedByRequireResolve = true;
    return resolved;
  } catch (e) {
    // fall through; will try other heuristics next
  }
  // As a last attempt, if a plain filename was provided, try appending .js
  if (!candidate.endsWith('.js')) {
    const withJs = `${candidate}.js`;
    const localJs = path.resolve(process.cwd(), withJs);
    if (fs.existsSync(localJs)) return localJs;
    // try next to this file
    const nextToThis = path.resolve(__dirname, withJs);
    if (fs.existsSync(nextToThis)) return nextToThis;
  }
  // Not found
  return null;
}

const resolved = tryResolveScript(childScriptPath);
if (!resolved) {
  console.error(`Child script "${childScriptPath}" not found or not resolvable.`);
  printUsageAndExit();
}
childScriptPath = resolved;

// Ensure preload exists
if (!fs.existsSync(preload)) {
  console.error(`Preload file not found at ${preload}. Make sure sandbox-preload.js exists next to parent.js`);
  process.exit(1);
}

const childArgs = rawArgs.slice(childArgIndex);

// Build spawn arguments: --require preload <script> [args...]
const spawnArgs = ['--require', preload, childScriptPath, ...childArgs];

console.log(`Parent: launching child -> ${childScriptPath}`);
console.log(`Parent: node exec: ${node}`);
console.log(`Parent: spawn args: ${spawnArgs.join(' ')}`);

const child = spawn(node, spawnArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
  }
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Child exited with signal ${signal}`);
    process.exit(1);
  } else {
    console.log(`Child exited with code ${code}`);
    process.exit(code);
  }
});

child.on('error', err => {
  console.error('Failed to spawn child:', err);
  process.exit(1);
});
