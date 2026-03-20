"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Loader2, Info } from "lucide-react";

export interface LogEntry {
  id: string;
  type: "info" | "success" | "error" | "pending";
  message: string;
  timestamp: Date;
}

interface TransactionLogProps {
  entries: LogEntry[];
}

const ICONS = {
  info: <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />,
  success: <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />,
  error: <X className="h-3.5 w-3.5 text-red-500 shrink-0" />,
  pending: <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />,
};

export function TransactionLog({ entries }: TransactionLogProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1.5 p-2">
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No activity yet
          </p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5">{ICONS[entry.type]}</span>
            <span className="text-muted-foreground flex-1 break-all">
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
