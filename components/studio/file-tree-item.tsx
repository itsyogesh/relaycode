"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileCode, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  onRename: (newName: string) => boolean; // returns false if rejected (duplicate)
  onDelete: () => void;
  canDelete: boolean;
}

export function FileTreeItem({
  name,
  isActive,
  onClick,
  onRename,
  onDelete,
  canDelete,
}: FileTreeItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const dotIndex = renameValue.lastIndexOf(".");
      inputRef.current.setSelectionRange(0, dotIndex > 0 ? dotIndex : renameValue.length);
    }
  }, [isRenaming]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === name) {
      setIsRenaming(false);
      setRenameError(null);
      return;
    }
    // Ensure .sol extension
    const finalName = trimmed.endsWith(".sol") ? trimmed : `${trimmed}.sol`;
    const accepted = onRename(finalName);
    if (accepted) {
      setIsRenaming(false);
      setRenameError(null);
    } else {
      setRenameError("Name already exists");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setIsRenaming(false);
      setRenameValue(name);
      setRenameError(null);
    }
  };

  if (isRenaming) {
    return (
      <div className="px-2 py-0.5">
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => {
            setRenameValue(e.target.value);
            setRenameError(null);
          }}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full text-xs bg-background border rounded px-1.5 py-0.5 outline-none",
            renameError ? "border-red-500" : "border-primary"
          )}
        />
        {renameError && (
          <p className="text-[10px] text-red-500 mt-0.5">{renameError}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 px-2 py-1 cursor-pointer rounded-sm text-xs hover:bg-accent/50 transition-colors",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
    >
      <FileCode className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{name}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-0.5 rounded hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            setRenameValue(name);
            setIsRenaming(true);
          }}
          title="Rename"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
        {canDelete && (
          <button
            className="p-0.5 rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
