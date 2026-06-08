import Link from "next/link";

import { channelItems } from "@/lib/mock-videos";

type ChannelNavProps = {
  activeSlug?: string;
};

// 渲染首页频道导航；activeSlug 用于标记当前选中的频道。
export function ChannelNav({ activeSlug = "featured" }: ChannelNavProps) {
  return (
    <section className="border-b border-white/8 bg-[#0a0f17]/95 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <nav
          aria-label="频道导航"
          className="flex h-14 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {channelItems.map((channel) => {
            const isActive = channel.slug === activeSlug;

            return (
              <Link
                key={channel.slug}
                href={
                  channel.slug === "featured" ? "/" : `/channel/${channel.slug}`
                }
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#06130d]"
                    : "shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white/68 transition-colors hover:bg-white/8 hover:text-white"
                }
              >
                {channel.label}
              </Link>
            );
          })}
          <Link
            href="/rank"
            aria-current={activeSlug === "rank" ? "page" : undefined}
            className={
              activeSlug === "rank"
                ? "shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#06130d]"
                : "shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white/68 transition-colors hover:bg-white/8 hover:text-white"
            }
          >
            排行榜
          </Link>
        </nav>
      </div>
    </section>
  );
}
