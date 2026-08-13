"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Renders text truncated with an ellipsis at `maxWidth`. Hovering always
 * shows the full text in a tooltip.
 */
export function TruncatedText({
  text,
  className,
  maxWidth = "16rem",
}: {
  text: string;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn("block truncate", className)}
            style={{ maxWidth }}
          >
            {text}
          </span>
        }
      />
      <TooltipContent side="top" align="start" className="max-w-sm">
        <span className="block whitespace-normal break-words">{text}</span>
      </TooltipContent>
    </Tooltip>
  );
}
