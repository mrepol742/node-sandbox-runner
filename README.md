# node-sandbox-runner

A simple CLI tool to run Node.js programs inside a restricted environment.
It starts a child Node process with a preload that blocks access to the `child_process` module (so the child cannot spawn subprocesses).

⚠️ **Note:** This is a *lightweight sandbox*. It prevents obvious `require('child_process')` calls, but it is **not a security boundary**. For strong isolation, use containers, VMs, or OS-level sandboxing.

---

## Features

- Spawns a child Node process with `--require sandbox-preload.js`.
- Blocks `require('child_process')` and `require('node:child_process')`.
- Works with both CommonJS and dynamic `import()`.
- Easy CLI usage after global install.

---

## Installation

Clone the repo or download the source, then run:

```sh
npm install -g .
```

or just install it from npm

```sh
npm install node-sandbox-runner -g
```

## Run

```sh
node-sandbox-runner ./your-node-program.js
# i know its too longgggg
# thats why i made a shortcut instead
nsr ./your-node-program.js
```
