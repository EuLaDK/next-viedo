import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadApiClientModule() {
  const sourcePath = path.join(currentDir, "api-client.ts");
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

test("uses mock fallback when api base url is empty", async () => {
  const { requestApiWithFallback } = loadApiClientModule();
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not run");
  };

  try {
    const data = await requestApiWithFallback({
      baseUrl: "",
      fallback: () => ["mock"],
      path: "/videos/rank",
    });

    assert.deepEqual(data, ["mock"]);
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetches json from api url with query params", async () => {
  const { requestApiWithFallback } = loadApiClientModule();
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedInit;

  globalThis.fetch = async (url, init) => {
    requestedUrl = String(url);
    requestedInit = init;

    return {
      ok: true,
      json: async () => ["api"],
    };
  };

  try {
    const data = await requestApiWithFallback({
      baseUrl: "https://api.example.com",
      fallback: () => ["mock"],
      params: { channel: "movie", sort: "score", empty: undefined },
      path: "/videos/rank",
    });

    assert.deepEqual(data, ["api"]);
    assert.equal(
      requestedUrl,
      "https://api.example.com/videos/rank?channel=movie&sort=score",
    );
    assert.equal(requestedInit.credentials, "include");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sends persisted user id as development auth header", async () => {
  const { requestApiWithFallback } = loadApiClientModule();
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  let requestedInit;

  globalThis.window = {};
  globalThis.localStorage = {
    getItem: (key) =>
      key === "next-video-user"
        ? JSON.stringify({ state: { id: "xia@example.com", isLoggedIn: true } })
        : null,
  };
  globalThis.fetch = async (url, init) => {
    requestedInit = init;

    return {
      ok: true,
      json: async () => ["api"],
    };
  };

  try {
    await requestApiWithFallback({
      baseUrl: "https://api.example.com",
      fallback: () => ["mock"],
      path: "/me/favorites",
    });

    assert.equal(requestedInit.headers["X-User-ID"], "xia@example.com");
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.localStorage = originalLocalStorage;
  }
});

test("can skip persisted user id for cookie session checks", async () => {
  const { requestApiWithFallback } = loadApiClientModule();
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  let requestedInit;

  globalThis.window = {};
  globalThis.localStorage = {
    getItem: (key) =>
      key === "next-video-user"
        ? JSON.stringify({ state: { id: "xia@example.com", isLoggedIn: true } })
        : null,
  };
  globalThis.fetch = async (url, init) => {
    requestedInit = init;

    return {
      ok: true,
      json: async () => ({ isLoggedIn: true }),
    };
  };

  try {
    await requestApiWithFallback({
      baseUrl: "https://api.example.com",
      fallback: () => ({ isLoggedIn: false }),
      includeAccountHeader: false,
      path: "/me",
    });

    assert.equal(requestedInit.headers["X-User-ID"], undefined);
    assert.equal(requestedInit.credentials, "include");
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.localStorage = originalLocalStorage;
  }
});

test("falls back when api response fails", async () => {
  const { requestApiWithFallback } = loadApiClientModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ message: "fail" }),
  });

  try {
    const data = await requestApiWithFallback({
      baseUrl: "https://api.example.com",
      fallback: () => ["mock"],
      path: "/videos/rank",
    });

    assert.deepEqual(data, ["mock"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
