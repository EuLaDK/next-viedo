import { ChannelNav } from "@/components/home/channel-nav";
import { HeroFeature } from "@/components/home/hero-feature";
import { HotSectionPreview } from "@/components/home/hot-section-preview";
import { RecommendationGrid } from "@/components/home/recommendation-grid";
import { SiteHeader } from "@/components/home/site-header";

// 渲染在线视频首页入口；当前无参数，分阶段挂载后续首页组件。
export default function Home() {
  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <HeroFeature />
            <RecommendationGrid />
          </div>
          <HotSectionPreview />
        </div>
      </main>
    </div>
  );
}
