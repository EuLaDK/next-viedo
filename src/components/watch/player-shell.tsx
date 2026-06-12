"use client";

import Link from "next/link";
import {
  Maximize2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { DanmakuOverlay } from "@/components/watch/danmaku-overlay";
import type { VideoItem } from "@/lib/mock-videos";
import {
  danmakuSpeedOptions,
  formatPlayerTime,
  getDanmakuDurationBySpeed,
  getNextEpisodeHref,
  playbackRateOptions,
  type DanmakuSpeed,
} from "@/lib/player-controls";
import { getVideoWatchHref } from "@/lib/video-card-url";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

type PlayerShellProps = {
  activeEpisode: number;
  initialTime?: number;
  returnHref: string;
  video: VideoItem;
};

/* 生成当前播放标题；集数大于 1 时显示具体集数。 */
function getPlayerTitle(video: VideoItem, activeEpisode: number): string {
  return video.totalEpisodes > 1
    ? `${video.title} 第 ${activeEpisode} 集`
    : video.title;
}

/* 生成历史记录基础进度；多集内容展示集数，单集内容沿用视频原始进度标签。 */
function getBaseProgress(video: VideoItem, activeEpisode: number): string {
  return video.totalEpisodes > 1 ? `第 ${activeEpisode} 集` : video.progress;
}

/* 渲染播放页首屏播放器；video 为当前路由匹配到的视频详情数据。 */
export function PlayerShell({
  activeEpisode,
  initialTime = 0,
  returnHref,
  video,
}: PlayerShellProps) {
  const addHistory = useWatchHistoryStore((state) => state.addHistory);
  const playerTitle = getPlayerTitle(video, activeEpisode);
  const baseProgress = getBaseProgress(video, activeEpisode);
  const playerKey = `${video.id}-${activeEpisode}`;
  const interactionVideoId = playerKey;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSeekedRef = useRef(false);
  const lastSavedSecondRef = useRef(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [danmakuEnabled, setDanmakuEnabled] = useState(true);
  const [danmakuOpacity, setDanmakuOpacity] = useState(0.85);
  const [danmakuSpeed, setDanmakuSpeed] = useState<DanmakuSpeed>("normal");
  const [duration, setDuration] = useState(0);
  const [endedPlayerKey, setEndedPlayerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [loadedPlayerKey, setLoadedPlayerKey] = useState("");
  const [playingPlayerKey, setPlayingPlayerKey] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.78);
  const nextEpisodeHref = getNextEpisodeHref(
    video.id,
    activeEpisode,
    video.episodes.length,
    returnHref,
  );
  const nextEpisode = video.episodes.find(
    (item) => item.episode === activeEpisode + 1,
  );
  const isCurrentPlayerLoaded = loadedPlayerKey === playerKey;
  const isEnded = endedPlayerKey === playerKey;
  const isPlaying = playingPlayerKey === playerKey;
  const visibleCurrentTime = isCurrentPlayerLoaded ? currentTime : 0;
  const visibleDuration = isCurrentPlayerLoaded ? duration : 0;
  const progressValue =
    visibleDuration > 0
      ? Math.min(visibleCurrentTime, visibleDuration)
      : visibleCurrentTime;
  const progressPercent =
    visibleDuration > 0
      ? Math.min(100, Math.max(0, (progressValue / visibleDuration) * 100))
      : 0;
  const danmakuDuration = getDanmakuDurationBySpeed(danmakuSpeed);
  const baseHistory = useMemo(
    () => ({
      id: video.id,
      title: playerTitle,
      category: video.category,
      progress: baseProgress,
      coverGradient: video.coverGradient,
      episode: activeEpisode,
    }),
    [
      activeEpisode,
      baseProgress,
      playerTitle,
      video.coverGradient,
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

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

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

      player.playbackRate = playbackRate;
      player.volume = volume;
      player.muted = isMuted;
      setLoadedPlayerKey(playerKey);
      setEndedPlayerKey(null);
      setDuration(Number.isFinite(player.duration) ? player.duration : 0);

      if (initialTime > 0 && !hasSeekedRef.current) {
        const maxTime =
          Number.isFinite(player.duration) && player.duration > 1
            ? player.duration - 1
            : initialTime;

        player.currentTime = Math.min(initialTime, maxTime);
        hasSeekedRef.current = true;
      }

      setCurrentTime(player.currentTime);
      saveHistory(player.currentTime, player.duration);
    },
    [initialTime, isMuted, playbackRate, playerKey, saveHistory, volume],
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

      setCurrentTime(player.currentTime);
      setDuration(Number.isFinite(player.duration) ? player.duration : 0);
      setLoadedPlayerKey(playerKey);

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
    [playerKey, saveHistory],
  );

  /* 记录完播进度；ended 事件保证最后一次进度不会被节流跳过。 */
  const handleEnded = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const player = event.currentTarget;

      setCurrentTime(player.duration);
      setDuration(Number.isFinite(player.duration) ? player.duration : 0);
      setLoadedPlayerKey(playerKey);
      setEndedPlayerKey(playerKey);
      setPlayingPlayerKey(null);
      saveHistory(player.duration, player.duration);
    },
    [playerKey, saveHistory],
  );

  /* 同步播放态；play 事件由 video 元素触发。 */
  const handlePlay = useCallback(() => {
    setEndedPlayerKey(null);
    setPlayingPlayerKey(playerKey);
  }, [playerKey]);

  /* 同步暂停态；pause 事件由 video 元素触发。 */
  const handlePause = useCallback(() => {
    setPlayingPlayerKey(null);
  }, []);

  /* 切换播放暂停；由自定义播放按钮触发。 */
  const handleTogglePlay = useCallback(() => {
    const player = videoRef.current;

    if (!player) {
      return;
    }

    if (player.paused) {
      void player.play();
      return;
    }

    player.pause();
  }, []);

  /* 拖动进度条；value 为目标秒数。 */
  const handleSeek = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const player = videoRef.current;
    const nextTime = Number(event.target.value);

    if (!player || Number.isNaN(nextTime)) {
      return;
    }

    player.currentTime = nextTime;
    setCurrentTime(nextTime);
    setLoadedPlayerKey(playerKey);
    setEndedPlayerKey(null);
  }, [playerKey]);

  /* 切换播放倍速；value 来自倍速下拉框。 */
  const handlePlaybackRateChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextRate = Number(event.target.value);

      if (Number.isNaN(nextRate)) {
        return;
      }

      setPlaybackRate(nextRate);
    },
    [],
  );

  /* 切换弹幕速度；value 来自弹幕速度下拉框。 */
  const handleDanmakuSpeedChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setDanmakuSpeed(event.target.value as DanmakuSpeed);
    },
    [],
  );

  /* 调整弹幕透明度；value 为 35-100 的百分比。 */
  const handleDanmakuOpacityChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDanmakuOpacity(Number(event.target.value) / 100);
    },
    [],
  );

  /* 调整音量；value 为 0-100 的百分比。 */
  const handleVolumeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const player = videoRef.current;
    const nextVolume = Number(event.target.value) / 100;

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);

    if (!player) {
      return;
    }

    player.volume = nextVolume;
    player.muted = nextVolume === 0;
  }, []);

  /* 切换静音；同步 video 元素 muted 状态。 */
  const handleToggleMuted = useCallback(() => {
    const player = videoRef.current;
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (!player) {
      return;
    }

    player.muted = nextMuted;
  }, [isMuted]);

  /* 重新播放当前集；用于播放结束浮层。 */
  const handleReplay = useCallback(() => {
    const player = videoRef.current;

    if (!player) {
      return;
    }

    player.currentTime = 0;
    setCurrentTime(0);
    setLoadedPlayerKey(playerKey);
    setEndedPlayerKey(null);
    setPlayingPlayerKey(playerKey);
    void player.play();
  }, [playerKey]);

  /* 切换全屏；优先让播放器容器进入全屏。 */
  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void container.requestFullscreen();
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black text-white shadow-2xl">
        <div
          ref={containerRef}
          className="relative aspect-video min-h-[18rem] bg-black"
        >
          <video
            ref={videoRef}
            key={playerKey}
            aria-label={`${playerTitle} 播放器`}
            className="h-full w-full bg-black object-contain"
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={handlePause}
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            preload="metadata"
            src={video.sourceUrl}
          >
            当前浏览器不支持 HTML5 视频播放。
          </video>
          <DanmakuOverlay
            duration={danmakuDuration}
            enabled={danmakuEnabled}
            opacity={danmakuOpacity}
            videoId={interactionVideoId}
          />
          <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-[calc(100%-2.5rem)] rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white/78 backdrop-blur">
            {video.subtitle}
          </div>

          {isEnded ? (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/62 px-4 text-center backdrop-blur-sm">
              <div className="max-w-sm">
                <p className="text-sm font-medium text-emerald-300">播放结束</p>
                <h2 className="mt-2 text-2xl font-bold">{playerTitle}</h2>
                <p className="mt-2 text-sm text-white/58">
                  {nextEpisodeHref
                    ? `继续观看 ${nextEpisode?.title ?? "下一集"}`
                    : "本片已播放完，可以重看或去下方看看相关推荐。"}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {nextEpisodeHref ? (
                    <Button
                      asChild
                      className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
                    >
                      <Link href={nextEpisodeHref}>
                        <SkipForward className="size-4" />
                        下一集
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="border border-white/12 bg-white/8 text-white hover:bg-white/14"
                    onClick={handleReplay}
                  >
                    <RotateCcw className="size-4" />
                    重新播放
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/92 via-black/64 to-transparent px-3 pb-3 pt-14 sm:px-4">
            <input
              type="range"
              min={0}
              max={visibleDuration || 0}
              step={0.1}
              value={progressValue}
              aria-label="播放进度"
              className="mb-3 h-1.5 w-full cursor-pointer accent-emerald-400"
              style={{
                background: `linear-gradient(90deg, #34d399 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
              }}
              onChange={handleSeek}
            />

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/72">
              <Button
                variant="ghost"
                size="icon-lg"
                className="rounded-full bg-white/10 text-white hover:bg-white/18 hover:text-white"
                aria-label={isPlaying ? "暂停" : "播放"}
                title={isPlaying ? "暂停" : "播放"}
                onClick={handleTogglePlay}
              >
                {isPlaying ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 fill-current" />
                )}
              </Button>

              <span className="tabular-nums text-white/68">
                {formatPlayerTime(visibleCurrentTime)} /{" "}
                {formatPlayerTime(visibleDuration)}
              </span>

              {nextEpisodeHref ? (
                <Button
                  asChild
                  variant="ghost"
                  className="hidden border border-white/10 bg-white/8 text-white/72 hover:bg-white/14 hover:text-white sm:inline-flex"
                >
                  <Link href={nextEpisodeHref}>
                    <SkipForward className="size-4" />
                    下一集
                  </Link>
                </Button>
              ) : null}

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  className={
                    danmakuEnabled
                      ? "h-8 rounded-full bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
                      : "h-8 rounded-full bg-white/8 text-white/62 hover:bg-white/14 hover:text-white"
                  }
                  aria-pressed={danmakuEnabled}
                  onClick={() => setDanmakuEnabled((value) => !value)}
                >
                  <Radio className="size-4" />
                  弹幕
                </Button>

                <label className="hidden items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-white/64 md:flex">
                  透明度
                  <input
                    type="range"
                    min={35}
                    max={100}
                    step={5}
                    value={Math.round(danmakuOpacity * 100)}
                    aria-label="弹幕透明度"
                    className="h-1 w-16 cursor-pointer accent-emerald-400"
                    onChange={handleDanmakuOpacityChange}
                  />
                </label>

                <label className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-white/64">
                  弹幕速度
                  <select
                    value={danmakuSpeed}
                    aria-label="弹幕速度"
                    className="bg-transparent text-white outline-none"
                    onChange={handleDanmakuSpeedChange}
                  >
                    {danmakuSpeedOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-white/64">
                  倍速
                  <select
                    value={playbackRate}
                    aria-label="播放倍速"
                    className="bg-transparent text-white outline-none"
                    onChange={handlePlaybackRateChange}
                  >
                    {playbackRateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="hidden items-center gap-2 rounded-full bg-white/8 px-2 py-1 md:flex">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-white/70 hover:bg-white/12 hover:text-white"
                    aria-label={isMuted ? "取消静音" : "静音"}
                    title={isMuted ? "取消静音" : "静音"}
                    onClick={handleToggleMuted}
                  >
                    {isMuted ? (
                      <VolumeX className="size-3.5" />
                    ) : (
                      <Volume2 className="size-3.5" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={isMuted ? 0 : Math.round(volume * 100)}
                    aria-label="播放音量"
                    className="h-1 w-16 cursor-pointer accent-emerald-400"
                    onChange={handleVolumeChange}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/70 hover:bg-white/12 hover:text-white"
                  aria-label="全屏播放"
                  title="全屏播放"
                  onClick={handleToggleFullscreen}
                >
                  <Maximize2 className="size-4" />
                </Button>
              </div>
            </div>
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
            {video.totalEpisodes} 集
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
                href={getVideoWatchHref(video.id, {
                  episode: item.episode,
                  from: returnHref,
                })}
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
