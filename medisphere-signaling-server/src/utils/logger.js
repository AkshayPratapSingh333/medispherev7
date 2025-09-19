const level = process.env.LOG_LEVEL || "info";

function info(...args) {
  if (["info", "debug"].includes(level)) console.log("[info]", ...args);
}
function debug(...args) {
  if (level === "debug") console.log("[debug]", ...args);
}
function warn(...args) {
  console.warn("[warn]", ...args);
}
function error(...args) {
  console.error("[error]", ...args);
}

module.exports = { info, debug, warn, error };
