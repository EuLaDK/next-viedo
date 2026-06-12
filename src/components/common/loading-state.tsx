import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { getUiStateContent } from "@/lib/ui-state-content";

type LoadingStateProps = {
  className?: string;
  description?: string;
  preset?: string;
  title?: string;
};

// 渲染通用加载态；preset 默认为 loading，也支持页面覆盖标题和描述。
export function LoadingState({
  className,
  description,
  preset = "loading",
  title,
}: LoadingStateProps) {
  const content = getUiStateContent(preset);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center text-white",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="mx-auto size-8 animate-spin text-emerald-300" />
      <p className="mt-4 text-lg font-semibold">{title ?? content.title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/52">
        {description ?? content.description}
      </p>
    </div>
  );
}
