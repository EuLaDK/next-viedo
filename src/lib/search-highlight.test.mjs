import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadSearchHighlightModule() {
  const sourcePath = path.join(currentDir, "search-highlight.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const compiledModule = new Module(sourcePath);

  compiledModule.filename = sourcePath;
  compiledModule.paths = Module._nodeModulePaths(currentDir);
  compiledModule._compile(outputText, sourcePath);

  return compiledModule.exports;
}

test("splits text into highlighted search keyword segments", () => {
  const { getSearchHighlightSegments } = loadSearchHighlightModule();

  assert.deepEqual(getSearchHighlightSegments("星河回响 正在回响", "回响"), [
    { highlighted: false, text: "星河" },
    { highlighted: true, text: "回响" },
    { highlighted: false, text: " 正在" },
    { highlighted: true, text: "回响" },
  ]);
});

test("keeps original text when keyword is empty or missing", () => {
  const { getSearchHighlightSegments } = loadSearchHighlightModule();

  assert.deepEqual(getSearchHighlightSegments("星河回响", ""), [
    { highlighted: false, text: "星河回响" },
  ]);
  assert.deepEqual(getSearchHighlightSegments("星河回响", "电影"), [
    { highlighted: false, text: "星河回响" },
  ]);
});
