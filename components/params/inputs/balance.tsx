"use client";

import React, { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { InputWithAddon } from "@/components/ui/input-with-addon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChainToken } from "@/hooks/use-chain-token";
import { toPlanck, fromPlanck, type Denomination } from "@/lib/denominations";
import type { ParamInputProps } from "../types";

import { useSafeAccount, useSafeBalance } from "@/hooks/use-wallet-safe";

const schema = z.string().refine(
  (value) => {
    try {
      BigInt(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid balance amount" }
);

export function Balance({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  client,
  onChange,
}: ParamInputProps) {
  const { symbol, denominations, existentialDeposit, loading } =
    useChainToken(client);

  const [displayValue, setDisplayValue] = useState("");
  const [selectedDenomLabel, setSelectedDenomLabel] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Resolve selected denomination
  const selectedDenom: Denomination = useMemo(() => {
    if (!selectedDenomLabel && denominations.length > 0) return denominations[0];
    return (
      denominations.find((d) => d.label === selectedDenomLabel) ??
      denominations[0]
    );
  }, [selectedDenomLabel, denominations]);

  // Set default denom label once denominations load
  React.useEffect(() => {
    if (!selectedDenomLabel && denominations.length > 0) {
      setSelectedDenomLabel(denominations[0].label);
    }
  }, [denominations, selectedDenomLabel]);

  // Wallet info (safe hooks that handle missing provider)
  const { address } = useSafeAccount();
  const { transferable, formattedTransferable } = useSafeBalance({
    address,
  });

  const isPlanck = selectedDenom.label === "planck";

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);

      if (!raw.trim()) {
        setValidationError(null);
        onChange?.(undefined);
        return;
      }

      // In planck mode, reject decimal input
      if (isPlanck && raw.includes(".")) {
        setValidationError("Planck values must be whole numbers");
        onChange?.(undefined);
        return;
      }

      const planck = toPlanck(raw, selectedDenom);
      if (planck === null) {
        setValidationError("Invalid value or excess precision");
        onChange?.(undefined);
      } else {
        setValidationError(null);
        onChange?.(planck);
      }
    },
    [isPlanck, selectedDenom, onChange]
  );

  const handleDenomChange = useCallback(
    (newLabel: string) => {
      const newDenom = denominations.find((d) => d.label === newLabel);
      if (!newDenom) return;

      // Convert current planck value to new denomination display
      if (displayValue.trim()) {
        const currentPlanck = toPlanck(displayValue, selectedDenom);
        if (currentPlanck) {
          const converted = fromPlanck(currentPlanck, newDenom);
          setDisplayValue(converted);
        }
      }

      setSelectedDenomLabel(newLabel);
      setValidationError(null);
    },
    [denominations, displayValue, selectedDenom]
  );

  // ED warning
  const showEdWarning = useMemo(() => {
    if (!transferable || !displayValue.trim()) return false;
    const planck = toPlanck(displayValue, selectedDenom);
    if (!planck) return false;
    try {
      const entered = BigInt(planck);
      return transferable - entered < existentialDeposit && entered > BigInt(0);
    } catch {
      return false;
    }
  }, [transferable, displayValue, selectedDenom, existentialDeposit]);

  const handleMax = useCallback(() => {
    if (!transferable) return;
    const maxSafe =
      transferable > existentialDeposit
        ? transferable - existentialDeposit
        : BigInt(0);
    const display = fromPlanck(maxSafe.toString(), selectedDenom);
    setDisplayValue(display);
    setValidationError(null);
    onChange?.(maxSafe.toString());
  }, [transferable, existentialDeposit, selectedDenom, onChange]);

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

  const displayError = validationError || error;
  const edDisplay = fromPlanck(existentialDeposit.toString(), selectedDenom);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <InputWithAddon
        id={name}
        type="text"
        inputMode={isPlanck ? "numeric" : "decimal"}
        disabled={isDisabled || loading}
        value={displayValue}
        onChange={handleValueChange}
        className="font-mono"
        placeholder={isPlanck ? "0" : "0.00"}
        suffix={denomSelector}
      />
      {address && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Available: {formattedTransferable ?? "—"} {symbol}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs"
            onClick={handleMax}
            disabled={!transferable}
          >
            Max
          </Button>
        </div>
      )}
      {showEdWarning && (
        <p className="text-xs text-yellow-600">
          Amount would reap account (ED: {edDisplay} {selectedDenom.label})
        </p>
      )}
      {description && <FormDescription>{description}</FormDescription>}
      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
}

Balance.schema = schema;
