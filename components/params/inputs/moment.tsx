import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ParamInputProps } from "../types";

const schema = z.number().int().min(0);

function toDatetimeLocal(ms: number): string {
  const d = new Date(ms);
  // Format: YYYY-MM-DDTHH:mm
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const PRESETS = [
  { label: "Now", offset: 0 },
  { label: "+1h", offset: 60 * 60 * 1000 },
  { label: "+6h", offset: 6 * 60 * 60 * 1000 },
  { label: "+24h", offset: 24 * 60 * 60 * 1000 },
  { label: "+7d", offset: 7 * 24 * 60 * 60 * 1000 },
];

export function Moment({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
}: ParamInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [timezone] = React.useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Sync from external value
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      const ts = Number(externalValue);
      if (!isNaN(ts) && ts > 0) {
        setDisplayValue(toDatetimeLocal(ts));
      }
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (value === "") {
      onChange?.(undefined);
      return;
    }

    // Convert date-time to Unix timestamp in milliseconds (as string for BigInt compat)
    try {
      const timestamp = new Date(value).getTime();
      onChange?.(timestamp.toString());
    } catch {
      onChange?.(undefined);
    }
  };

  const handlePreset = (offset: number) => {
    const ts = Date.now() + offset;
    setDisplayValue(toDatetimeLocal(ts));
    onChange?.(ts.toString());
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="datetime-local"
        disabled={isDisabled}
        value={displayValue}
        onChange={handleChange}
        className="font-mono"
      />
      <div className="flex items-center gap-1 flex-wrap">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            disabled={isDisabled}
            onClick={() => handlePreset(preset.offset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        Timezone: {timezone}
      </span>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Moment.schema = schema;
