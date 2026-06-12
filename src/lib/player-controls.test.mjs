import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadPlayerControlsModule() {
  const moduleCache = new Map();

  function compileModule(sourcePath) {
    const resolvedPath = sourcePath.endsWith(".ts")
      ? sourcePath
      : `${sourcePath}.ts`;

    if (moduleCache.has(resolvedPath)) {
      return moduleCache.get(resolvedPath).exports;
    }

    const source = fs.readFileSync(resolvedPath, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });
    const compiledModule = new Module(resolvedPath);
    const defaultRequire = compiledModule.require.bind(compiledModule);

    compiledModule.filename = resolvedPath;
    compiledModule.paths = Module._nodeModulePaths(path.dirname(resolvedPath));
    compiledModule.require = (request) => {
      if (request.startsWith(".")) {
        return compileModule(path.resolve(path.dirname(resolvedPath), request));
      }

      return defaultRequire(request);
    };
    moduleCache.set(resolvedPath, compiledModule);
    compiledModule._compile(outputText, resolvedPath);

    return compiledModule.exports;
  }

  return compileModule(path.join(currentDir, "player-controls.ts"));
}

test("builds next episode href when another episode exists", () => {
  const { getNextEpisodeHref } = loadPlayerControlsModule();

  assert.equal(getNextEpisodeHref("xinghe", 3, 12), "/watch/xinghe?episode=4");
});

test("keeps return path on next episode href", () => {
  const { getNextEpisodeHref } = loadPlayerControlsModule();

  assert.equal(
    getNextEpisodeHref("xinghe", 3, 12, "/channel/tv"),
    "/watch/xinghe?episode=4&from=%2Fchannel%2Ftv",
  );
});

test("does not build next episode href on final episode", () => {
  const { getNextEpisodeHref } = loadPlayerControlsModule();

  assert.equal(getNextEpisodeHref("xinghe", 12, 12), null);
});

test("provides stable playback rate options", () => {
  const { playbackRateOptions } = loadPlayerControlsModule();

  assert.deepEqual(
    playbackRateOptions.map((option) => option.value),
    [0.75, 1, 1.25, 1.5, 2],
  );
});

test("maps danmaku speed to animation duration", () => {
  const { getDanmakuDurationBySpeed } = loadPlayerControlsModule();

  assert.equal(getDanmakuDurationBySpeed("slow"), 16);
  assert.equal(getDanmakuDurationBySpeed("normal"), 12);
  assert.equal(getDanmakuDurationBySpeed("fast"), 8);
});

test("formats player time as minutes and seconds", () => {
  const { formatPlayerTime } = loadPlayerControlsModule();

  assert.equal(formatPlayerTime(0), "00:00");
  assert.equal(formatPlayerTime(65.8), "01:05");
});
