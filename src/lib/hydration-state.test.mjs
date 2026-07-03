import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(currentDir, "..");
const requireFromTest = createRequire(import.meta.url);

function loadModule(relativePath) {
  const moduleCache = new Map();

  function resolveRequest(request, parentPath) {
    if (request.startsWith("@/")) {
      return path.join(srcDir, request.slice(2));
    }
    if (request.startsWith(".")) {
      return path.resolve(path.dirname(parentPath), request);
    }
    return request;
  }

  function compileModule(sourcePath) {
    if (!sourcePath.startsWith(srcDir)) {
      return requireFromTest(sourcePath);
    }

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
      const resolvedRequest = resolveRequest(request, resolvedPath);

      if (resolvedRequest.startsWith(srcDir)) {
        return compileModule(resolvedRequest);
      }

      return defaultRequire(resolvedRequest);
    };
    moduleCache.set(resolvedPath, compiledModule);
    compiledModule._compile(outputText, resolvedPath);

    return compiledModule.exports;
  }

  return compileModule(path.join(currentDir, relativePath));
}

test("uses stable fallback before the browser has mounted", () => {
  const { getHydrationSafeValue } = loadModule("hydration-state.ts");

  assert.equal(getHydrationSafeValue(false, "persisted", "default"), "default");
});

test("uses persisted client value after the browser has mounted", () => {
  const { getHydrationSafeValue } = loadModule("hydration-state.ts");

  assert.equal(getHydrationSafeValue(true, "persisted", "default"), "persisted");
});
