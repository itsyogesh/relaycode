"use client";

import { useSwitchChain } from "@luno-kit/react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerItem,
  DropDrawerLabel,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";

export function ChainSelector() {
  const { chains, currentChain, switchChain } = useSwitchChain();

  const handleSelect = (chainId: string) => {
    switchChain({ chainId });
  };

  return (
    <DropDrawer>
      <DropDrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 px-3 text-xs font-medium"
        >
          {currentChain?.chainIconUrl && (
            <img
              src={currentChain.chainIconUrl}
              alt=""
              className="h-4 w-4 rounded-full"
            />
          )}
          <span className="hidden sm:inline">{currentChain?.name ?? "Select chain"}</span>
          <ChevronDown className="hidden sm:block h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropDrawerTrigger>
      <DropDrawerContent align="end" className="min-w-[180px]">
        <DropDrawerLabel>Switch Network</DropDrawerLabel>
        {chains.map((chain) => {
          const isActive = currentChain?.genesisHash === chain.genesisHash;
          return (
            <DropDrawerItem
              key={chain.genesisHash}
              onSelect={() => handleSelect(chain.genesisHash)}
              className="cursor-pointer"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {chain.chainIconUrl && (
                    <img
                      src={chain.chainIconUrl}
                      alt=""
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  <span>{chain.name}</span>
                  {chain.testnet && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                      testnet
                    </span>
                  )}
                </span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </span>
            </DropDrawerItem>
          );
        })}
      </DropDrawerContent>
    </DropDrawer>
  );
}
