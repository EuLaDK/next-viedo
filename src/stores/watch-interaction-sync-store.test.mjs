import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(currentDir, "..");
const requireFromTest = createRequire(import.meta.url);

function createStorageMock() {
  const data = new Map();

  return {
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    removeItem: (key) => data.delete(key),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

function loadModule(relativePath) {
  const moduleCache = new Map();

  function resolveRequest(request, parentPath) {
    if (request.startsWith("@/")) {
      return path.join(srcDir, request.slice(2));
    }
    if (request.startsWith(".")) {
      return path.resolve(path.dirname(parentPath), request);
    }
    return request;
  }

  function compileModule(sourcePath) {
    if (!sourcePath.startsWith(srcDir)) {
      return requireFromTest(sourcePath);
    }

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
      const resolvedRequest = resolveRequest(request, resolvedPath);

      if (resolvedRequest.startsWith(srcDir)) {
        return compileModule(resolvedRequest);
      }

      return defaultRequire(resolvedRequest);
    };
    moduleCache.set(resolvedPath, compiledModule);
    compiledModule._compile(outputText, resolvedPath);

    return compiledModule.exports;
  }

  return compileModule(path.join(currentDir, relativePath));
}

function createJsonResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function createEmptyResponse() {
  return {
    ok: true,
    status: 204,
    json: async () => {
      throw new Error("empty body");
    },
  };
}

test("syncs comments and danmaku from interaction api", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    if (String(url).includes("/danmaku")) {
      return createJsonResponse([
        {
          id: "danmaku-1",
          videoId: "xinghe",
          content: "前方高能",
          color: "green",
          createdAt: 456,
        },
      ]);
    }

    return createJsonResponse([
      {
        id: "comment-1",
        videoId: "xinghe",
        content: "值得二刷",
        author: "我",
        likedByMe: false,
        likes: 0,
        createdAt: 123,
      },
    ]);
  };

  try {
    const { useWatchInteractionStore } = loadModule(
      "use-watch-interaction-store.ts",
    );
    await useWatchInteractionStore.getState().syncCommentsFromApi("xinghe");
    await useWatchInteractionStore.getState().syncDanmakuFromApi("xinghe");

    assert.equal(
      useWatchInteractionStore.getState().commentsByVideoId.xinghe[0].id,
      "comment-1",
    );
    assert.equal(
      useWatchInteractionStore.getState().danmakuByVideoId.xinghe[0].id,
      "danmaku-1",
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("comment actions sync writes to interaction api", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ init, url: String(url) });

    if (String(url).endsWith("/like")) {
      return createJsonResponse({
        id: "server-comment",
        videoId: "xinghe",
        content: "值得二刷",
        author: "我",
        likedByMe: true,
        likes: 1,
        createdAt: 123,
      });
    }

    if (init?.method === "DELETE") {
      return createEmptyResponse();
    }

    return createJsonResponse({
      id: "server-comment",
      videoId: "xinghe",
      content: "值得二刷",
      author: "我",
      likedByMe: false,
      likes: 0,
      createdAt: 123,
    });
  };

  try {
    const { useWatchInteractionStore } = loadModule(
      "use-watch-interaction-store.ts",
    );
    useWatchInteractionStore
      .getState()
      .addComment({ videoId: "xinghe", content: "值得二刷" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    useWatchInteractionStore
      .getState()
      .toggleCommentLike("xinghe", "server-comment");
    await new Promise((resolve) => setTimeout(resolve, 0));
    useWatchInteractionStore.getState().deleteComment("xinghe", "server-comment");

    assert.equal(
      useWatchInteractionStore.getState().commentsByVideoId.xinghe.length,
      0,
    );
    assert.equal(requests[0].url, "http://localhost:8080/videos/xinghe/comments");
    assert.equal(requests[0].init.method, "POST");
    assert.equal(
      requests[1].url,
      "http://localhost:8080/videos/xinghe/comments/server-comment/like",
    );
    assert.equal(requests[1].init.method, "POST");
    assert.equal(
      requests[2].url,
      "http://localhost:8080/videos/xinghe/comments/server-comment",
    );
    assert.equal(requests[2].init.method, "DELETE");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("danmaku action syncs write to interaction api", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ init, url: String(url) });

    return createJsonResponse({
      id: "server-danmaku",
      videoId: "xinghe",
      content: "前方高能",
      color: "green",
      createdAt: 456,
    });
  };

  try {
    const { useWatchInteractionStore } = loadModule(
      "use-watch-interaction-store.ts",
    );
    useWatchInteractionStore
      .getState()
      .addDanmaku({ videoId: "xinghe", content: "前方高能", color: "green" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(
      useWatchInteractionStore.getState().danmakuByVideoId.xinghe[0].id,
      "server-danmaku",
    );
    assert.equal(requests[0].url, "http://localhost:8080/videos/xinghe/danmaku");
    assert.equal(requests[0].init.method, "POST");
    assert.deepEqual(JSON.parse(requests[0].init.body), {
      color: "green",
      content: "前方高能",
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});
