import { Plus, Play, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { featuredVideo } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

// 渲染首页主推视频；当前无参数，后续可接入推荐接口返回的主视觉数据。
export function HeroFeature() {
  const feature = featuredVideo;

  return (
    <section
      aria-labelledby="hero-feature-title"
      className="relative overflow-hidden rounded-lg border border-white/10 bg-[#111827] text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.25),transparent_30%),radial-gradient(circle_at_84%_22%,rgba(56,189,248,0.2),transparent_34%)]" />

      <div className="relative grid min-h-[420px] gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="flex flex-col justify-end">
          <div className="mb-5 flex flex-wrap gap-2">
            {feature.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/82"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm font-medium text-emerald-300">
            {feature.subtitle}
          </p>
          <h1
            id="hero-feature-title"
            className="mt-3 max-w-xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl"
          >
            {feature.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            {feature.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/68">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Star className="size-4 fill-current" />
              {feature.score}
            </span>
            <span>{feature.update}</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
            >
              <Link href={getVideoWatchHref(feature.id, { from: "/" })}>
                <Play className="size-4 fill-current" />
                立即播放
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            >
              <Plus className="size-4" />
              加入片单
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative min-h-[260px] overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] shadow-2xl"
          style={{ background: feature.coverGradient }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.35),rgba(15,23,42,0.28)_42%,rgba(244,63,94,0.25)),radial-gradient(circle_at_70%_30%,rgba(125,211,252,0.65),transparent_24%)]" />
          <div className="absolute inset-x-8 bottom-8 h-28 rounded-lg bg-black/35 backdrop-blur-sm" />
          <div className="absolute left-8 top-8 h-16 w-44 rounded-lg bg-white/12" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/18 bg-white/10" />
          <div className="absolute bottom-12 left-12 space-y-3">
            <div className="h-4 w-56 rounded-full bg-white/70" />
            <div className="h-3 w-40 rounded-full bg-white/32" />
          </div>
          <div className="absolute bottom-12 right-12 flex size-14 items-center justify-center rounded-full bg-emerald-400 text-[#06130d] shadow-lg">
            <Play className="ml-0.5 size-6 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
}
