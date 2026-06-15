import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadWatchInteractionsModule() {
  const sourcePath = path.join(currentDir, "watch-interactions.ts");
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

test("creates comment item from non-empty content", () => {
  const { createWatchComment } = loadWatchInteractionsModule();
  const comment = createWatchComment({
    content: "  这一集节奏不错  ",
    createdAt: 100,
    videoId: "xinghe",
  });

  assert.equal(comment.content, "这一集节奏不错");
  assert.equal(comment.videoId, "xinghe");
  assert.equal(comment.createdAt, 100);
});

test("rejects empty comment content", () => {
  const { createWatchComment } = loadWatchInteractionsModule();

  assert.equal(
    createWatchComment({
      content: "   ",
      createdAt: 100,
      videoId: "xinghe",
    }),
    null,
  );
});

test("sorts comments by latest time without mutating input", () => {
  const { sortWatchComments } = loadWatchInteractionsModule();
  const comments = [
    { id: "1", createdAt: 10 },
    { id: "2", createdAt: 30 },
    { id: "3", createdAt: 20 },
  ];

  const sortedComments = sortWatchComments(comments);

  assert.deepEqual(
    sortedComments.map((comment) => comment.id),
    ["2", "3", "1"],
  );
  assert.deepEqual(
    comments.map((comment) => comment.id),
    ["1", "2", "3"],
  );
});

test("sorts comments by hot likes then latest time", () => {
  const { sortWatchComments } = loadWatchInteractionsModule();
  const comments = [
    { id: "1", createdAt: 30, likes: 1 },
    { id: "2", createdAt: 20, likes: 5 },
    { id: "3", createdAt: 40, likes: 5 },
  ];

  assert.deepEqual(
    sortWatchComments(comments, "hot").map((comment) => comment.id),
    ["3", "2", "1"],
  );
  assert.deepEqual(
    comments.map((comment) => comment.id),
    ["1", "2", "3"],
  );
});

test("toggles comment like state without mutating input", () => {
  const { toggleWatchCommentLike } = loadWatchInteractionsModule();
  const comments = [
    { id: "1", createdAt: 10, likes: 1, likedByMe: false },
    { id: "2", createdAt: 20, likes: 3, likedByMe: true },
  ];

  const likedComments = toggleWatchCommentLike(comments, "1");
  const unlikedComments = toggleWatchCommentLike(comments, "2");

  assert.deepEqual(likedComments[0], {
    id: "1",
    createdAt: 10,
    likes: 2,
    likedByMe: true,
  });
  assert.deepEqual(unlikedComments[1], {
    id: "2",
    createdAt: 20,
    likes: 2,
    likedByMe: false,
  });
  assert.equal(comments[0].likes, 1);
  assert.equal(comments[1].likedByMe, true);
});

test("deletes only own comments", () => {
  const { deleteOwnWatchComment } = loadWatchInteractionsModule();
  const comments = [
    { id: "1", author: "我", createdAt: 10 },
    { id: "2", author: "路人甲", createdAt: 20 },
  ];

  assert.deepEqual(
    deleteOwnWatchComment(comments, "1").map((comment) => comment.id),
    ["2"],
  );
  assert.deepEqual(
    deleteOwnWatchComment(comments, "2").map((comment) => comment.id),
    ["1", "2"],
  );
});

test("keeps recent danmaku items within limit", () => {
  const { limitWatchDanmakuItems } = loadWatchInteractionsModule();
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: String(index + 1),
    createdAt: index + 1,
  }));

  assert.deepEqual(
    limitWatchDanmakuItems(items, 3).map((item) => item.id),
    ["5", "4", "3"],
  );
});

test("creates danmaku with selected or default color", () => {
  const { createWatchDanmaku } = loadWatchInteractionsModule();

  assert.deepEqual(
    createWatchDanmaku({
      color: "green",
      content: "这一段太燃了",
      createdAt: 100,
      videoId: "xinghe",
    }).color,
    "green",
  );
  assert.deepEqual(
    createWatchDanmaku({
      content: "默认颜色",
      createdAt: 101,
      videoId: "xinghe",
    }).color,
    "white",
  );
});

test("calculates danmaku send cooldown state", () => {
  const { getWatchDanmakuSendState } = loadWatchInteractionsModule();
  const items = [{ id: "1", createdAt: 1000 }];

  assert.deepEqual(getWatchDanmakuSendState(items, 4500, 5000), {
    canSend: false,
    remainingSeconds: 2,
  });
  assert.deepEqual(getWatchDanmakuSendState(items, 6000, 5000), {
    canSend: true,
    remainingSeconds: 0,
  });
});

test("creates danmaku overlay items with cyclic tracks", () => {
  const { createDanmakuOverlayItems } = loadWatchInteractionsModule();
  const items = Array.from({ length: 6 }, (_, index) => ({
    id: String(index + 1),
    content: `弹幕 ${index + 1}`,
    createdAt: index + 1,
  }));

  const overlayItems = createDanmakuOverlayItems(items, {
    delayStep: 1.5,
    duration: 10,
    limit: 5,
    trackCount: 3,
  });

  assert.deepEqual(
    overlayItems.map((item) => item.id),
    ["6", "5", "4", "3", "2"],
  );
  assert.deepEqual(
    overlayItems.map((item) => item.trackIndex),
    [0, 1, 2, 0, 1],
  );
  assert.deepEqual(
    overlayItems.map((item) => item.topPercent),
    [12, 28, 44, 12, 28],
  );
  assert.deepEqual(
    overlayItems.map((item) => item.delay),
    [0, 1.5, 3, 4.5, 6],
  );
  assert.equal(overlayItems.every((item) => item.duration === 10), true);
});
