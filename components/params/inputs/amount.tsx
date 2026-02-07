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
import { ModeToggle } from "@/components/params/shared/mode-toggle";
import { stripNumericFormatting } from "@/lib/paste-utils";
import type { ParamInputProps } from "../types";

const schema = z.number().min(0);

/** Type names that should get denomination support */
const BALANCE_LIKE_TYPES = new Set([
  "Compact<u128>",
  "u128",
]);

/** Types that should get a hex toggle (large integers) */
const HEX_TOGGLE_TYPES = new Set(["u128", "u256", "i128", "i256", "Compact<u128>"]);

interface AmountProps extends ParamInputProps {
  typeName?: string;
}

/** Compute min/max range for integer types */
function getIntegerRange(typeName: string): { min: bigint; max: bigint; display: string } | null {
  const unsigned: Record<string, number> = {
    u8: 8, u16: 16, u32: 32, u64: 64, u128: 128, u256: 256,
  };
  const signed: Record<string, number> = {
    i8: 8, i16: 16, i32: 32, i64: 64, i128: 128, i256: 256,
  };

  // Strip Compact<> wrapper
  const stripped = typeName.replace(/^Compact<(.+)>$/, "$1");

  if (unsigned[stripped]) {
    const bits = unsigned[stripped];
    const max = (BigInt(1) << BigInt(bits)) - BigInt(1);
    return {
      min: BigInt(0),
      max,
      display: `0 \u2014 ${bits <= 64 ? max.toString() : `2^${bits} - 1`}`,
    };
  }

  if (signed[stripped]) {
    const bits = signed[stripped];
    const min = -(BigInt(1) << BigInt(bits - 1));
    const max = (BigInt(1) << BigInt(bits - 1)) - BigInt(1);
    return {
      min,
      max,
      display: bits <= 64 ? `${min.toString()} \u2014 ${max.toString()}` : `-(2^${bits - 1}) \u2014 2^${bits - 1} - 1`,
    };
  }

  return null;
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
  value: externalValue,
}: AmountProps) {
  const isDenominated =
    typeName !== undefined && BALANCE_LIKE_TYPES.has(typeName);
  const showHexToggle =
    typeName !== undefined && HEX_TOGGLE_TYPES.has(typeName);

  // Always call hooks (React rules), but only use results when denominated
  const { denominations, loading } = useChainToken(
    isDenominated ? client : null
  );

  const [displayValue, setDisplayValue] = useState("");
  const [selectedDenomLabel, setSelectedDenomLabel] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [numericMode, setNumericMode] = useState<"decimal" | "hex">("decimal");

  const range = useMemo(() => {
    if (!typeName) return null;
    return getIntegerRange(typeName);
  }, [typeName]);

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

  // Sync from external value (e.g., hex decode setting form value)
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null && externalValue !== "") {
      if (isDenominated && selectedDenom) {
        const planckStr = String(externalValue);
        const currentPlanck = displayValue.trim()
          ? toPlanck(displayValue, selectedDenom)
          : null;
        if (currentPlanck !== planckStr) {
          setDisplayValue(fromPlanck(planckStr, selectedDenom));
        }
      } else {
        // Plain numeric mode
        const numStr = String(externalValue);
        if (displayValue !== numStr) {
          if (numericMode === "hex") {
            try {
              setDisplayValue("0x" + BigInt(numStr).toString(16));
            } catch {
              setDisplayValue(numStr);
            }
          } else {
            setDisplayValue(numStr);
          }
        }
      }
    }
  }, [externalValue, selectedDenom, isDenominated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate range
  const validateRange = useCallback(
    (value: bigint | number): string | null => {
      if (!range) return null;
      const bigVal = typeof value === "number" ? BigInt(Math.trunc(value)) : value;
      if (bigVal < range.min) return `Value below minimum (${range.min.toString()})`;
      if (bigVal > range.max) return `Value above maximum`;
      return null;
    },
    [range]
  );

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
        const rangeErr = validateRange(BigInt(planck));
        setValidationError(rangeErr);
        onChange?.(planck);
      }
    },
    [selectedDenom, onChange, validateRange]
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
  const handlePlainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);

      if (!raw.trim()) {
        setValidationError(null);
        onChange?.(undefined);
        return;
      }

      if (numericMode === "hex") {
        // Parse hex input
        try {
          const val = BigInt(raw);
          const rangeErr = validateRange(val);
          setValidationError(rangeErr);
          onChange?.(val.toString());
        } catch {
          setValidationError("Invalid hex value");
          onChange?.(undefined);
        }
      } else {
        const num = Number(raw);
        if (isNaN(num)) {
          setValidationError("Invalid number");
          onChange?.(undefined);
          return;
        }
        const rangeErr = validateRange(num);
        setValidationError(rangeErr);
        // Always emit as string so coerceValue can convert to BigInt for codec
        try {
          onChange?.(BigInt(raw).toString());
        } catch {
          onChange?.(num.toString());
        }
      }
    },
    [numericMode, onChange, validateRange, showHexToggle]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      const stripped = stripNumericFormatting(pasted);
      if (stripped.transformed) {
        e.preventDefault();
        setDisplayValue(stripped.value);
        // Trigger change with stripped value
        const syntheticEvent = {
          target: { value: stripped.value },
        } as React.ChangeEvent<HTMLInputElement>;
        if (isDenominated) {
          handleDenominatedChange(syntheticEvent);
        } else {
          handlePlainChange(syntheticEvent);
        }
      }
    },
    [isDenominated, handleDenominatedChange, handlePlainChange]
  );

  const handleNumericModeChange = (mode: string) => {
    const m = mode as "decimal" | "hex";
    if (m === "hex" && displayValue.trim()) {
      try {
        const val = BigInt(displayValue);
        setDisplayValue("0x" + val.toString(16));
      } catch {
        // keep as-is
      }
    } else if (m === "decimal" && displayValue.trim()) {
      try {
        const val = BigInt(displayValue);
        setDisplayValue(val.toString());
      } catch {
        // keep as-is
      }
    }
    setNumericMode(m);
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
          onPaste={handlePaste}
          className="font-mono"
          placeholder={isPlanck ? "0" : "0.00"}
          suffix={denomSelector}
        />
        {range && (
          <span className="text-xs text-muted-foreground">
            Range: {range.display}
          </span>
        )}
        {description && <FormDescription>{description}</FormDescription>}
        {displayError && (
          <p className="text-sm text-red-500">{displayError}</p>
        )}
      </div>
    );
  }

  // Plain numeric mode
  const displayError = validationError || error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {showHexToggle && (
          <ModeToggle
            modes={[
              { id: "decimal", label: "Dec" },
              { id: "hex", label: "Hex" },
            ]}
            activeMode={numericMode}
            onModeChange={handleNumericModeChange}
            disabled={isDisabled}
          />
        )}
      </div>
      <Input
        id={name}
        type="text"
        inputMode="numeric"
        disabled={isDisabled}
        value={displayValue}
        onChange={handlePlainChange}
        onPaste={handlePaste}
        className="font-mono"
        placeholder={numericMode === "hex" ? "0x0" : "0"}
      />
      {range && (
        <span className="text-xs text-muted-foreground">
          Range: {range.display}
        </span>
      )}
      {description && <FormDescription>{description}</FormDescription>}
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}

Amount.schema = schema;
