"use client";

import { AlertCircle } from "lucide-react";

export function ChainRequiredBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
      <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
      <div>
        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
          Asset Hub chain required
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Contract Studio requires an Asset Hub chain (Polkadot Asset Hub, Westend Asset Hub, or
          Paseo Asset Hub). Use the chain selector in the top bar to switch.
        </p>
      </div>
    </div>
  );
}
