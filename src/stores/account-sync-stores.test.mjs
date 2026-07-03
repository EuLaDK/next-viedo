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

test("user store checks cookie session without development auth header", async () => {
  globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        id: "stale@example.com",
        isLoggedIn: true,
      },
    }),
  );
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });

    if (
      String(url).endsWith("/me/favorites") ||
      String(url).endsWith("/me/watch-history")
    ) {
      return {
        ok: true,
        json: async () => [],
      };
    }

    return {
      ok: true,
      json: async () => ({
        avatarUrl: "/avatar.png",
        email: "cookie@example.com",
        id: "cookie@example.com",
        isLoggedIn: true,
        isVip: false,
        nickname: "Cookie 用户",
        phone: "",
        vipUntil: "",
      }),
    };
  };

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    await useUserStore.getState().syncFromApi();
    const profileRequest = requests.find((request) =>
      request.url.endsWith("/me"),
    );

    assert.equal(profileRequest?.init.headers["X-User-ID"], undefined);
    assert.equal(useUserStore.getState().email, "cookie@example.com");
    assert.equal(useUserStore.getState().id, "cookie@example.com");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("user store falls back to persisted account when cookie session is missing", async () => {
  globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        email: "persisted@example.com",
        id: "persisted@example.com",
        isLoggedIn: true,
      },
    }),
  );
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });

    if (
      String(url).endsWith("/me/favorites") ||
      String(url).endsWith("/me/watch-history")
    ) {
      return {
        ok: true,
        json: async () => [],
      };
    }

    if (init.headers["X-User-ID"] === "persisted@example.com") {
      return {
        ok: true,
        json: async () => ({
          avatarUrl: "/avatar.png",
          email: "persisted@example.com",
          id: "persisted@example.com",
          isLoggedIn: true,
          isVip: false,
          nickname: "Persisted User",
          phone: "",
          vipUntil: "",
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        avatarUrl: "",
        email: "",
        id: "demo-user",
        isLoggedIn: false,
        isVip: false,
        nickname: "Next Video User",
        phone: "",
        vipUntil: "",
      }),
    };
  };

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    await useUserStore.getState().syncFromApi();
    const profileRequests = requests.filter((request) =>
      request.url.endsWith("/me"),
    );

    assert.equal(profileRequests.length, 2);
    assert.equal(profileRequests[0].init.headers["X-User-ID"], undefined);
    assert.equal(
      profileRequests[1].init.headers["X-User-ID"],
      "persisted@example.com",
    );
    assert.equal(useUserStore.getState().isLoggedIn, true);
    assert.equal(useUserStore.getState().email, "persisted@example.com");
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

test("user store updates editable profile through account api", async () => {
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
        id: "profile-user",
        avatarUrl: "/server-avatar.png",
        email: "profile@example.com",
        isLoggedIn: true,
        isVip: false,
        nickname: "服务端昵称",
        phone: "13900000000",
        vipUntil: "",
      }),
    };
  };

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    useUserStore.setState({
      ...useUserStore.getState(),
      avatarUrl: "/old-avatar.png",
      email: "profile@example.com",
      id: "profile-user",
      isLoggedIn: true,
      nickname: "旧昵称",
      phone: "13800000000",
    });

    await useUserStore.getState().updateProfile({
      avatarUrl: "/local-avatar.png",
      nickname: "本地昵称",
      phone: "13900000000",
    });

    assert.equal(requestedUrl, "http://localhost:8080/me");
    assert.equal(requestedInit.method, "PATCH");
    assert.deepEqual(JSON.parse(requestedInit.body), {
      avatarUrl: "/local-avatar.png",
      nickname: "本地昵称",
      phone: "13900000000",
    });
    assert.equal(useUserStore.getState().nickname, "服务端昵称");
    assert.equal(useUserStore.getState().avatarUrl, "/server-avatar.png");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("user store keeps logged out state when login fails", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      error: "invalid credentials",
    }),
  });

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    const result = await useUserStore.getState().loginWithProfile({
      email: "xia@example.com",
      password: "wrong-password",
    });

    assert.equal(result, false);
    assert.equal(useUserStore.getState().isLoggedIn, false);
    assert.equal(useUserStore.getState().authError, "邮箱或密码不正确");
    assert.equal(useUserStore.getState().authPending, false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("user store shows duplicate email message when register fails", async () => {
  globalThis.localStorage = createStorageMock();
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 409,
    json: async () => ({
      error: "email already registered",
    }),
  });

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    const result = await useUserStore.getState().registerWithProfile({
      email: "xia@example.com",
      nickname: "小夏",
      password: "password123",
    });

    assert.equal(result, false);
    assert.equal(useUserStore.getState().isLoggedIn, false);
    assert.equal(
      useUserStore.getState().authError,
      "这个邮箱已经注册，可以直接登录",
    );
    assert.equal(useUserStore.getState().authPending, false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("user store clears local account lists after logging in as another account", async () => {
  globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-watch-history",
    JSON.stringify({
      state: {
        items: [
          {
            id: "old-video",
            title: "Old Video",
            category: "Drama",
            progress: "Episode 1",
            coverGradient: "linear-gradient(#000,#111)",
            watchedAt: 100,
          },
        ],
      },
    }),
  );
  globalThis.localStorage.setItem(
    "next-video-favorites",
    JSON.stringify({
      state: {
        items: [
          {
            id: "old-favorite",
            title: "Old Favorite",
            category: "Drama",
            progress: "Saved",
            coverGradient: "linear-gradient(#000,#111)",
            description: "Old account item",
            addedAt: 100,
          },
        ],
      },
    }),
  );
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });

    if (String(url).endsWith("/me/login")) {
      return {
        ok: true,
        json: async () => ({
          avatarUrl: "",
          email: "new@example.com",
          id: "new@example.com",
          isLoggedIn: true,
          isVip: false,
          nickname: "New User",
          phone: "",
          vipUntil: "",
        }),
      };
    }

    if (
      String(url).endsWith("/me/favorites") ||
      String(url).endsWith("/me/watch-history")
    ) {
      return {
        ok: true,
        json: async () => [],
      };
    }

    throw new Error(`unexpected request: ${url}`);
  };

  try {
    const { useUserStore } = loadModule("use-user-store.ts");
    const result = await useUserStore.getState().loginWithProfile({
      email: "new@example.com",
      password: "password123",
    });

    const persistedHistory = JSON.parse(
      globalThis.localStorage.getItem("next-video-watch-history"),
    );
    const persistedFavorites = JSON.parse(
      globalThis.localStorage.getItem("next-video-favorites"),
    );
    const historyRequest = requests.find((request) =>
      request.url.endsWith("/me/watch-history"),
    );
    const favoriteRequest = requests.find((request) =>
      request.url.endsWith("/me/favorites"),
    );

    assert.equal(result, true);
    assert.deepEqual(persistedHistory.state.items, []);
    assert.deepEqual(persistedFavorites.state.items, []);
    assert.equal(historyRequest?.init.headers["X-User-ID"], "new@example.com");
    assert.equal(favoriteRequest?.init.headers["X-User-ID"], "new@example.com");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("watch history store clears local items without fetching account api when logged out", async () => {
  globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        id: "old@example.com",
        isLoggedIn: false,
      },
    }),
  );
  globalThis.localStorage.setItem(
    "next-video-watch-history",
    JSON.stringify({
      state: {
        items: [
          {
            id: "old-video",
            title: "Old Video",
            category: "Drama",
            progress: "Episode 1",
            coverGradient: "linear-gradient(#000,#111)",
            watchedAt: 100,
          },
        ],
      },
    }),
  );
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("logged out history sync should not fetch");
  };

  try {
    const { useWatchHistoryStore } = loadModule("use-watch-history-store.ts");
    await useWatchHistoryStore.getState().syncFromApi();
    const persistedHistory = JSON.parse(
      globalThis.localStorage.getItem("next-video-watch-history"),
    );

    assert.equal(fetchCalled, false);
    assert.deepEqual(useWatchHistoryStore.getState().items, []);
    assert.deepEqual(persistedHistory.state.items, []);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("favorite store clears local items without fetching account api when logged out", async () => {
  globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        id: "old@example.com",
        isLoggedIn: false,
      },
    }),
  );
  globalThis.localStorage.setItem(
    "next-video-favorites",
    JSON.stringify({
      state: {
        items: [
          {
            id: "old-favorite",
            title: "Old Favorite",
            category: "Drama",
            progress: "Saved",
            coverGradient: "linear-gradient(#000,#111)",
            description: "Old account item",
            addedAt: 100,
          },
        ],
      },
    }),
  );
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("logged out favorite sync should not fetch");
  };

  try {
    const { useFavoriteStore } = loadModule("use-favorite-store.ts");
    await useFavoriteStore.getState().syncFromApi();
    const persistedFavorites = JSON.parse(
      globalThis.localStorage.getItem("next-video-favorites"),
    );

    assert.equal(fetchCalled, false);
    assert.deepEqual(useFavoriteStore.getState().items, []);
    assert.deepEqual(persistedFavorites.state.items, []);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  }
});

test("favorite store syncs items from account api", async () => {
	globalThis.localStorage = createStorageMock();
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        id: "sync@example.com",
        isLoggedIn: true,
      },
    }),
  );
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
  globalThis.localStorage.setItem(
    "next-video-user",
    JSON.stringify({
      state: {
        id: "sync@example.com",
        isLoggedIn: true,
      },
    }),
  );
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
