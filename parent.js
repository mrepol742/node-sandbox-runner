#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const node = process.execPath;
const preload = path.join(__dirname, "sandbox-preload.js");
const childScript = path.join(__dirname, "child.js");

console.log("Parent: launching child with preload:", preload);

const child = spawn(node, ["--require", preload, childScript], {
  stdio: "inherit",
  env: {
    ...process.env,
    // optionally remove sensitive env vars here
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.log(`Child exited with signal ${signal}`);
  } else {
    console.log(`Child exited with code ${code}`);
  }
});

child.on("error", (err) => {
  console.error("Failed to spawn child:", err);
});
