"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnectModal, useAccountModal } from "@luno-kit/ui";
import { useAccount } from "@luno-kit/react";

export function ConnectButton() {
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();
  const { account } = useAccount();

  const isConnected = !!account;
  const displayAddress = account?.address
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : "";

  return (
    <div className="relative group">
      <div className="absolute -inset-[2px] bg-gradient-to-r from-[#FF2670] to-[#7916F3] rounded-lg opacity-25 blur-md transition-all duration-500 group-hover:opacity-75 group-hover:blur-lg" />
      <Button
        variant="outline"
        className="relative w-full bg-black hover:bg-black text-white hover:text-white border-0 flex items-center gap-0 p-0 overflow-hidden rounded-md"
        onClick={isConnected ? openAccountModal : openConnectModal}
      >
        <div className="flex items-center justify-center px-3 py-2 border-r border-white/20">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="px-3 py-2">
          {isConnected ? displayAddress : "Connect"}
        </span>
      </Button>
    </div>
  );
}
