import type { ReactNode } from "react";

import { ChannelNav } from "@/components/home/channel-nav";
import { SiteHeader } from "@/components/home/site-header";
import { ProfileNav } from "@/components/profile/profile-nav";

type ProfileLayoutProps = {
  children: ReactNode;
};

// 渲染个人中心统一布局；children 为各个 profile 子页面内容。
export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:py-8">
          <ProfileNav />
          {children}
        </div>
      </main>
    </div>
  );
}
