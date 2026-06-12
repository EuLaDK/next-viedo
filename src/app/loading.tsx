import { LoadingState } from "@/components/common/loading-state";

// 渲染全站路由加载态；Next.js 在页面或布局挂起时会自动展示。
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#06130d] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <LoadingState />
      </div>
    </main>
  );
}
