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

  globalThis.fetch = async (url) => {
    requestedUrl = String(url);

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
  } finally {
    globalThis.fetch = originalFetch;
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
