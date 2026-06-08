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
