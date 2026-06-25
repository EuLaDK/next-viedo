import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadVideoApiModule() {
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

  return compileModule(path.join(currentDir, "video-api.ts"));
}

test("gets ranked videos through mock fallback with filters", async () => {
  const { getRankedVideosData } = loadVideoApiModule();
  const videos = await getRankedVideosData({
    channel: "movie",
    sort: "score",
  });
  const scores = videos.map((video) => Number(video.score));

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
        .includes("电影"),
    ),
    true,
  );
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("gets home page data through mock fallback", async () => {
  const { getHomePageData } = loadVideoApiModule();
  const data = await getHomePageData();

  assert.equal(data.featuredVideo.id, "xinghe");
  assert.deepEqual(
    data.recommendationVideos.map((video) => video.id),
    ["anye", "yunduan", "shaonian", "hai-an"],
  );
  assert.deepEqual(
    data.hotVideos.map((video) => video.id),
    ["guitu", "chunri", "jixian", "xingqiu", "xuexian"],
  );
  assert.equal(data.rankVideos.length, 3);
});

test("gets channel page data through mock fallback", async () => {
  const { getChannelPageData } = loadVideoApiModule();
  const data = await getChannelPageData({
    filters: { sort: "score" },
    slug: "movie",
  });
  const scores = data.videos.map((video) => Number(video.score));

  assert.equal(data.channel.slug, "movie");
  assert.ok(data.videos.length > 0);
  assert.equal(data.heroVideo.id, data.videos[0].id);
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
  );
});

test("gets search page data through mock fallback", async () => {
  const { getSearchPageData } = loadVideoApiModule();
  const data = await getSearchPageData({
    filters: { sort: "hot", year: "2026" },
    query: "2026",
  });

  assert.ok(data.videos.length > 0);
  assert.equal(data.videos.every((video) => video.year === "2026"), true);
  assert.equal(data.recommendationVideos.length, 4);
  assert.ok(data.hotSearchKeywords.includes("星河回响"));
});

test("gets watch page data and static ids through mock fallback", async () => {
  const { getVideoIdsData, getWatchPageData } = loadVideoApiModule();
  const ids = await getVideoIdsData();
  const data = await getWatchPageData("xinghe");

  assert.ok(ids.includes("xinghe"));
  assert.equal(data.video.id, "xinghe");
  assert.ok(data.playback);
  assert.equal(data.playback.sources[0].sourceUrl, data.video.sourceUrl);
  assert.equal(data.playback.sources[0].quality, data.video.quality);
  assert.equal(data.playback.defaultQuality, data.video.quality);
  assert.equal(data.playback.requiresVip, true);
  assert.equal(data.playback.canPlay, true);
  assert.equal(data.playback.trialSeconds, 360);
  assert.deepEqual(data.playback.resume, {
    canResume: false,
  });
  assert.deepEqual(
    data.relatedVideos.map((video) => video.id),
    data.video.relatedVideoIds.slice(0, data.relatedVideos.length),
  );
});
