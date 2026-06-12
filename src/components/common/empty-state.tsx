import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { getUiStateContent } from "@/lib/ui-state-content";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  description?: string;
  preset?: string;
  title?: string;
};

// 渲染列表和面板的空状态；preset 指向共享文案，title 和 description 可按场景覆盖。
export function EmptyState({
  action,
  className,
  compact = false,
  description,
  preset,
  title,
}: EmptyStateProps) {
  const content = getUiStateContent(preset);
  const stateTitle = title ?? content.title;
  const stateDescription = description ?? content.description;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center text-white",
        compact && "p-5",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex size-11 items-center justify-center rounded-lg bg-white/8 text-emerald-300",
          compact && "size-9",
        )}
      >
        <Inbox className={cn("size-5", compact && "size-4")} />
      </div>
      <p className={cn("mt-4 text-lg font-semibold", compact && "text-sm")}>
        {stateTitle}
      </p>
      <p
        className={cn(
          "mx-auto mt-2 max-w-md text-sm leading-6 text-white/52",
          compact && "text-xs leading-5 text-white/46",
        )}
      >
        {stateDescription}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
