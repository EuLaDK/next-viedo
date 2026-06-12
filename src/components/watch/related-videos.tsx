import Link from "next/link";

import { VideoLandscapeCard } from "@/components/video/video-card";
import type { VideoItem } from "@/lib/mock-videos";

type RelatedVideosProps = {
  returnHref: string;
  videos: VideoItem[];
};

// 渲染播放页相关推荐列表；videos 为根据当前视频筛选出的相似内容。
export function RelatedVideos({ returnHref, videos }: RelatedVideosProps) {
  return (
    <section aria-labelledby="related-videos-title" className="text-white">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-300">看完继续</p>
          <h2 id="related-videos-title" className="mt-1 text-2xl font-bold">
            相关推荐
          </h2>
        </div>
        <Link
          href="#"
          className="shrink-0 text-sm font-medium text-white/52 transition-colors hover:text-emerald-300"
        >
          查看更多
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((item) => (
          <VideoLandscapeCard
            key={item.id}
            returnHref={returnHref}
            video={item}
          />
        ))}
      </div>
    </section>
  );
}
