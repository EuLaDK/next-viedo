import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import type {
  ChannelFilterState,
  ChannelItem,
  ChannelSort,
} from "@/lib/mock-videos";

type FilterOption<TValue extends string = string> = {
  label: string;
  value?: TValue;
};

const sortItems: FilterOption<ChannelSort>[] = [
  { label: "综合排序", value: "default" },
  { label: "最新上线", value: "new" },
  { label: "最高热度", value: "hot" },
  { label: "高分优先", value: "score" },
];
const yearItems: FilterOption[] = [
  { label: "全部年份" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
];

type ChannelFilterBarProps = {
  channel: ChannelItem;
  filters: ChannelFilterState;
};

// 生成频道筛选链接；空值和默认排序不写入 query，让 URL 更干净。
function getChannelFilterHref(
  channel: ChannelItem,
  filters: ChannelFilterState,
  nextFilters: ChannelFilterState,
): string {
  const mergedFilters = {
    ...filters,
    ...nextFilters,
  };
  const searchParams = new URLSearchParams();

  if (mergedFilters.type) {
    searchParams.set("type", mergedFilters.type);
  }

  if (mergedFilters.year) {
    searchParams.set("year", mergedFilters.year);
  }

  if (mergedFilters.sort && mergedFilters.sort !== "default") {
    searchParams.set("sort", mergedFilters.sort);
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/channel/${channel.slug}?${queryString}`
    : `/channel/${channel.slug}`;
}

// 根据选中状态生成筛选项样式；类型选中使用绿色，其它组选中使用轻量白色。
function getFilterLinkClass(isActive: boolean, activeTone: "green" | "white") {
  if (isActive && activeTone === "green") {
    return "rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-[#06130d]";
  }

  if (isActive) {
    return "rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold text-white";
  }

  return "rounded-full px-3 py-1.5 text-xs font-medium text-white/55 transition-colors hover:bg-white/8 hover:text-white";
}

// 渲染频道页筛选条；channel 用于展示当前频道的关键词筛选项。
export function ChannelFilterBar({ channel, filters }: ChannelFilterBarProps) {
  const genreItems: FilterOption[] =
    channel.keywords.length > 0
      ? [
          { label: "全部类型" },
          ...channel.keywords.map((keyword) => ({
            label: keyword,
            value: keyword,
          })),
        ]
      : [{ label: "全部类型" }];

  return (
    <section
      aria-label="频道筛选"
      className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="size-4 text-emerald-300" />
        筛选
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {genreItems.map((item) => {
            const isActive = (filters.type ?? "") === (item.value ?? "");

            return (
              <Link
                key={item.label}
                href={getChannelFilterHref(channel, filters, {
                  type: item.value,
                })}
                aria-current={isActive ? "page" : undefined}
                className={getFilterLinkClass(isActive, "green")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {yearItems.map((item) => {
            const isActive = (filters.year ?? "") === (item.value ?? "");

            return (
              <Link
                key={item.label}
                href={getChannelFilterHref(channel, filters, {
                  year: item.value,
                })}
                aria-current={isActive ? "page" : undefined}
                className={getFilterLinkClass(isActive, "white")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {sortItems.map((item) => {
            const isActive = (filters.sort ?? "default") === item.value;

            return (
              <Link
                key={item.label}
                href={getChannelFilterHref(channel, filters, {
                  sort: item.value,
                })}
                aria-current={isActive ? "page" : undefined}
                className={getFilterLinkClass(isActive, "white")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
