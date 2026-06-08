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

test("filters channel videos by type and year, then sorts by heat", () => {
  const { getFilteredChannelVideos } = loadMockVideosModule();
  const videos = getFilteredChannelVideos("tv", {
    sort: "hot",
    type: "悬疑",
    year: "2026",
  });

  assert.ok(videos.length > 0);
  assert.equal(videos.every((video) => video.year === "2026"), true);
  assert.equal(
    videos.every((video) =>
      [
        video.title,
        video.subtitle,
        video.category,
        video.badge,
        video.progress,
        ...video.tags,
      ]
        .join(" ")
        .includes("悬疑"),
    ),
    true,
  );

  const heats = videos.map(heatValue);
  assert.deepEqual(
    heats,
    [...heats].sort((first, second) => second - first),
  );
});

test("keeps filtered channel results empty when no video matches", () => {
  const { getFilteredChannelVideos } = loadMockVideosModule();

  assert.deepEqual(
    getFilteredChannelVideos("tv", {
      type: "悬疑",
      year: "2024",
    }),
    [],
  );
});

test("filters search results by type and sorts by score", () => {
  const { searchVideosWithFilters } = loadMockVideosModule();
  const videos = searchVideosWithFilters("科幻", {
    sort: "score",
    type: "悬疑",
  });

  assert.ok(videos.length > 0);
  assert.equal(
    videos.every((video) =>
      [
        video.title,
        video.subtitle,
        video.category,
        video.badge,
        video.progress,
        ...video.tags,
      ]
        .join(" ")
        .includes("悬疑"),
    ),
    true,
  );

  const scores = videos.map((video) => Number(video.score));
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("sorts search results by heat", () => {
  const { searchVideosWithFilters } = loadMockVideosModule();
  const videos = searchVideosWithFilters("科幻", {
    sort: "hot",
  });
  const heats = videos.map(heatValue);

  assert.ok(videos.length > 0);
  assert.deepEqual(
    heats,
    [...heats].sort((first, second) => second - first),
  );
});
