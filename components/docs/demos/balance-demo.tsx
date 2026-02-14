"use client";

import React from "react";
import { Balance } from "@/components/params/inputs/balance";

export function BalanceDemo() {
  return (
    <div className="w-full max-w-md">
      <Balance
        name="value"
        label="Amount"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}
