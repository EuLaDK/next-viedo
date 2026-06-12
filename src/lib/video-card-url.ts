export type VideoWatchHrefOptions = {
  episode?: number;
  from?: string;
};

// 规范播放页返回地址；from 为 URL 查询参数中的来源路径，仅允许站内非播放页路径。
export function getSafeWatchReturnHref(from?: string): string {
  const returnHref = from?.trim() ?? "";

  if (
    !returnHref ||
    !returnHref.startsWith("/") ||
    returnHref.startsWith("//") ||
    returnHref.startsWith("/watch/")
  ) {
    return "/";
  }

  return returnHref;
}

// 生成视频播放页链接；videoId 为视频唯一标识，options 用于保留集数和返回路径。
export function getVideoWatchHref(
  videoId: string,
  options: VideoWatchHrefOptions = {},
): string {
  const searchParams = new URLSearchParams();

  if (options.episode && options.episode > 1) {
    searchParams.set("episode", String(options.episode));
  }

  if (options.from) {
    searchParams.set("from", getSafeWatchReturnHref(options.from));
  }

  const queryString = searchParams.toString();

  return queryString ? `/watch/${videoId}?${queryString}` : `/watch/${videoId}`;
}
