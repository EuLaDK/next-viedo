import { CirclePlay, Crown } from "lucide-react";
import Link from "next/link";

import type { VideoItem } from "@/lib/mock-videos";
import { getSearchHighlightSegments } from "@/lib/search-highlight";
import { getVideoWatchHref } from "@/lib/video-card-url";
import { isVipVideoContent } from "@/lib/vip-membership";

type VideoPosterCardProps = {
  highlightQuery?: string;
  returnHref?: string;
  titleAs?: "h2" | "h3";
  video: VideoItem;
};

// 渲染带搜索高亮的文本；keyword 为空时保持普通文案。
function HighlightedText({
  keyword,
  text,
}: {
  keyword?: string;
  text: string;
}) {
  return (
    <>
      {getSearchHighlightSegments(text, keyword ?? "").map((segment, index) => (
        <span
          key={`${segment.text}-${index}`}
          className={segment.highlighted ? "text-emerald-300" : undefined}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

// 渲染竖版视频海报卡片；video 提供展示数据，titleAs 控制页面语义标题层级。
export function VideoPosterCard({
  highlightQuery,
  returnHref,
  titleAs: Title = "h3",
  video,
}: VideoPosterCardProps) {
  const isVipContent = isVipVideoContent(video);

  return (
    <Link
      href={getVideoWatchHref(video.id, { from: returnHref })}
      className="group min-w-0"
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/10 transition-colors group-hover:border-emerald-300/35"
        style={{ background: video.coverGradient }}
      >
        <span className="absolute left-3 top-3 rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
          {video.progress}
        </span>
        {isVipContent ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-amber-300 px-2 py-1 text-xs font-bold text-[#211504]">
            <Crown className="size-3" />
            VIP
          </span>
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-300 text-[#06130d]">
            <CirclePlay className="size-6" />
          </span>
        </div>
        <div className="absolute inset-x-3 bottom-3 space-y-2">
          <div className="h-3 w-3/4 rounded-full bg-white/56" />
          <div className="h-2 w-1/2 rounded-full bg-white/28" />
        </div>
      </div>
      <Title className="mt-3 truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
        <HighlightedText keyword={highlightQuery} text={video.title} />
      </Title>
      <p className="mt-1 truncate text-xs text-white/48">
        <HighlightedText keyword={highlightQuery} text={video.category} />
      </p>
    </Link>
  );
}

type VideoLandscapeCardProps = {
  returnHref?: string;
  titleAs?: "h2" | "h3";
  video: VideoItem;
};

// 渲染横版视频推荐卡片；video 提供展示数据，titleAs 控制页面语义标题层级。
export function VideoLandscapeCard({
  returnHref,
  titleAs: Title = "h3",
  video,
}: VideoLandscapeCardProps) {
  const isVipContent = isVipVideoContent(video);

  return (
    <Link
      href={getVideoWatchHref(video.id, { from: returnHref })}
      className="group min-w-0"
    >
      <div
        className="relative aspect-video overflow-hidden rounded-lg border border-white/10 transition-colors group-hover:border-emerald-300/35"
        style={{ background: video.coverGradient }}
      >
        <span className="absolute left-3 top-3 rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
          {video.badge}
        </span>
        {isVipContent ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-amber-300 px-2 py-1 text-xs font-bold text-[#211504]">
            <Crown className="size-3" />
            VIP
          </span>
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-emerald-300 text-[#06130d]">
            <CirclePlay className="size-6" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-xs text-white/72">
          <span>精选片段</span>
          <span>{video.duration}</span>
        </div>
      </div>
      <Title className="mt-3 truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
        {video.title}
      </Title>
      <p className="mt-1 truncate text-xs text-white/48">{video.category}</p>
    </Link>
  );
}
