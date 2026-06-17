import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadInteractionApiModule() {
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

  return compileModule(path.join(currentDir, "interaction-api.ts"));
}

test("gets comments through fallback when api base url is empty", async () => {
  const { getWatchComments } = loadInteractionApiModule();
  const comments = await getWatchComments("xinghe", {
    baseUrl: "",
    fallback: [
      {
        id: "local-comment",
        videoId: "xinghe",
        content: "本地评论",
        author: "我",
        likedByMe: false,
        likes: 0,
        createdAt: 123,
      },
    ],
  });

  assert.equal(comments[0].id, "local-comment");
});

test("requests comment endpoints with encoded video and comment ids", async () => {
  const {
    addWatchComment,
    deleteWatchComment,
    getWatchComments,
    toggleWatchCommentLike,
  } = loadInteractionApiModule();
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ init, url: String(url) });

    if (String(url).endsWith("/like")) {
      return {
        ok: true,
        json: async () => ({
          id: "comment/1",
          videoId: "xinghe space",
          content: "值得二刷",
          author: "我",
          likedByMe: true,
          likes: 1,
          createdAt: 123,
        }),
      };
    }

    if (init?.method === "DELETE") {
      return {
        ok: true,
        status: 204,
        json: async () => {
          throw new Error("empty body");
        },
      };
    }

    if (init?.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          id: "comment/1",
          videoId: "xinghe space",
          content: "值得二刷",
          author: "我",
          likedByMe: false,
          likes: 0,
          createdAt: 123,
        }),
      };
    }

    return {
      ok: true,
      json: async () => [
        {
          id: "comment/1",
          videoId: "xinghe space",
          content: "值得二刷",
          author: "我",
          likedByMe: false,
          likes: 0,
          createdAt: 123,
        },
      ],
    };
  };

  try {
    const comments = await getWatchComments("xinghe space", {
      baseUrl: "http://localhost:8080",
      sort: "hot",
    });
    const created = await addWatchComment(
      "xinghe space",
      { content: "值得二刷" },
      { baseUrl: "http://localhost:8080" },
    );
    const liked = await toggleWatchCommentLike("xinghe space", "comment/1", {
      baseUrl: "http://localhost:8080",
    });
    await deleteWatchComment("xinghe space", "comment/1", {
      baseUrl: "http://localhost:8080",
    });

    assert.equal(comments[0].id, "comment/1");
    assert.equal(created.content, "值得二刷");
    assert.equal(liked.likedByMe, true);
    assert.equal(
      requests[0].url,
      "http://localhost:8080/videos/xinghe%20space/comments?sort=hot",
    );
    assert.equal(requests[1].init.method, "POST");
    assert.deepEqual(JSON.parse(requests[1].init.body), {
      content: "值得二刷",
    });
    assert.equal(
      requests[2].url,
      "http://localhost:8080/videos/xinghe%20space/comments/comment%2F1/like",
    );
    assert.equal(requests[2].init.method, "POST");
    assert.equal(
      requests[3].url,
      "http://localhost:8080/videos/xinghe%20space/comments/comment%2F1",
    );
    assert.equal(requests[3].init.method, "DELETE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("requests danmaku endpoints with selected color", async () => {
  const { addWatchDanmaku, getWatchDanmaku } = loadInteractionApiModule();
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ init, url: String(url) });

    return {
      ok: true,
      json: async () =>
        init?.method === "POST"
          ? {
              id: "danmaku-1",
              videoId: "xinghe",
              content: "前方高能",
              color: "green",
              createdAt: 456,
            }
          : [
              {
                id: "danmaku-1",
                videoId: "xinghe",
                content: "前方高能",
                color: "green",
                createdAt: 456,
              },
            ],
    };
  };

  try {
    const items = await getWatchDanmaku("xinghe", {
      baseUrl: "http://localhost:8080",
    });
    const created = await addWatchDanmaku(
      "xinghe",
      { color: "green", content: "前方高能" },
      { baseUrl: "http://localhost:8080" },
    );

    assert.equal(items[0].id, "danmaku-1");
    assert.equal(created.color, "green");
    assert.equal(requests[0].url, "http://localhost:8080/videos/xinghe/danmaku");
    assert.equal(requests[1].init.method, "POST");
    assert.deepEqual(JSON.parse(requests[1].init.body), {
      color: "green",
      content: "前方高能",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
