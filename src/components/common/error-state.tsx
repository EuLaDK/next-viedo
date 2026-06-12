import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { getUiStateContent } from "@/lib/ui-state-content";

type ErrorStateProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  preset?: string;
  title?: string;
};

// 渲染通用错误态；action 可传入刷新、返回或重试按钮。
export function ErrorState({
  action,
  className,
  description,
  preset = "error",
  title,
}: ErrorStateProps) {
  const content = getUiStateContent(preset);

  return (
    <div
      className={cn(
        "rounded-lg border border-red-300/18 bg-red-950/20 p-8 text-center text-white",
        className,
      )}
      role="alert"
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-red-300/10 text-red-200">
        <TriangleAlert className="size-5" />
      </div>
      <p className="mt-4 text-lg font-semibold">{title ?? content.title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/52">
        {description ?? content.description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
