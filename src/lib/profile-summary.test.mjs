import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadProfileSummaryModule() {
  const sourcePath = path.join(currentDir, "profile-summary.ts");
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

test("creates profile summary cards with counts and stable links", () => {
  const { createProfileSummaryCards } = loadProfileSummaryModule();
  const cards = createProfileSummaryCards({
    cacheCount: 2,
    favoriteCount: 3,
    historyCount: 12,
  });

  assert.deepEqual(
    cards.map((card) => card.href),
    ["/profile/history", "/profile/favorites", "/profile/cache", "/profile/vip"],
  );
  assert.deepEqual(
    cards.map((card) => card.value),
    ["12", "3", "2", "未开通"],
  );
  assert.deepEqual(
    cards.map((card) => card.label),
    ["观看历史", "追剧收藏", "离线缓存", "VIP会员"],
  );
});
