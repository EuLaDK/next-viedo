import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadMockVideosModule() {
  const sourcePath = path.join(currentDir, "mock-videos.ts");
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

function heatValue(video) {
  return Number(video.heat.replace(/\D/g, ""));
}

test("ranks videos by heat", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("hot");
  const heats = videos.map(heatValue);

  assert.ok(videos.length > 0);
  assert.deepEqual(
    heats,
    [...heats].sort((first, second) => second - first),
  );
});

test("ranks videos by score", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("score");
  const scores = videos.map((video) => Number(video.score));

  assert.ok(videos.length > 0);
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});
