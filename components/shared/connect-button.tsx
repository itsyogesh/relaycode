"use client";

import { FC, useState } from "react";
import { Menu, ChevronDown, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ConnectButtonProps {}
export const ConnectButton: FC<ConnectButtonProps> = () => {
  const [connected, setConnected] = useState(false);
  return (
    <div className="relative group">
      {/* Persistent glow with hover effect */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-[#FF2670] to-[#7916F3] rounded-lg opacity-25 blur-md transition-all duration-500 group-hover:opacity-75 group-hover:blur-lg" />
      <Button
        variant="outline"
        className="relative w-full bg-black hover:bg-black text-white hover:text-white border-0 flex items-center gap-0 p-0 overflow-hidden rounded-md"
        onClick={() => setConnected(!connected)}
      >
        <div className="flex items-center justify-center px-3 py-2 border-r border-white/20">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="px-3 py-2">
          {!connected ? "Connect" : "0x1234...5678"}
        </span>
      </Button>
    </div>
  );
};
