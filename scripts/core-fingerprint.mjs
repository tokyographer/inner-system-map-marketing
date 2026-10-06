/**
 * Prints one sha256 over the core paths listed in CORE.md, so the upstream app
 * and the marketing repo can prove their cores are identical.
 * Run: npm run core:fingerprint            (one hash)
 *      npm run core:fingerprint -- --list  (one hash per file, for diffing)
 * Only git-tracked files count. Keep CORE_PATHS in sync with CORE.md.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const CORE_PATHS = [
  "CORE.md",
  "config/app.ts",
  "config/scoring.ts",
  "content/",
  "lib/scoring/",
  "lib/questionnaire/",
  "lib/pdf/",
  "lib/email/",
  "lib/validation/",
  "lib/db/",
  "components/results/sections.ts",
  "db/migrations/",
  "messages/",
  "tests/unit/scoring/",
  "tests/unit/content/",
  "tests/unit/pdf/",
  "tests/unit/email/",
  "tests/fixtures/",
];

const isCore = (f) =>
  !(f.startsWith("db/migrations/") && !/^db\/migrations\/0[^/]*\.sql$/.test(f)) &&
  !(f.startsWith("messages/") && !f.endsWith(".json"));

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  return value;
}

function coreContent(file) {
  const raw = readFileSync(file);
  if (!file.startsWith("messages/")) return raw;
  const messages = JSON.parse(raw.toString("utf8"));
  delete messages.marketing;
  return Buffer.from(JSON.stringify(sortKeys(messages)));
}

const files = execFileSync("git", ["ls-files", "-z", "--", ...CORE_PATHS], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter(isCore)
  .sort();

const total = createHash("sha256");
const lines = [];
for (const file of files) {
  const h = createHash("sha256").update(coreContent(file)).digest("hex");
  total.update(`${file}\0${h}\0`);
  lines.push(`${h}  ${file}`);
}

if (process.argv.includes("--list")) console.log(lines.join("\n"));
console.log(`core ${total.digest("hex")} (${files.length} files)`);
