import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

interface StatusBadgeProps {
  status: "live" | "soon" | "beta";
  className?: string;
}

const statusConfig = {
  live: {
    color: "bg-green-500",
    text: "text-green-500",
    border: "border-green-500/20",
    bg: "bg-green-500/10",
    glow: "shadow-[0_0_8px_0_rgba(34,197,94,0.4)]",
  },
  soon: {
    color: "bg-yellow-500",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/10",
    glow: "shadow-[0_0_8px_0_rgba(234,179,8,0.4)]",
  },
  beta: {
    color: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/10",
    glow: "shadow-[0_0_8px_0_rgba(59,130,246,0.4)]",
  },
};

const statusText = {
  live: "LIVE",
  soon: "COMING SOON",
  beta: "BETA",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        jetbrainsMono.variable,
        "font-mono tracking-wider",
        className
      )}
    >
      <div
        className={cn("relative flex h-1.5 w-1.5 items-center justify-center")}
      >
        <div
          className={cn(
            "absolute size-full rounded-full",
            config.color,
            config.glow,
            "animate-pulse"
          )}
        />
        <div
          className={cn(
            "absolute size-full rounded-full",
            config.color,
            "opacity-40 blur-[1px]"
          )}
        />
        <div className={cn("absolute size-[4px] rounded-full bg-current")} />
      </div>
      {statusText[status]}
    </div>
  );
}
