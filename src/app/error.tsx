"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// 渲染全站路由错误态；reset 由 Next.js 注入，用于重新尝试当前路由。
export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-[#06130d] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ErrorState
          action={
            <Button
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
              onClick={reset}
            >
              重新加载
            </Button>
          }
        />
      </div>
    </main>
  );
}
