import { getVideoWatchHref } from "./video-card-url";

export type PlayerOption<TValue extends string | number> = {
  label: string;
  value: TValue;
};

export type DanmakuSpeed = "slow" | "normal" | "fast";

export const playbackRateOptions: PlayerOption<number>[] = [
  { label: "0.75x", value: 0.75 },
  { label: "1.0x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2.0x", value: 2 },
];

export const danmakuSpeedOptions: PlayerOption<DanmakuSpeed>[] = [
  { label: "慢速", value: "slow" },
  { label: "标准", value: "normal" },
  { label: "快速", value: "fast" },
];

const danmakuDurationBySpeed: Record<DanmakuSpeed, number> = {
  slow: 16,
  normal: 12,
  fast: 8,
};

// 生成下一集播放地址；activeEpisode 为当前集数，totalEpisodes 为当前可播放集数，returnHref 为播放页返回来源。
export function getNextEpisodeHref(
  videoId: string,
  activeEpisode: number,
  totalEpisodes: number,
  returnHref?: string,
): string | null {
  const nextEpisode = activeEpisode + 1;

  if (nextEpisode > totalEpisodes) {
    return null;
  }

  return getVideoWatchHref(videoId, {
    episode: nextEpisode,
    from: returnHref,
  });
}

// 获取弹幕动画时长；speed 越快，弹幕横跨播放器的时间越短。
export function getDanmakuDurationBySpeed(speed: DanmakuSpeed): number {
  return danmakuDurationBySpeed[speed];
}

// 格式化播放器时间；seconds 为 video 元素返回的秒数。
export function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}
