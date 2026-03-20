"use client";

import React from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useClient } from "@/context/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FileExplorer } from "./file-explorer";
import { EditorArea } from "./editor-area";
import { RightSidebar } from "./right-sidebar";
import { StatusBar } from "./status-bar";

export function StudioLayout() {
  const { loading } = useClient();

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Main content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left: File explorer */}
          <ResizablePanel defaultSize="17%" minSize="12%" maxSize="22%">
            <div className="h-full border-r overflow-hidden">
              <FileExplorer />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />

          {/* Center: Editor + Output */}
          <ResizablePanel defaultSize="53%" minSize="30%">
            <EditorArea />
          </ResizablePanel>
          <ResizableHandle withHandle />

          {/* Right: Compile + Deploy */}
          <ResizablePanel defaultSize="30%" minSize="22%" maxSize="35%">
            <div className="h-full border-l overflow-hidden">
              <RightSidebar />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar — reserved height, not absolute */}
      <StatusBar />
    </div>
  );
}
