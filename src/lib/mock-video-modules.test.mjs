import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const moduleCache = new Map();

// 加载 TypeScript 模块；fileName 为 src/lib 下的相对文件名，共享缓存用于模拟 Node require 行为。
function loadTypescriptModule(fileName) {
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

  return compileModule(path.join(currentDir, fileName));
}

test("splits mock video data into focused modules while preserving barrel exports", () => {
  const dataModule = loadTypescriptModule("video-data.ts");
  const channelModule = loadTypescriptModule("channel-data.ts");
  const queryModule = loadTypescriptModule("video-queries.ts");
  const barrelModule = loadTypescriptModule("mock-videos.ts");

  assert.equal(dataModule.videoLibrary.length > 0, true);
  assert.equal(channelModule.channelItems.length > 0, true);
  assert.equal(queryModule.getVideoById("xinghe").id, "xinghe");
  assert.equal(barrelModule.videoLibrary, dataModule.videoLibrary);
  assert.equal(barrelModule.channelItems, channelModule.channelItems);
  assert.equal(
    barrelModule.getVideoById("xinghe"),
    queryModule.getVideoById("xinghe"),
  );
});
