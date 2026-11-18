// Run offline with: node scripts/check-audience.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/audience.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const blocked = new Error("Storage unavailable");
for (const [search, saved, expected] of [
  ["", null, "plain"],
  ["", "tech", "tech"],
  ["", "plain", "plain"],
  ["", "invalid", "plain"],
  ["?view=invalid", "tech", "tech"],
  ["?view=tech", "plain", "tech"],
  ["?view=plain", "tech", "plain"],
  ["", blocked, "plain"],
]) {
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, URLSearchParams,
    window: { location: { search } },
    localStorage: { getItem() { if (saved === blocked) throw blocked; return saved; } },
    require(name) {
      assert.equal(name, "react");
      return { useSyncExternalStore(_subscribe, read, readServer) {
        assert.equal(readServer(), "plain", "Server snapshot defaults to Plain English");
        return read();
      } };
    },
  });
  assert.equal(exports.useAudience(), expected, `Mode for ${search || "(no query)"} with ${saved}`);
}
console.log("PASS: Plain English default, saved choices, URL precedence, and unavailable storage");
