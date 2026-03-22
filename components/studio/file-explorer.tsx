"use client";

import React, { useState, useRef } from "react";
import { useStudio } from "@/context/studio-provider";
import { FileTreeItem } from "./file-tree-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, Info } from "lucide-react";

export function FileExplorer() {
  const { state, dispatch } = useStudio();
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = Object.values(state.files).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const filtered = searchQuery
    ? files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  const canDelete = Object.keys(state.files).length > 1;

  const handleCreateFile = () => {
    // Generate unique name
    let name = "Untitled.sol";
    let counter = 1;
    while (Object.values(state.files).some((f) => f.name === name)) {
      name = `Untitled${counter}.sol`;
      counter++;
    }
    dispatch({ type: "CREATE_FILE", name, content: "" });
  };

  const handleUploadSol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const imports: Array<{ name: string; content: string }> = [];
    let remaining = uploadedFiles.length;

    Array.from(uploadedFiles).forEach((file) => {
      if (!file.name.endsWith(".sol")) {
        remaining--;
        if (remaining === 0 && imports.length > 0) {
          dispatch({ type: "IMPORT_FILES", files: imports });
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        imports.push({ name: file.name, content: reader.result as string });
        remaining--;
        if (remaining === 0 && imports.length > 0) {
          dispatch({ type: "IMPORT_FILES", files: imports });
        }
      };
      reader.readAsText(file);
    });

    // Reset input so the same file can be uploaded again
    e.target.value = "";
  };

  const handleFileClick = (fileId: string) => {
    dispatch({ type: "OPEN_TAB", fileId });
    dispatch({ type: "SET_ACTIVE_TAB", fileId });
  };

  const handleRename = (fileId: string, newName: string): boolean => {
    const before = state.files[fileId]?.name;
    dispatch({ type: "RENAME_FILE", fileId, newName });
    // Check if rename was accepted (reducer rejects duplicates silently)
    // Since dispatch is sync-ish, we check the name collision ourselves
    const nameExists = Object.values(state.files).some(
      (f) => f.id !== fileId && f.name === newName
    );
    return !nameExists;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-0.5 rounded hover:bg-accent/50 transition-colors"
            onClick={handleCreateFile}
            title="New file"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div
            className="cursor-help"
            title="Files are flat (no folders). Use import &quot;FileName.sol&quot; for local imports. Renaming a file does not update imports in other files."
          >
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto px-1 py-0.5">
        {filtered.map((file) => (
          <FileTreeItem
            key={file.id}
            name={file.name}
            isActive={state.activeTabId === file.id}
            onClick={() => handleFileClick(file.id)}
            onRename={(newName) => handleRename(file.id, newName)}
            onDelete={() => dispatch({ type: "DELETE_FILE", fileId: file.id })}
            canDelete={canDelete}
          />
        ))}
        {filtered.length === 0 && searchQuery && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No matching files
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="p-2 border-t space-y-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-7 text-xs"
          onClick={handleCreateFile}
        >
          <Plus className="h-3.5 w-3.5" />
          New File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sol"
          multiple
          onChange={handleUploadSol}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-7 text-xs"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload .sol
        </Button>
      </div>
    </div>
  );
}
