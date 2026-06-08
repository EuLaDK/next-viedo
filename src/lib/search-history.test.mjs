import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadSearchHistoryModule() {
  const sourcePath = path.join(currentDir, "search-history.ts");
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

test("adds search query to the front and removes duplicates", () => {
  const { addSearchHistoryQuery } = loadSearchHistoryModule();

  assert.deepEqual(
    addSearchHistoryQuery(["电影", "科幻"], " 科幻 "),
    ["科幻", "电影"],
  );
});

test("ignores empty search query", () => {
  const { addSearchHistoryQuery } = loadSearchHistoryModule();

  assert.deepEqual(addSearchHistoryQuery(["电影"], "   "), ["电影"]);
});

test("limits search history count", () => {
  const { addSearchHistoryQuery } = loadSearchHistoryModule();
  const items = ["1", "2", "3"];

  assert.deepEqual(addSearchHistoryQuery(items, "4", 3), ["4", "1", "2"]);
});
