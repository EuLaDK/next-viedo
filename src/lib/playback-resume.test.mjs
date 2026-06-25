import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function loadPlaybackResumeModule() {
  const sourcePath = path.join(currentDir, "playback-resume.ts");
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

test("uses backend resume point when url has no episode or time", () => {
  const { getPlaybackStartState } = loadPlaybackResumeModule();

  assert.deepEqual(
    getPlaybackStartState({
      episodeValue: "",
      maxEpisode: 12,
      resume: {
        canResume: true,
        episode: 3,
        watchSeconds: 125,
        durationSeconds: 2700,
      },
      timeValue: "",
    }),
    {
      activeEpisode: 3,
      initialTime: 125,
    },
  );
});

test("keeps explicit url episode and time before backend resume point", () => {
  const { getPlaybackStartState } = loadPlaybackResumeModule();

  assert.deepEqual(
    getPlaybackStartState({
      episodeValue: "2",
      maxEpisode: 12,
      resume: {
        canResume: true,
        episode: 3,
        watchSeconds: 125,
        durationSeconds: 2700,
      },
      timeValue: "45",
    }),
    {
      activeEpisode: 2,
      initialTime: 45,
    },
  );
});
