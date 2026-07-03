import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(currentDir, "../..");
const requireFromTest = createRequire(import.meta.url);

function loadDropdownMenuModule() {
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

    const candidates = sourcePath.endsWith(".ts") || sourcePath.endsWith(".tsx")
      ? [sourcePath]
      : [`${sourcePath}.tsx`, `${sourcePath}.ts`];
    const resolvedPath = candidates.find((candidate) =>
      fs.existsSync(candidate),
    );

    if (!resolvedPath) {
      return requireFromTest(sourcePath);
    }

    if (moduleCache.has(resolvedPath)) {
      return moduleCache.get(resolvedPath).exports;
    }

    const source = fs.readFileSync(resolvedPath, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
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

  return compileModule(path.join(currentDir, "dropdown-menu.tsx"));
}

test("dropdown menu defaults to non-modal to avoid scroll lock gutters", () => {
  const { DropdownMenu } = loadDropdownMenuModule();
  const element = DropdownMenu({ children: "menu" });

  assert.equal(element.props.modal, false);
});

test("dropdown menu keeps explicit modal override", () => {
  const { DropdownMenu } = loadDropdownMenuModule();
  const element = DropdownMenu({ children: "menu", modal: true });

  assert.equal(element.props.modal, true);
});
