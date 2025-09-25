const Module = require("module");
const originalLoad = Module._load;

const blockedNames = new Set(["child_process", "node:child_process"]);

Module._load = function (request, parent, isMain) {
  const normalized = String(request);

  // block direct requests for the child_process module
  if (
    blockedNames.has(normalized) ||
    normalized === "child_process" ||
    normalized.startsWith("child_process/")
  ) {
    const err = new Error(`Module "${request}" is blocked by sandbox-preload.`);
    err.code = "SANDBOX_BLOCKED";
    throw err;
  }

  return originalLoad.apply(this, arguments);
};

// Also try to block require.resolve('child_process') and createRequire-based loads
const Module_prototype_require = Module.prototype.require;
Module.prototype.require = function (name) {
  if (blockedNames.has(name) || String(name).startsWith("child_process")) {
    const err = new Error(`Module "${name}" is blocked by sandbox-preload.`);
    err.code = "SANDBOX_BLOCKED";
    throw err;
  }
  return Module_prototype_require.apply(this, arguments);
};

// Make it obvious in the child process logs that the preload is active
try {
  console.log("[sandbox-preload] sandbox active: child_process is blocked");
} catch (e) {}
