import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadPlayerSourceModule() {
  const sourcePath = path.join(currentDir, "player-source.ts");
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

test("uses native playback for mp4 sources", () => {
  const { getPlaybackEngine } = loadPlayerSourceModule();

  assert.equal(
    getPlaybackEngine({
      mimeType: "video/mp4",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
    "native",
  );
});

test("detects hls sources by mime type and m3u8 url", () => {
  const { getPlaybackEngine } = loadPlayerSourceModule();

  assert.equal(
    getPlaybackEngine({
      mimeType: "application/vnd.apple.mpegurl",
      sourceUrl: "https://example.com/master",
    }),
    "hls",
  );
  assert.equal(
    getPlaybackEngine({
      mimeType: "",
      sourceUrl: "https://example.com/live/playlist.m3u8?token=abc",
    }),
    "hls",
  );
});

test("detects dash sources by mime type and mpd url", () => {
  const { getPlaybackEngine } = loadPlayerSourceModule();

  assert.equal(
    getPlaybackEngine({
      mimeType: "application/dash+xml",
      sourceUrl: "https://example.com/manifest",
    }),
    "dash",
  );
  assert.equal(
    getPlaybackEngine({
      mimeType: "",
      sourceUrl: "https://example.com/video/manifest.mpd",
    }),
    "dash",
  );
});

test("falls back to native playback for missing or unknown metadata", () => {
  const { getPlaybackEngine } = loadPlayerSourceModule();

  assert.equal(getPlaybackEngine({ mimeType: "", sourceUrl: "" }), "native");
  assert.equal(
    getPlaybackEngine({
      mimeType: "application/octet-stream",
      sourceUrl: "https://example.com/video",
    }),
    "native",
  );
});

test("chooses direct video src only for native sources and browser-native hls", () => {
  const { getDirectVideoSourceUrl } = loadPlayerSourceModule();

  assert.equal(
    getDirectVideoSourceUrl({
      engine: "native",
      sourceUrl: "/assets/video/staticTest.mp4",
      supportsNativeHls: false,
    }),
    "/assets/video/staticTest.mp4",
  );
  assert.equal(
    getDirectVideoSourceUrl({
      engine: "hls",
      sourceUrl: "https://example.com/master.m3u8",
      supportsNativeHls: true,
    }),
    "https://example.com/master.m3u8",
  );
  assert.equal(
    getDirectVideoSourceUrl({
      engine: "hls",
      sourceUrl: "https://example.com/master.m3u8",
      supportsNativeHls: false,
    }),
    null,
  );
  assert.equal(
    getDirectVideoSourceUrl({
      engine: "dash",
      sourceUrl: "https://example.com/manifest.mpd",
      supportsNativeHls: true,
    }),
    null,
  );
});

test("builds media key from episode and source url rather than quality label", () => {
  const { getPlaybackMediaKey } = loadPlayerSourceModule();

  assert.equal(
    getPlaybackMediaKey({
      playerKey: "xinghe-2",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
    "xinghe-2-/assets/video/staticTest.mp4",
  );
  assert.equal(
    getPlaybackMediaKey({
      playerKey: "xinghe-2",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
    getPlaybackMediaKey({
      playerKey: "xinghe-2",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
  );
  assert.notEqual(
    getPlaybackMediaKey({
      playerKey: "xinghe-2",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
    getPlaybackMediaKey({
      playerKey: "xinghe-3",
      sourceUrl: "/assets/video/staticTest.mp4",
    }),
  );
});
