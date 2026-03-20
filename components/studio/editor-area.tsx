"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useStudio } from "@/context/studio-provider";
import { EditorTabs } from "./editor-tabs";
import { OutputPanel } from "./output-panel";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export function EditorArea() {
  const { resolvedTheme } = useTheme();
  const { state, dispatch, activeFile } = useStudio();

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFile) return;
    dispatch({
      type: "UPDATE_FILE_CONTENT",
      fileId: activeFile.id,
      content: value || "",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <EditorTabs />

      {/* Monaco editor */}
      <div className="flex-1 min-h-0">
        {activeFile ? (
          <MonacoEditor
            key={activeFile.id}
            height="100%"
            language="sol"
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            path={activeFile.name}
            value={activeFile.content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 4,
              padding: { top: 8, bottom: 8 },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Open a file to start editing
          </div>
        )}
      </div>

      {/* Output panel */}
      <OutputPanel
        visible={state.outputVisible}
        onToggle={() => dispatch({ type: "TOGGLE_OUTPUT" })}
      />
    </div>
  );
}
