import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, appendFileSync, statSync } from "node:fs";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
const root = resolve(process.argv[2] || ".");
const require = createRequire(join(root, "package.json"));
const ts = require("typescript");
async function logPath(file, method) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let initializer, argument;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "artifactDir")
      initializer = node.initializer.getText(source);
    if (ts.isCallExpression(node) && node.expression.getText(source) === method)
      argument = node.arguments[0].getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(argument, "Log sink remains covered: " + file);
  const declaration = initializer ? "const artifactDir = " + initializer + ";" : "";
  return vm.runInNewContext("(async () => {" + declaration + "return (" + argument + ");})()",
    { mkdtemp, mkdtempSync, tmpdir, join });
}
const cases = [
  ["scripts/check-chat-e2e.mjs", "writeFile", "portfolio-chat-e2e-"],
  ["scripts/repro-185.mjs", "appendFileSync", "portfolio-repro-"],
];
for (const [file, method, folderPrefix] of cases) {
  const first = await logPath(join(root, file), method);
  const second = await logPath(join(root, file), method);
  assert.notEqual(first, second, file + " uses a fresh directory each run");
  for (const output of [first, second]) {
    assert.ok(dirname(output).startsWith(join(tmpdir(), folderPrefix)), "Only test-created directories are removed");
    assert.equal(statSync(dirname(output)).mode & 0o777, 0o700, "Artifacts are private to the operator");
    await writeFile(output, "synthetic log");
    assert.equal(readFileSync(output, "utf8"), "synthetic log");
    await rm(dirname(output), { recursive: true });
  }
  console.log("PASS " + file + ": unique private artifact directories");
}
