import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadUserProfileModule() {
  const sourcePath = path.join(currentDir, "user-profile.ts");
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

test("creates display state for logged-in vip user", () => {
  const { createUserDisplayState } = loadUserProfileModule();

  assert.deepEqual(
    createUserDisplayState({
      isLoggedIn: true,
      isVip: true,
      nickname: "晴空",
      vipUntil: "2026-12-31",
    }),
    {
      avatarInitial: "晴",
      badgeLabel: "VIP会员",
      subtitle: "VIP 有效期至 2026-12-31",
      title: "晴空",
    },
  );
});

test("creates display state for anonymous user", () => {
  const { createUserDisplayState } = loadUserProfileModule();

  assert.deepEqual(
    createUserDisplayState({
      isLoggedIn: false,
      isVip: true,
      nickname: "晴空",
      vipUntil: "2026-12-31",
    }),
    {
      avatarInitial: "N",
      badgeLabel: "未登录",
      subtitle: "登录后同步观看记录和会员权益",
      title: "未登录用户",
    },
  );
});

test("toggles login and vip state consistently", () => {
  const { getNextLoginState, getNextVipState } = loadUserProfileModule();

  assert.deepEqual(
    getNextLoginState({ isLoggedIn: true, isVip: true }),
    { isLoggedIn: false, isVip: false },
  );
  assert.deepEqual(
    getNextLoginState({ isLoggedIn: false, isVip: false }),
    { isLoggedIn: true, isVip: false },
  );
  assert.deepEqual(
    getNextVipState({ isLoggedIn: true, isVip: false }),
    { isVip: true },
  );
  assert.deepEqual(
    getNextVipState({ isLoggedIn: false, isVip: false }),
    { isVip: false },
  );
});
