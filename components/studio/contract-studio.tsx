"use client";

import React, { useState } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useClient } from "@/context/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CompilePanel } from "./compile-panel";
import { EditorPanel } from "./editor-panel";
import { DeployPanel } from "./deploy-panel";

const DEFAULT_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, uint256 _initialSupply) {
        name = _name;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }
}`;

export function ContractStudio() {
  const { client, loading } = useClient();
  const [source, setSource] = useState(DEFAULT_SOLIDITY);

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left: Compile panel */}
        <ResizablePanel defaultSize="15%" minSize="10%" maxSize="25%">
          <div className="h-full border-r overflow-hidden">
            <CompilePanel source={source} onSourceChange={setSource} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/* Center: Editor + Output */}
        <ResizablePanel defaultSize="55%" minSize="30%">
          <EditorPanel source={source} onSourceChange={setSource} />
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/* Right: Deploy panel */}
        <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%">
          <div className="h-full border-l overflow-hidden">
            <DeployPanel />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
