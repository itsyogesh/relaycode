"use client";

import React, { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { InputWithAddon } from "@/components/ui/input-with-addon";
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

const schema = z.number().min(0);

/** Type names that should get denomination support */
const BALANCE_LIKE_TYPES = new Set([
  "Compact<u128>",
  "u128",
]);

interface AmountProps extends ParamInputProps {
  typeName?: string;
}

export function Amount({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  client,
  typeName,
  onChange,
}: AmountProps) {
  const isDenominated =
    typeName !== undefined && BALANCE_LIKE_TYPES.has(typeName);

  // Always call hooks (React rules), but only use results when denominated
  const { denominations, loading } = useChainToken(
    isDenominated ? client : null
  );

  const [displayValue, setDisplayValue] = useState("");
  const [selectedDenomLabel, setSelectedDenomLabel] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDenom: Denomination | null = useMemo(() => {
    if (!isDenominated || denominations.length === 0) return null;
    if (!selectedDenomLabel) return denominations[0];
    return (
      denominations.find((d) => d.label === selectedDenomLabel) ??
      denominations[0]
    );
  }, [isDenominated, selectedDenomLabel, denominations]);

  React.useEffect(() => {
    if (isDenominated && !selectedDenomLabel && denominations.length > 0) {
      setSelectedDenomLabel(denominations[0].label);
    }
  }, [isDenominated, denominations, selectedDenomLabel]);

  // Denominated change handler
  const handleDenominatedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);

      if (!raw.trim() || !selectedDenom) {
        setValidationError(null);
        onChange?.(undefined);
        return;
      }

      const isPlanck = selectedDenom.label === "planck";
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
    [selectedDenom, onChange]
  );

  const handleDenomSwitch = useCallback(
    (newLabel: string) => {
      const newDenom = denominations.find((d) => d.label === newLabel);
      if (!newDenom || !selectedDenom) return;

      if (displayValue.trim()) {
        const currentPlanck = toPlanck(displayValue, selectedDenom);
        if (currentPlanck) {
          setDisplayValue(fromPlanck(currentPlanck, newDenom));
        }
      }

      setSelectedDenomLabel(newLabel);
      setValidationError(null);
    },
    [denominations, displayValue, selectedDenom]
  );

  // Plain number change handler
  const handlePlainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    onChange?.(value);
  };

  // Denominated mode
  if (isDenominated && selectedDenom) {
    const isPlanck = selectedDenom.label === "planck";
    const displayError = validationError || error;

    const denomSelector = (
      <Select value={selectedDenom.label} onValueChange={handleDenomSwitch}>
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
          onChange={handleDenominatedChange}
          className="font-mono"
          placeholder={isPlanck ? "0" : "0.00"}
          suffix={denomSelector}
        />
        {description && <FormDescription>{description}</FormDescription>}
        {displayError && (
          <p className="text-sm text-red-500">{displayError}</p>
        )}
      </div>
    );
  }

  // Plain numeric mode
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="number"
        disabled={isDisabled}
        onChange={handlePlainChange}
        className="font-mono"
        min={0}
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Amount.schema = schema;
