import type { PlaybackResume } from "./video-data";

type PlaybackStartInput = {
  episodeValue: string;
  maxEpisode: number;
  resume?: PlaybackResume;
  timeValue: string;
};

type PlaybackStartState = {
  activeEpisode: number;
  initialTime: number;
};

// 解析正整数查询参数；value 非法或小于 1 时返回 0。
function parsePositiveInteger(value: string): number {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return 0;
  }

  return parsedValue;
}

// 限制集数范围；episode 为候选集数，maxEpisode 为当前视频最大集数。
function clampEpisode(episode: number, maxEpisode: number): number {
  const upperBound = Math.max(1, maxEpisode);

  return Math.min(Math.max(episode, 1), upperBound);
}

// 生成播放起点；URL 参数优先，其次使用后端 playback.resume 恢复点。
export function getPlaybackStartState({
  episodeValue,
  maxEpisode,
  resume,
  timeValue,
}: PlaybackStartInput): PlaybackStartState {
  const explicitEpisode = parsePositiveInteger(episodeValue);
  const explicitTime = parsePositiveInteger(timeValue);
  const resumeEpisode =
    resume?.canResume && resume.episode ? resume.episode : 0;
  const activeEpisode = clampEpisode(
    explicitEpisode || resumeEpisode || 1,
    maxEpisode,
  );
  const resumeTime =
    resume?.canResume && clampEpisode(resumeEpisode || 1, maxEpisode) === activeEpisode
      ? Math.floor(resume.watchSeconds ?? 0)
      : 0;

  return {
    activeEpisode,
    initialTime: explicitTime || Math.max(0, resumeTime),
  };
}
