import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// 加载 mock 视频模块；递归编译相对 TypeScript 依赖，适配拆分后的数据模块。
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

// 提取视频热度数值；video 为待排序断言的视频项。
function heatValue(video) {
  return Number(video.heat.replace(/\D/g, ""));
}

function scoreValue(video) {
  return Number(video.score);
}

function matchesVideoKeywords(video, keywords) {
  return [
    video.title,
    video.subtitle,
    video.category,
    video.badge,
    video.progress,
    ...video.tags,
  ]
    .join(" ")
    .includes(keywords[0]);
}

function isVipLikeVideo(video) {
  return [video.badge, video.progress, video.quality, video.subtitle, ...video.tags]
    .join(" ")
    .match(/会员|独播|4K/);
}

test("exposes extended rank sort values", () => {
  const { rankSortValues } = loadMockVideosModule();

  assert.deepEqual(rankSortValues, [
    "hot",
    "score",
    "new",
    "rising",
    "reputation",
    "vip",
  ]);
});

test("ranks videos by heat", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("hot");
  const heats = videos.map(heatValue);

  assert.ok(videos.length > 0);
  assert.deepEqual(
    heats,
    [...heats].sort((first, second) => second - first),
  );
});

test("ranks videos by score", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("score");
  const scores = videos.map(scoreValue);

  assert.ok(videos.length > 0);
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("filters ranked videos by channel", () => {
  const { channelItems, getRankedVideos } = loadMockVideosModule();
  const movieChannel = channelItems.find((channel) => channel.slug === "movie");
  const videos = getRankedVideos("score", { channel: "movie" });

  assert.ok(videos.length > 0);
  assert.equal(
    videos.every((video) => matchesVideoKeywords(video, movieChannel.keywords)),
    true,
  );

  const scores = videos.map(scoreValue);
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("ranks reputation videos by score then heat", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("reputation");
  const rankValues = videos.map((video) => [scoreValue(video), heatValue(video)]);
  const sortedValues = [...rankValues].sort(
    (first, second) => second[0] - first[0] || second[1] - first[1],
  );

  assert.ok(videos.length > 0);
  assert.deepEqual(rankValues, sortedValues);
});

test("returns only vip-like videos for vip rank", () => {
  const { getRankedVideos } = loadMockVideosModule();
  const videos = getRankedVideos("vip");
  const heats = videos.map(heatValue);

  assert.ok(videos.length > 0);
  assert.equal(videos.every(isVipLikeVideo), true);
  assert.deepEqual(
    heats,
    [...heats].sort((first, second) => second - first),
  );
});
