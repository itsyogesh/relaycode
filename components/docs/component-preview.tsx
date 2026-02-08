"use client";

import { cn } from "@/lib/utils";

interface ComponentPreviewProps {
  children?: React.ReactNode;
  className?: string;
}

export function ComponentPreview({ children, className }: ComponentPreviewProps) {
  return (
    <div
      className={cn(
        "not-prose flex min-h-[200px] items-center justify-center rounded-lg border bg-background p-6",
        className
      )}
    >
      {children || (
        <p className="text-sm text-muted-foreground italic">
          Live preview requires a chain connection. See the Builder page for interactive usage.
        </p>
      )}
    </div>
  );
}
