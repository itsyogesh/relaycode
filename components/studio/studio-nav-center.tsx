"use client";

import React from "react";
import { useStudio } from "@/context/studio-provider";
import { FileCode } from "lucide-react";

export function StudioNavCenter() {
  const { activeFile, isDirtySinceCompile } = useStudio();

  const fileName = activeFile?.name || "Untitled";

  return (
    <div className="flex items-center gap-2 text-sm">
      <FileCode className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-foreground">{fileName}</span>
      {isDirtySinceCompile && (
        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
      )}
    </div>
  );
}
