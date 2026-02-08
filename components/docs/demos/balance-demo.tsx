"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { InputWithAddon } from "@/components/ui/input-with-addon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDenominations,
  toPlanck,
  fromPlanck,
  type Denomination,
} from "@/lib/denominations";

const SYMBOL = "DOT";
const DECIMALS = 10;
const TRANSFERABLE = BigInt("150000000000"); // 15 DOT
const EXISTENTIAL_DEPOSIT = BigInt("10000000000"); // 1 DOT

export function BalanceDemo() {
  const denominations = useMemo(() => getDenominations(SYMBOL, DECIMALS), []);

  const [displayValue, setDisplayValue] = useState("");
  const [selectedDenomLabel, setSelectedDenomLabel] = useState(SYMBOL);

  const selectedDenom: Denomination = useMemo(
    () => denominations.find((d) => d.label === selectedDenomLabel) ?? denominations[0],
    [selectedDenomLabel, denominations]
  );

  const isPlanck = selectedDenom.label === "planck";

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    []
  );

  const handleDenomChange = useCallback(
    (newLabel: string) => {
      const newDenom = denominations.find((d) => d.label === newLabel);
      if (!newDenom) return;

      if (displayValue.trim()) {
        const currentPlanck = toPlanck(displayValue, selectedDenom);
        if (currentPlanck) {
          const converted = fromPlanck(currentPlanck, newDenom);
          setDisplayValue(converted);
        }
      }

      setSelectedDenomLabel(newLabel);
    },
    [denominations, displayValue, selectedDenom]
  );

  const handlePercentage = useCallback(
    (percent: number) => {
      let amount: bigint;
      if (percent === 100) {
        amount =
          TRANSFERABLE > EXISTENTIAL_DEPOSIT
            ? TRANSFERABLE - EXISTENTIAL_DEPOSIT
            : BigInt(0);
      } else {
        amount = (TRANSFERABLE * BigInt(percent)) / BigInt(100);
      }
      const display = fromPlanck(amount.toString(), selectedDenom);
      setDisplayValue(display);
    },
    [selectedDenom]
  );

  // ED warning
  const showEdWarning = useMemo(() => {
    if (!displayValue.trim()) return false;
    const planck = toPlanck(displayValue, selectedDenom);
    if (!planck) return false;
    try {
      const entered = BigInt(planck);
      return TRANSFERABLE - entered < EXISTENTIAL_DEPOSIT && entered > BigInt(0);
    } catch {
      return false;
    }
  }, [displayValue, selectedDenom]);

  const edDisplay = fromPlanck(EXISTENTIAL_DEPOSIT.toString(), selectedDenom);

  const denomSelector = (
    <Select value={selectedDenom.label} onValueChange={handleDenomChange}>
      <SelectTrigger className="h-7 w-24 border-0 bg-muted/50 text-xs font-mono focus:ring-0 shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {denominations.map((d) => (
          <SelectItem key={d.label} value={d.label} className="text-xs font-mono">
            {d.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <Label>Amount</Label>
      <InputWithAddon
        type="text"
        inputMode={isPlanck ? "numeric" : "decimal"}
        value={displayValue}
        onChange={handleValueChange}
        className="font-mono"
        placeholder={isPlanck ? "0" : "0.00"}
        suffix={denomSelector}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Available: 15 {SYMBOL}</span>
        <div className="flex gap-1">
          {[25, 50, 75].map((pct) => (
            <Button
              key={pct}
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={() => handlePercentage(pct)}
            >
              {pct}%
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs"
            onClick={() => handlePercentage(100)}
          >
            Max
          </Button>
        </div>
      </div>
      {showEdWarning && (
        <p className="text-xs text-yellow-600">
          Amount would reap account (ED: {edDisplay} {selectedDenom.label})
        </p>
      )}
    </div>
  );
}
