import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadVipMembershipModule() {
  const sourcePath = path.join(currentDir, "vip-membership.ts");
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

test("keeps vip plans ordered and marks yearly plan as recommended", () => {
  const { vipPlans } = loadVipMembershipModule();

  assert.deepEqual(
    vipPlans.map((plan) => plan.id),
    ["monthly", "quarterly", "yearly"],
  );
  assert.equal(vipPlans.find((plan) => plan.id === "yearly").recommended, true);
});

test("returns selected vip plan or falls back to recommended plan", () => {
  const { getVipPlanById } = loadVipMembershipModule();

  assert.equal(getVipPlanById("monthly").id, "monthly");
  assert.equal(getVipPlanById("unknown").id, "yearly");
  assert.equal(getVipPlanById(undefined).id, "yearly");
});

test("provides benefit groups with non-empty items", () => {
  const { vipBenefitGroups } = loadVipMembershipModule();

  assert.equal(vipBenefitGroups.length, 4);
  assert.equal(
    vipBenefitGroups.every((group) => group.items.length > 0),
    true,
  );
});

test("detects videos that should be treated as vip content", () => {
  const { isVipVideoContent } = loadVipMembershipModule();

  assert.equal(
    isVipVideoContent({
      badge: "独播",
      progress: "会员抢先看",
      quality: "4K HDR",
      subtitle: "全网热播 · 会员抢先看",
      tags: ["科幻", "会员抢先看"],
    }),
    true,
  );
  assert.equal(
    isVipVideoContent({
      badge: "高分完结",
      progress: "全季可看",
      quality: "1080P",
      subtitle: "犯罪悬疑",
      tags: ["犯罪", "完结"],
    }),
    false,
  );
});

test("creates vip playback prompt from user and content state", () => {
  const { createVipPlaybackState } = loadVipMembershipModule();

  assert.deepEqual(
    createVipPlaybackState({ isVip: false, requiresVip: true }),
    {
      shouldShowPrompt: true,
      title: "开通 VIP 继续畅看",
      description: "该内容包含会员抢先看或高清权益，开通后可解锁完整体验。",
    },
  );
  assert.equal(
    createVipPlaybackState({ isVip: true, requiresVip: true })
      .shouldShowPrompt,
    false,
  );
});

test("formats vip expiration from selected plan", () => {
  const { getVipUntilByPlanId } = loadVipMembershipModule();

  assert.equal(
    getVipUntilByPlanId("monthly", new Date("2026-06-12T00:00:00Z")),
    "2026-07-12",
  );
  assert.equal(
    getVipUntilByPlanId("yearly", new Date("2026-06-12T00:00:00Z")),
    "2027-06-12",
  );
});
