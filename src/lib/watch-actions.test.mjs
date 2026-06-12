import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadWatchActionsModule() {
  const sourcePath = path.join(currentDir, "watch-actions.ts");
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

test("creates video-level action key", () => {
  const { getWatchActionKey } = loadWatchActionsModule();

  assert.equal(getWatchActionKey("xinghe"), "watch-action:xinghe");
});

test("builds share path for current episode", () => {
  const { getWatchSharePath } = loadWatchActionsModule();

  assert.equal(
    getWatchSharePath({ episode: 1, totalEpisodes: 12, videoId: "xinghe" }),
    "/watch/xinghe",
  );
  assert.equal(
    getWatchSharePath({ episode: 3, totalEpisodes: 12, videoId: "xinghe" }),
    "/watch/xinghe?episode=3",
  );
  assert.equal(
    getWatchSharePath({ episode: 1, totalEpisodes: 1, videoId: "guitu" }),
    "/watch/guitu",
  );
});

test("formats like count after local toggle", () => {
  const { getDisplayLikeCount } = loadWatchActionsModule();

  assert.equal(getDisplayLikeCount(128000, false), "12.8万");
  assert.equal(getDisplayLikeCount(128000, true), "12.8万");
  assert.equal(getDisplayLikeCount(9999, true), "1万");
});

test("extracts cached video ids from action state", () => {
  const { getCachedVideoIds } = loadWatchActionsModule();

  assert.deepEqual(
    getCachedVideoIds({
      "other-prefix:xinghe": true,
      "watch-action:anye": false,
      "watch-action:guitu": true,
      "watch-action:xinghe": true,
    }),
    ["guitu", "xinghe"],
  );
});
