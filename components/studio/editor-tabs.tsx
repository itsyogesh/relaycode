"use client";

import React from "react";
import { useStudio } from "@/context/studio-provider";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function EditorTabs() {
  const { state, dispatch, isFileDirty } = useStudio();

  const handleCreateFile = () => {
    let name = "Untitled.sol";
    let counter = 1;
    while (Object.values(state.files).some((f) => f.name === name)) {
      name = `Untitled${counter}.sol`;
      counter++;
    }
    dispatch({ type: "CREATE_FILE", name, content: "" });
  };

  return (
    <div className="flex items-center h-9 min-h-9 bg-muted/30 border-b overflow-x-auto">
      {state.openTabs.map((tab) => {
        const file = state.files[tab.fileId];
        if (!file) return null;
        const isActive = state.activeTabId === tab.fileId;

        return (
          <div
            key={tab.fileId}
            className={cn(
              "group flex items-center gap-1.5 px-3 h-full text-xs cursor-pointer border-r border-border transition-colors shrink-0",
              isActive
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:bg-accent/30"
            )}
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", fileId: tab.fileId })}
          >
            <span className="truncate max-w-[120px]">{file.name}</span>
            {isFileDirty(tab.fileId) && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
            )}
            <button
              className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "CLOSE_TAB", fileId: tab.fileId });
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      <button
        className="flex items-center justify-center w-8 h-full text-muted-foreground hover:bg-accent/30 transition-colors shrink-0"
        onClick={handleCreateFile}
        title="New file"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
