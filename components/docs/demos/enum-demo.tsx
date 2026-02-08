"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoVariant {
  name: string;
  docs: string;
}

const VARIANTS: DemoVariant[] = [
  {
    name: "SuperMajorityApprove",
    docs: "A supermajority of aye votes is required to pass this motion.",
  },
  {
    name: "SuperMajorityAgainst",
    docs: "A supermajority of nay votes is required to reject this motion.",
  },
  {
    name: "SimpleMajority",
    docs: "A simple majority of votes is required.",
  },
];

export function EnumDemo() {
  const [selected, setSelected] = useState(VARIANTS[0].name);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <Label>Vote Threshold</Label>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger>
          <SelectValue placeholder="Select variant" />
        </SelectTrigger>
        <SelectContent>
          <TooltipProvider delayDuration={300}>
            {VARIANTS.map((variant) => {
              const item = (
                <SelectItem key={variant.name} value={variant.name}>
                  {variant.name}
                </SelectItem>
              );

              return (
                <Tooltip key={variant.name}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs">
                    {variant.docs}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground font-mono">
        {"{"} type: &quot;{selected}&quot; {"}"}
      </p>
    </div>
  );
}
