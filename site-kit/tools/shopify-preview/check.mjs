import { check } from "@shopify/theme-check-node";
import path from "node:path";
const root = path.resolve(process.env.THEME_DIR || path.join(path.dirname(new URL(import.meta.url).pathname), "../../examples/teyel/theme"));
const offenses = await check(root);
const sev = ["error", "warning", "info"];
const by = {};
for (const o of offenses) {
  const k = `${sev[o.severity] ?? o.severity} ${o.check}`;
  (by[k] ||= []).push(`${o.uri.replace("file://" + root + "/", "")}:${o.start.line + 1} ${o.message.slice(0, 150)}`);
}
for (const [k, v] of Object.entries(by)) {
  console.log(`\n## ${k} (${v.length})`);
  for (const l of v.slice(0, Number(process.argv[2] || 6))) console.log("  " + l);
}
console.log("\nTOTAL", offenses.length, "errors", offenses.filter((o) => o.severity === 0).length);
