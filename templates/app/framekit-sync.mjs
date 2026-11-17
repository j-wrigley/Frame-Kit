// Keeps this app on the newest Frame Kit. Runs before `npm run dev`
// (a "predev" script), so a release reaches the app the next time it opens.
// Copied from Frame Kit's templates/app; the copy in each app is the same.
//
//   node scripts/framekit-sync.mjs           install a newer Frame Kit
//   node scripts/framekit-sync.mjs --notify  only say that one is out (apps
//                                            whose GitHub workflow commits it)
//
// An install is kept only if the app still typechecks: otherwise the old
// version goes back, package.json and the lockfile exactly as they were.
// No network, a slow registry or FRAMEKIT_SYNC=off: nothing happens and the
// app starts as usual. This never stops `npm run dev`.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const PACKAGE = "@presentstandards/framekit-ui";
const notifyOnly = process.argv.includes("--notify");
const say = (message) => console.log(`\x1b[2mFrame Kit:\x1b[0m ${message}`);

if (process.env.FRAMEKIT_SYNC === "off" || process.env.CI) process.exit(0);

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

const current = readJson(`node_modules/${PACKAGE}/package.json`)?.version;
if (!current) process.exit(0);

// The registry directly: `npm view` takes seconds to start.
let latest;
try {
  const response = await fetch(`https://registry.npmjs.org/${PACKAGE.replace("/", "%2f")}/latest`, {
    signal: AbortSignal.timeout(3000),
  });
  latest = response.ok ? (await response.json()).version : undefined;
} catch {
  process.exit(0);
}

const parts = (version) => version.split("-")[0].split(".").map(Number);
const isNewer = (a, b) => {
  const [x, y] = [parts(a), parts(b)];
  const i = [0, 1, 2].find((n) => x[n] !== y[n]);
  return i !== undefined && y[i] > x[i];
};
if (!latest || !isNewer(current, latest)) process.exit(0);

// A version this app turned down isn't tried again on every start.
const SKIP = "node_modules/.framekit-sync-skip";
let skipped = "";
try {
  skipped = readFileSync(SKIP, "utf8").trim();
} catch {}
if (skipped === latest) {
  say(`${latest} is out but didn't typecheck here; this copy stays on ${current}.`);
  process.exit(0);
}

if (notifyOnly) {
  say(`${latest} is out (this copy has ${current}). Pull from GitHub to get it.`);
  process.exit(0);
}

const npm = (args) => spawnSync("npm", args, { stdio: "inherit" }).status === 0;
const kept = { "package.json": readFileSync("package.json"), "package-lock.json": readFileSync("package-lock.json") };
const putBack = () => {
  npm(["install", `${PACKAGE}@${current}`, "--save-exact", "--no-audit", "--no-fund"]);
  for (const [file, bytes] of Object.entries(kept)) writeFileSync(file, bytes);
};

say(`updating ${current} → ${latest}`);
if (!npm(["install", `${PACKAGE}@${latest}`, "--save-exact", "--no-audit", "--no-fund"])) {
  putBack();
  say(`couldn't install ${latest}; staying on ${current}.`);
  process.exit(0);
}

const scripts = readJson("package.json")?.scripts ?? {};
if (scripts.typecheck) {
  say("checking the app still typechecks…");
  if (!npm(["run", "typecheck", "--silent"])) {
    putBack();
    writeFileSync(SKIP, latest);
    say(`\x1b[33m${latest} breaks this app's types, so it stays on ${current}. Update it by hand when ready.\x1b[0m`);
    process.exit(0);
  }
}
say(`now on ${latest}.`);
