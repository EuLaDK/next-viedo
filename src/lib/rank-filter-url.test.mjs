import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadRankFilterUrlModule() {
  const sourcePath = path.join(currentDir, "rank-filter-url.ts");
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

test("normalizes rank sort and channel values", () => {
  const { getRankChannel, getRankSort } = loadRankFilterUrlModule();

  assert.equal(getRankSort(["score", "hot"]), "score");
  assert.equal(getRankSort("unknown"), "hot");
  assert.equal(getRankChannel("movie"), "movie");
  assert.equal(getRankChannel("unknown"), "all");
});

test("builds compact rank filter href", () => {
  const { getRankFilterHref } = loadRankFilterUrlModule();

  assert.equal(
    getRankFilterHref({ sort: "hot", channel: "all" }, {}),
    "/rank",
  );
  assert.equal(
    getRankFilterHref(
      { sort: "score", channel: "movie" },
      { sort: "vip" },
    ),
    "/rank?sort=vip&channel=movie",
  );
  assert.equal(
    getRankFilterHref(
      { sort: "score", channel: "movie" },
      { sort: "hot", channel: "all" },
    ),
    "/rank",
  );
});
