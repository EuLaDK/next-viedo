import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadSiteHeaderLinksModule() {
  const sourcePath = path.join(currentDir, "site-header-links.ts");
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

test("creates header nav links and appends rank entry", () => {
  const { createHeaderNavItems } = loadSiteHeaderLinksModule();
  const items = createHeaderNavItems([
    { slug: "featured", label: "精选" },
    { slug: "movie", label: "电影" },
  ]);

  assert.deepEqual(items, [
    { label: "精选", href: "/" },
    { label: "电影", href: "/channel/movie" },
    { label: "排行榜", href: "/rank" },
  ]);
});

test("provides user dropdown links for profile workflows", () => {
  const { headerUserMenuItems } = loadSiteHeaderLinksModule();

  assert.deepEqual(
    headerUserMenuItems.map((item) => item.href),
    [
      "/profile",
      "/profile/history",
      "/profile/favorites",
      "/profile/cache",
      "/profile/vip",
    ],
  );
});
