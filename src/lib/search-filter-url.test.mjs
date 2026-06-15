import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadSearchFilterUrlModule() {
  const sourcePath = path.join(currentDir, "search-filter-url.ts");
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

test("normalizes search query values and sort values", () => {
  const { getSearchParamValue, getSearchSort } = loadSearchFilterUrlModule();

  assert.equal(getSearchParamValue(["科幻", "电影"]), "科幻");
  assert.equal(getSearchParamValue(undefined), "");
  assert.equal(getSearchSort("hot"), "hot");
  assert.equal(getSearchSort("unknown"), "relevance");
});

test("builds search filter href with compact query params", () => {
  const { getSearchFilterHref } = loadSearchFilterUrlModule();

  assert.equal(
    getSearchFilterHref(
      " 科幻 ",
      { sort: "hot", type: "悬疑" },
      { sort: "score" },
    ),
    "/search?q=%E7%A7%91%E5%B9%BB&type=%E6%82%AC%E7%96%91&sort=score",
  );
  assert.equal(
    getSearchFilterHref("科幻", { sort: "score", type: "悬疑" }, {
      sort: "relevance",
      type: undefined,
    }),
    "/search?q=%E7%A7%91%E5%B9%BB",
  );
});

test("builds search href with channel year and quality filters", () => {
  const { getSearchFilterHref } = loadSearchFilterUrlModule();

  assert.equal(
    getSearchFilterHref(
      "科幻",
      {
        channel: "tv",
        quality: "4K",
        sort: "hot",
        type: "悬疑",
        year: "2026",
      },
      {
        channel: "movie",
        quality: "4K HDR",
      },
    ),
    "/search?q=%E7%A7%91%E5%B9%BB&type=%E6%82%AC%E7%96%91&channel=movie&year=2026&quality=4K+HDR&sort=hot",
  );
});

test("builds compact search clear href", () => {
  const { getSearchClearHref } = loadSearchFilterUrlModule();

  assert.equal(getSearchClearHref(), "/search");
});
