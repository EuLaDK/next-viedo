"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type SyntheticEvent,
} from "react";

import { DanmakuOverlay } from "@/components/watch/danmaku-overlay";
import type { VideoItem } from "@/lib/mock-videos";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

type PlayerShellProps = {
  activeEpisode: number;
  initialTime?: number;
  video: VideoItem;
};

/* 生成当前播放标题；集数大于 1 时显示具体集数。 */
function getPlayerTitle(video: VideoItem, activeEpisode: number): string {
  return video.episodeCount > 1
    ? `${video.title} 第 ${activeEpisode} 集`
    : video.title;
}

/* 生成历史记录基础进度；多集内容展示集数，单集内容沿用视频原始进度标签。 */
function getBaseProgress(video: VideoItem, activeEpisode: number): string {
  return video.episodeCount > 1 ? `第 ${activeEpisode} 集` : video.progress;
}

/* 渲染播放页首屏播放器；video 为当前路由匹配到的视频详情数据。 */
export function PlayerShell({
  activeEpisode,
  initialTime = 0,
  video,
}: PlayerShellProps) {
  const addHistory = useWatchHistoryStore((state) => state.addHistory);
  const playerTitle = getPlayerTitle(video, activeEpisode);
  const baseProgress = getBaseProgress(video, activeEpisode);
  const interactionVideoId = `${video.id}-${activeEpisode}`;
  const hasSeekedRef = useRef(false);
  const lastSavedSecondRef = useRef(-1);
  const baseHistory = useMemo(
    () => ({
      id: video.id,
      title: playerTitle,
      category: video.category,
      progress: baseProgress,
      background: video.background,
      episode: activeEpisode,
    }),
    [
      activeEpisode,
      baseProgress,
      playerTitle,
      video.background,
      video.category,
      video.id,
    ],
  );

  useEffect(() => {
    hasSeekedRef.current = false;
    lastSavedSecondRef.current = -1;
  }, [activeEpisode, initialTime, video.id]);

  useEffect(() => {
    addHistory({
      ...baseHistory,
      watchSeconds: initialTime > 0 ? Math.floor(initialTime) : undefined,
    });
  }, [addHistory, baseHistory, initialTime]);

  /* 保存当前播放进度到观看历史；currentTime 和 duration 来自 video 元素事件。 */
  const saveHistory = useCallback(
    (currentTime: number, duration: number) => {
      const watchSeconds = Math.floor(currentTime);
      const durationSeconds =
        Number.isFinite(duration) && duration > 0
          ? Math.floor(duration)
          : undefined;

      addHistory({
        ...baseHistory,
        watchSeconds: watchSeconds > 0 ? watchSeconds : undefined,
        durationSeconds,
      });
    },
    [addHistory, baseHistory],
  );

  /* 恢复历史进度；metadata 加载后才能安全设置 currentTime。 */
  const handleLoadedMetadata = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const player = event.currentTarget;

      if (initialTime > 0 && !hasSeekedRef.current) {
        const maxTime =
          Number.isFinite(player.duration) && player.duration > 1
            ? player.duration - 1
            : initialTime;

        player.currentTime = Math.min(initialTime, maxTime);
        hasSeekedRef.current = true;
      }

      saveHistory(player.currentTime, player.duration);
    },
    [initialTime, saveHistory],
  );

  /* 节流写入播放进度；每 10 秒或接近结束时更新一次历史记录。 */
  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const player = event.currentTarget;
      const currentSecond = Math.floor(player.currentTime);
      const isNearEnd =
        Number.isFinite(player.duration) &&
        player.duration > 0 &&
        player.duration - player.currentTime < 5;

      if (currentSecond < 1) {
        return;
      }

      if (
        lastSavedSecondRef.current >= 0 &&
        currentSecond - lastSavedSecondRef.current < 10 &&
        !isNearEnd
      ) {
        return;
      }

      lastSavedSecondRef.current = currentSecond;
      saveHistory(player.currentTime, player.duration);
    },
    [saveHistory],
  );

  /* 记录完播进度；ended 事件保证最后一次进度不会被节流跳过。 */
  const handleEnded = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const player = event.currentTarget;

      saveHistory(player.duration, player.duration);
    },
    [saveHistory],
  );

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black text-white shadow-2xl">
        <div className="relative aspect-video min-h-[18rem] bg-black">
          <video
            key={`${video.id}-${activeEpisode}`}
            aria-label={`${playerTitle} 播放器`}
            className="h-full w-full bg-black object-contain"
            controls
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            preload="metadata"
            src={video.source}
          >
            当前浏览器不支持 HTML5 视频播放。
          </video>
          <DanmakuOverlay videoId={interactionVideoId} />
          <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-[calc(100%-2.5rem)] rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white/78 backdrop-blur">
            {video.subtitle}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0b0f16] p-5">
          <h1 className="text-2xl font-bold">{playerTitle}</h1>
          <p className="mt-2 text-sm text-white/52">
            {video.category} · {video.update}
          </p>
        </div>
      </div>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">选集</p>
            <h2 className="mt-1 text-lg font-semibold">{video.title}</h2>
          </div>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/56">
            {video.episodeCount} 集
          </span>
        </div>

        <div className="grid max-h-[28rem] gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {video.episodes.map((item) => {
            const isActive = item.episode === activeEpisode;
            const duration = isActive
              ? "正在播放"
              : item.duration === "正在播放"
                ? "45 分钟"
                : item.duration;

            return (
              <Link
                key={item.episode}
                href={`/watch/${video.id}?episode=${item.episode}`}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "flex items-center justify-between rounded-md border border-emerald-300/40 bg-emerald-400/14 px-3 py-3 text-left text-emerald-100"
                    : "flex items-center justify-between rounded-md border border-white/8 bg-white/[0.03] px-3 py-3 text-left text-white/68 transition-colors hover:bg-white/[0.07] hover:text-white"
                }
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-xs">{duration}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
