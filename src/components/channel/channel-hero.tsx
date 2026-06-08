import { Flame, Play, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ChannelItem, VideoItem } from "@/lib/mock-videos";

type ChannelHeroProps = {
  channel: ChannelItem;
  video: VideoItem;
};

// 渲染频道页头部主推区域；channel 为当前频道信息，video 为频道内优先展示的视频。
export function ChannelHero({ channel, video }: ChannelHeroProps) {
  return (
    <section
      aria-labelledby="channel-hero-title"
      className="relative overflow-hidden rounded-lg border border-white/10 bg-[#111827] text-white"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${channel.accent}`} />
      <div
        className="absolute inset-y-0 right-0 hidden w-1/2 opacity-80 lg:block"
        style={{ background: video.background }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#111827_0%,rgba(17,24,39,0.86)_46%,rgba(17,24,39,0.28)_100%)]" />

      <div className="relative grid min-h-[360px] gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="flex max-w-3xl flex-col justify-end">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-[#06130d]">
              {channel.label}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/78">
              <Flame className="size-3.5 text-amber-300" />
              {video.heat}
            </span>
          </div>

          <p className="text-sm font-medium text-emerald-300">
            {channel.description}
          </p>
          <h1
            id="channel-hero-title"
            className="mt-3 text-4xl font-bold leading-tight tracking-normal sm:text-5xl"
          >
            {video.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            {video.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/68">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Star className="size-4 fill-current" />
              {video.score}
            </span>
            <span>{video.category}</span>
            <span>{video.update}</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
            >
              <Link href={`/watch/${video.id}`}>
                <Play className="size-4 fill-current" />
                立即播放
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            >
              <Link href="#channel-list">浏览全部</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
