import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadVideoCardUrlModule() {
  const sourcePath = path.join(currentDir, "video-card-url.ts");
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

test("builds watch href from video id", () => {
  const { getVideoWatchHref } = loadVideoCardUrlModule();

  assert.equal(getVideoWatchHref("xinghe"), "/watch/xinghe");
});

test("builds watch href with episode and return path", () => {
  const { getVideoWatchHref } = loadVideoCardUrlModule();

  assert.equal(
    getVideoWatchHref("xinghe", {
      episode: 3,
      from: "/channel/tv?sort=hot",
    }),
    "/watch/xinghe?episode=3&from=%2Fchannel%2Ftv%3Fsort%3Dhot",
  );
});

test("normalizes unsafe watch return paths", () => {
  const { getSafeWatchReturnHref } = loadVideoCardUrlModule();

  assert.equal(getSafeWatchReturnHref("/search?q=科幻"), "/search?q=科幻");
  assert.equal(getSafeWatchReturnHref("https://example.com"), "/");
  assert.equal(getSafeWatchReturnHref("//example.com"), "/");
  assert.equal(getSafeWatchReturnHref("/watch/xinghe?episode=2"), "/");
});
