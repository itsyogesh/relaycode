"use client";

import React from "react";
import { Info } from "lucide-react";

interface ContextHintProps {
  text: string;
  icon?: React.ReactNode;
}

export function ContextHint({ text, icon }: ContextHintProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
      {icon ?? <Info className="h-3 w-3 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}
