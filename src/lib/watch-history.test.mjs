import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadWatchHistoryModule() {
  const sourcePath = path.join(currentDir, "watch-history.ts");
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

test("builds watch history href with optional episode", () => {
  const { getWatchHistoryHref } = loadWatchHistoryModule();

  assert.equal(getWatchHistoryHref({ id: "xinghe" }), "/watch/xinghe");
  assert.equal(
    getWatchHistoryHref({ id: "xinghe", episode: 3 }),
    "/watch/xinghe?episode=3",
  );
});

test("builds watch history href with resume time", () => {
  const { getWatchHistoryHref } = loadWatchHistoryModule();

  assert.equal(
    getWatchHistoryHref({ id: "xinghe", episode: 3, watchSeconds: 127.8 }),
    "/watch/xinghe?episode=3&t=127",
  );
  assert.equal(
    getWatchHistoryHref({ id: "xinghe", watchSeconds: 12 }),
    "/watch/xinghe?t=12",
  );
  assert.equal(
    getWatchHistoryHref({ id: "xinghe", watchSeconds: 0 }),
    "/watch/xinghe",
  );
});

test("formats watch progress label from saved playback time", () => {
  const { formatWatchProgressLabel } = loadWatchHistoryModule();

  assert.equal(
    formatWatchProgressLabel({
      progress: "Episode 3",
      watchSeconds: 620,
      durationSeconds: 2400,
    }),
    "Episode 3 · 看到 26%",
  );
  assert.equal(
    formatWatchProgressLabel({
      progress: "Episode 3",
      watchSeconds: 0,
      durationSeconds: 2400,
    }),
    "Episode 3",
  );
  assert.equal(
    formatWatchProgressLabel({
      progress: "Episode 3",
      watchSeconds: 300,
      durationSeconds: 0,
    }),
    "Episode 3",
  );
});

test("sorts watch history by latest watched time without mutating input", () => {
  const { sortWatchHistoryItems } = loadWatchHistoryModule();
  const items = [
    { id: "first", watchedAt: 10 },
    { id: "second", watchedAt: 30 },
    { id: "third", watchedAt: 20 },
  ];

  const sortedItems = sortWatchHistoryItems(items);

  assert.deepEqual(
    sortedItems.map((item) => item.id),
    ["second", "third", "first"],
  );
  assert.deepEqual(
    items.map((item) => item.id),
    ["first", "second", "third"],
  );
});

test("matches watch history items by video id and normalized episode", () => {
  const { isSameWatchHistoryItem } = loadWatchHistoryModule();

  assert.equal(
    isSameWatchHistoryItem({ id: "xinghe" }, { id: "xinghe", episode: 1 }),
    true,
  );
  assert.equal(
    isSameWatchHistoryItem(
      { id: "xinghe", episode: 2 },
      { id: "xinghe", episode: 3 },
    ),
    false,
  );
  assert.equal(
    isSameWatchHistoryItem({ id: "xinghe" }, { id: "anye" }),
    false,
  );
});
