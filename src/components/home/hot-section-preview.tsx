import Link from "next/link";

import { hotVideos } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

// 渲染首页热播预览列表；当前无参数，后续可接入热播内容接口。
export function HotSectionPreview() {
  return (
    <section aria-labelledby="hot-section-title" className="text-white">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-300">继续发现</p>
          <h2 id="hot-section-title" className="mt-1 text-2xl font-bold">
            重磅热播
          </h2>
        </div>
        <Link
          href="#"
          className="shrink-0 text-sm font-medium text-white/52 transition-colors hover:text-emerald-300"
        >
          查看更多
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {hotVideos.map((item) => (
          <Link
            key={item.id}
            href={getVideoWatchHref(item.id, { from: "/" })}
            className="group min-w-0"
          >
            <div
              className="aspect-[3/4] overflow-hidden rounded-lg border border-white/10 transition-colors group-hover:border-emerald-300/35"
              style={{ background: item.coverGradient }}
            >
              <div className="flex h-full flex-col justify-between p-3">
                <span className="w-fit rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
                  {item.progress}
                </span>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-white/46" />
                  <div className="h-2 w-1/2 rounded-full bg-white/24" />
                </div>
              </div>
            </div>
            <h3 className="mt-3 truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
              {item.title}
            </h3>
            <p className="mt-1 truncate text-xs text-white/48">
              {item.category}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
