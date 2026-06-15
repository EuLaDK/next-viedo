import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadMockVideosModule() {
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

  return compileModule(path.join(currentDir, "mock-videos.ts"));
}

function heatValue(video) {
  return Number(video.heat.replace(/\D/g, ""));
}

test("uses backend-ready video field names for media and relationships", () => {
  const { getVideoById } = loadMockVideosModule();
  const video = getVideoById("xinghe");

  assert.equal(video.sourceUrl, "/assets/video/staticTest.mp4");
  assert.equal(typeof video.coverGradient, "string");
  assert.equal(video.totalEpisodes, 24);
  assert.deepEqual(video.castNames, ["林舟", "许念", "周砚", "陈白"]);
  assert.equal(Array.isArray(video.releaseCalendar), true);
  assert.deepEqual(video.relatedVideoIds.slice(0, 2), [
    "shen-kong",
    "lingdian",
  ]);
  assert.equal("source" in video, false);
  assert.equal("background" in video, false);
  assert.equal("casts" in video, false);
  assert.equal("calendar" in video, false);
  assert.equal("relatedIds" in video, false);
  assert.equal("episodeCount" in video, false);
});

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

test("filters search results by channel year and quality", () => {
  const { searchVideosWithFilters } = loadMockVideosModule();
  const videos = searchVideosWithFilters("科幻", {
    channel: "vip",
    quality: "4K HDR",
    year: "2026",
  });

  assert.ok(videos.length > 0);
  assert.equal(videos.every((video) => video.year === "2026"), true);
  assert.equal(videos.every((video) => video.quality === "4K HDR"), true);
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
        .includes("会员"),
    ),
    true,
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

test("gets video detail by id and falls back to featured video", () => {
  const { featuredVideo, getVideoById } = loadMockVideosModule();

  assert.equal(getVideoById("xinghe").id, "xinghe");
  assert.equal(getVideoById("not-found"), featuredVideo);
});

test("sorts ranked videos by score", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("score");
  const scores = videos.map((video) => Number(video.score));

  assert.ok(videos.length > 0);
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("returns configured related videos without the current video", () => {
  const { getRelatedVideos, getVideoById } = loadMockVideosModule();
  const currentVideo = getVideoById("xinghe");
  const relatedVideos = getRelatedVideos(currentVideo.id, 3);

  assert.deepEqual(
    relatedVideos.map((video) => video.id),
    currentVideo.relatedVideoIds.slice(0, 3),
  );
  assert.equal(
    relatedVideos.some((video) => video.id === currentVideo.id),
    false,
  );
});
