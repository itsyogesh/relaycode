"use client";

import { useSwitchChain } from "@luno-kit/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChainSelector() {
  const { chains, currentChain, switchChain } = useSwitchChain();

  const handleChange = (chainId: string) => {
    switchChain({ chainId });
  };

  return (
    <Select
      value={currentChain?.genesisHash ?? ""}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem
            key={chain.genesisHash}
            value={chain.genesisHash}
            className="text-xs"
          >
            <span className="flex items-center gap-2">
              {chain.name}
              {chain.testnet && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                  testnet
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
