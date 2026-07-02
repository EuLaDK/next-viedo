import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadAccountApiModule() {
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

  return compileModule(path.join(currentDir, "account-api.ts"));
}

test("gets account profile through fallback when api base url is empty", async () => {
  const { getAccountProfile } = loadAccountApiModule();
  const profile = await getAccountProfile({
    baseUrl: "",
    fallback: {
      avatarUrl: "",
      email: "",
      isLoggedIn: false,
      isVip: false,
      nickname: "本地用户",
      phone: "",
      vipUntil: "",
    },
  });

  assert.equal(profile.nickname, "本地用户");
});

test("posts login input to account api", async () => {
	const { loginAccount } = loadAccountApiModule();
	const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedInit;

  globalThis.fetch = async (url, init) => {
    requestedUrl = String(url);
    requestedInit = init;

    return {
      ok: true,
      json: async () => ({
        avatarUrl: "",
        email: "xia@example.com",
        isLoggedIn: true,
        isVip: false,
        nickname: "小夏",
        phone: "",
        vipUntil: "",
      }),
    };
  };

  try {
    const profile = await loginAccount(
      { email: "xia@example.com", password: "password123" },
      {
        baseUrl: "http://localhost:8080",
        fallback: {
          avatarUrl: "",
          email: "",
          isLoggedIn: false,
          isVip: false,
          nickname: "本地用户",
          phone: "",
          vipUntil: "",
        },
      },
    );

    assert.equal(requestedUrl, "http://localhost:8080/me/login");
    assert.equal(requestedInit.method, "POST");
    assert.equal(requestedInit.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(requestedInit.body), {
      email: "xia@example.com",
      password: "password123",
    });
    assert.equal(profile.nickname, "小夏");
  } finally {
    globalThis.fetch = originalFetch;
	}
});

test("posts register input to account api", async () => {
  const { registerAccount } = loadAccountApiModule();
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedInit;

  globalThis.fetch = async (url, init) => {
    requestedUrl = String(url);
    requestedInit = init;

    return {
      ok: true,
      json: async () => ({
        id: "xia@example.com",
        avatarUrl: "",
        email: "xia@example.com",
        isLoggedIn: true,
        isVip: false,
        nickname: "小夏",
        phone: "",
        vipUntil: "",
      }),
    };
  };

  try {
    const profile = await registerAccount(
      { email: "xia@example.com", password: "password123", nickname: "小夏" },
      {
        baseUrl: "http://localhost:8080",
        fallback: {
          avatarUrl: "",
          email: "",
          isLoggedIn: false,
          isVip: false,
          nickname: "本地用户",
          phone: "",
          vipUntil: "",
        },
      },
    );

    assert.equal(requestedUrl, "http://localhost:8080/me/register");
    assert.equal(requestedInit.method, "POST");
    assert.deepEqual(JSON.parse(requestedInit.body), {
      email: "xia@example.com",
      nickname: "小夏",
      password: "password123",
    });
    assert.equal(profile.id, "xia@example.com");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects login when account api returns invalid credentials", async () => {
  const { loginAccount } = loadAccountApiModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      error: "invalid credentials",
    }),
  });

  try {
    await assert.rejects(
      () =>
        loginAccount(
          { email: "xia@example.com", password: "wrong-password" },
          {
            baseUrl: "http://localhost:8080",
            fallback: {
              avatarUrl: "",
              email: "xia@example.com",
              isLoggedIn: true,
              isVip: false,
              nickname: "不应该登录",
              phone: "",
              vipUntil: "",
            },
          },
        ),
      (error) => {
        assert.equal(error.status, 401);
        assert.equal(error.code, "invalid credentials");

        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects register when account api returns duplicate email", async () => {
  const { registerAccount } = loadAccountApiModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 409,
    json: async () => ({
      error: "email already registered",
    }),
  });

  try {
    await assert.rejects(
      () =>
        registerAccount(
          {
            email: "xia@example.com",
            nickname: "小夏",
            password: "password123",
          },
          {
            baseUrl: "http://localhost:8080",
            fallback: {
              avatarUrl: "",
              email: "xia@example.com",
              isLoggedIn: true,
              isVip: false,
              nickname: "不应该注册",
              phone: "",
              vipUntil: "",
            },
          },
        ),
      (error) => {
        assert.equal(error.status, 409);
        assert.equal(error.code, "email already registered");

        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("posts vip expiration to account api", async () => {
	const { activateAccountVip } = loadAccountApiModule();
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
				nickname: "VIP 用户",
				phone: "",
				vipUntil: "2027-06-25",
			}),
		};
	};

	try {
		const profile = await activateAccountVip("2027-06-25", {
			baseUrl: "http://localhost:8080",
			fallback: {
				avatarUrl: "",
				email: "",
				isLoggedIn: true,
				isVip: true,
				nickname: "本地用户",
				phone: "",
				vipUntil: "2027-06-25",
			},
		});

		assert.equal(requestedUrl, "http://localhost:8080/me/vip");
		assert.equal(requestedInit.method, "POST");
		assert.equal(requestedInit.headers["Content-Type"], "application/json");
		assert.deepEqual(JSON.parse(requestedInit.body), {
			vipUntil: "2027-06-25",
		});
		assert.equal(profile.isVip, true);
		assert.equal(profile.vipUntil, "2027-06-25");
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test("saves favorite and deletes watch history with encoded episode", async () => {
	const { deleteAccountWatchHistory, saveAccountFavorite } =
		loadAccountApiModule();
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, init) => {
    requests.push({ init, url: String(url) });

    if (String(url).includes("/me/favorites")) {
      return {
        ok: true,
        json: async () => ({
          id: "xinghe",
          title: "星河回响",
          category: "科幻 / 悬疑",
          progress: "会员抢先看",
          coverGradient: "gradient",
          description: "深空信号",
          addedAt: 123,
        }),
      };
    }

    return {
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("empty body");
      },
    };
  };

  try {
    const favorite = await saveAccountFavorite(
      {
        id: "xinghe",
        title: "星河回响",
        category: "科幻 / 悬疑",
        progress: "会员抢先看",
        coverGradient: "gradient",
        description: "深空信号",
      },
      {
        baseUrl: "http://localhost:8080",
        fallback: {
          id: "fallback",
          title: "",
          category: "",
          progress: "",
          coverGradient: "",
          description: "",
          addedAt: 0,
        },
      },
    );
    await deleteAccountWatchHistory("xinghe", {
      baseUrl: "http://localhost:8080",
      episode: 2,
    });

    assert.equal(favorite.id, "xinghe");
    assert.equal(requests[0].url, "http://localhost:8080/me/favorites");
    assert.equal(requests[0].init.method, "POST");
    assert.equal(
      requests[1].url,
      "http://localhost:8080/me/watch-history/xinghe?episode=2",
    );
    assert.equal(requests[1].init.method, "DELETE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
