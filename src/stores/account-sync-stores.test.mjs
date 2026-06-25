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

test("user store syncs profile from account api", async () => {
	globalThis.localStorage = createStorageMock();
	process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      avatarUrl: "/avatar.png",
      email: "xia@example.com",
      isLoggedIn: true,
      isVip: false,
      nickname: "小夏",
      phone: "",
      vipUntil: "",
    }),
  });

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    await useUserStore.getState().syncFromApi();

    assert.equal(useUserStore.getState().nickname, "小夏");
    assert.equal(useUserStore.getState().email, "xia@example.com");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
	}
});

test("user store activates vip through account api", async () => {
	globalThis.localStorage = createStorageMock();
	process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
	const originalFetch = globalThis.fetch;
	let requestedUrl = "";
	let requestedInit;

	globalThis.fetch = async (url, init) => {
		requestedUrl = String(url);
		requestedInit = init;

		return {
			ok: true,
			json: async () => ({
				avatarUrl: "/avatar.png",
				email: "vip@example.com",
				isLoggedIn: true,
				isVip: true,
				nickname: "服务端 VIP",
				phone: "",
				vipUntil: "2027-06-25",
			}),
		};
	};

	try {
		const { useUserStore } = loadModule("use-user-store.ts");
		useUserStore.setState({
			...useUserStore.getState(),
			email: "vip@example.com",
			isLoggedIn: true,
			isVip: false,
			nickname: "本地用户",
		});

		useUserStore.getState().activateVip("2027-06-25");
		assert.equal(useUserStore.getState().isVip, true);

		await new Promise((resolve) => setImmediate(resolve));

		assert.equal(requestedUrl, "http://localhost:8080/me/vip");
		assert.equal(requestedInit.method, "POST");
		assert.deepEqual(JSON.parse(requestedInit.body), {
			vipUntil: "2027-06-25",
		});
		assert.equal(useUserStore.getState().nickname, "服务端 VIP");
		assert.equal(useUserStore.getState().vipUntil, "2027-06-25");
	} finally {
		globalThis.fetch = originalFetch;
		delete process.env.NEXT_PUBLIC_API_BASE_URL;
	}
});

test("favorite store syncs items from account api", async () => {
	globalThis.localStorage = createStorageMock();
	process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        id: "xinghe",
        title: "星河回响",
        category: "科幻 / 悬疑",
        progress: "会员抢先看",
        coverGradient: "gradient",
        description: "深空信号",
        addedAt: 123,
      },
    ],
  });

  try {
    const { useFavoriteStore } = loadModule("use-favorite-store.ts");
    await useFavoriteStore.getState().syncFromApi();

    assert.deepEqual(
      useFavoriteStore.getState().items.map((item) => item.id),
      ["xinghe"],
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("watch history store syncs items from account api", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        id: "xinghe",
        title: "星河回响",
        category: "科幻 / 悬疑",
        progress: "会员抢先看",
        coverGradient: "gradient",
        episode: 2,
        watchSeconds: 90,
        durationSeconds: 2700,
        watchedAt: 456,
      },
    ],
  });

  try {
    const { useWatchHistoryStore } = loadModule("use-watch-history-store.ts");
    await useWatchHistoryStore.getState().syncFromApi();

    assert.equal(useWatchHistoryStore.getState().items[0].id, "xinghe");
    assert.equal(useWatchHistoryStore.getState().items[0].episode, 2);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});
