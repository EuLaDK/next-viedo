"use client";

import { Clock3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getHydrationSafeValue } from "@/lib/hydration-state";
import { useSearchHistoryStore } from "@/stores/use-search-history-store";

type SearchHistoryPanelProps = {
  query: string;
};

// 渲染搜索历史；query 变化时写入本地搜索历史。
export function SearchHistoryPanel({ query }: SearchHistoryPanelProps) {
  const hasMounted = useHasMounted();
  const storedItems = useSearchHistoryStore((state) => state.items);
  const addQuery = useSearchHistoryStore((state) => state.addQuery);
  const clearHistory = useSearchHistoryStore((state) => state.clearHistory);
  const items = getHydrationSafeValue(hasMounted, storedItems, []);

  useEffect(() => {
    addQuery(query);
  }, [addQuery, query]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Clock3 className="size-4 text-emerald-300" />
          搜索历史
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/45 hover:bg-white/10 hover:text-white"
          aria-label="清空搜索历史"
          title="清空搜索历史"
          onClick={clearHistory}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item}
            href={`/search?q=${encodeURIComponent(item)}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/62 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.08] hover:text-white"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
