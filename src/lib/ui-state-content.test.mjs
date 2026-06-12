import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadUiStateContentModule() {
  const sourcePath = path.join(currentDir, "ui-state-content.ts");
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

test("returns stable copy for known ui state preset", () => {
  const { getUiStateContent } = loadUiStateContentModule();

  assert.deepEqual(getUiStateContent("search-empty"), {
    title: "没有找到相关内容",
    description: "换个关键词试试，比如“科幻”“电影”“纪录片”。",
  });
});

test("falls back to default empty copy for unknown preset", () => {
  const { getUiStateContent } = loadUiStateContentModule();

  assert.deepEqual(getUiStateContent("unknown-empty-state"), {
    title: "暂无内容",
    description: "稍后再来看看，或返回首页发现更多内容。",
  });
});

test("keeps loading and error presets available for future async pages", () => {
  const { getUiStateContent } = loadUiStateContentModule();

  assert.equal(getUiStateContent("loading").title, "内容加载中");
  assert.equal(getUiStateContent("error").title, "内容暂时不可用");
});
