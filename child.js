console.log('Child: starting. trying require("child_process")...');

try {
  const cp = require('child_process');
  console.log('Child: unexpectedly acquired child_process!', !!cp);
} catch (err) {
  console.error('Child: require("child_process") blocked:', err && err.message);
}

(async () => {
  // Try dynamic import (ESM-style). It may be handled differently; show attempt.
  try {
    const imported = await import('child_process');
    console.log('Child: dynamic import succeeded (unexpected):', imported);
  } catch (err) {
    console.error('Child: dynamic import blocked or failed as expected:', err && err.message);
  }

  // Try spawning via shell command using native bindings as a last resort;
  // this should fail unless child manages to load native code to spawn processes.
  try {
    // Attempt to use exec via require('node:child_process') path too
    const cp2 = require('node:child_process');
    console.log('Child: require("node:child_process") succeeded (unexpected):', !!cp2);
  } catch (err) {
    console.error('Child: require("node:child_process") blocked as expected:', err && err.message);
  }

  console.log('Child: demo finished.');
  process.exit(0);
})();
