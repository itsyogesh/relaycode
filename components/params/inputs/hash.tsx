import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { InputWithAddon } from "@/components/ui/input-with-addon";
import { CheckCircle2, XCircle } from "lucide-react";
import { autoPrefix0x } from "@/lib/paste-utils";
import type { ParamInputProps } from "../types";

// Helper function to validate hex string of specific length
const isValidHexString = (value: string, length: number) => {
  const hexRegex = new RegExp(`^0x[0-9a-fA-F]{${length}}$`);
  return hexRegex.test(value);
};

// Schemas for different hash lengths
const hash160Schema = z.string().refine(
  (value) => isValidHexString(value, 40),
  { message: "Invalid H160 hash (should be 40 hex characters with 0x prefix)" }
);

const hash256Schema = z.string().refine(
  (value) => isValidHexString(value, 64),
  { message: "Invalid H256 hash (should be 64 hex characters with 0x prefix)" }
);

const hash512Schema = z.string().refine(
  (value) => isValidHexString(value, 128),
  { message: "Invalid H512 hash (should be 128 hex characters with 0x prefix)" }
);

interface HashInputProps extends ParamInputProps {
  hashType: "H160" | "H256" | "H512";
}

const HASH_LENGTHS: Record<string, number> = {
  H160: 40,
  H256: 64,
  H512: 128,
};

export function Hash({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
  hashType,
}: HashInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  const expectedLength = HASH_LENGTHS[hashType];

  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      const str = String(externalValue);
      if (str !== displayValue) setDisplayValue(str);
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    setDisplayValue(value);
    onChange?.(value === "" ? undefined : value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const result = autoPrefix0x(pasted);
    if (result.transformed) {
      e.preventDefault();
      setDisplayValue(result.value);
      onChange?.(result.value === "" ? undefined : result.value);
    }
  };

  const getPlaceholder = () => {
    switch (hashType) {
      case "H160":
        return "0x1234567890abcdef1234567890abcdef12345678";
      case "H256":
        return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      case "H512":
        return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    }
  };

  // Validation state
  const isValid = displayValue ? isValidHexString(displayValue, expectedLength) : null;

  const validationIcon = isValid === true ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : isValid === false ? (
    <XCircle className="h-4 w-4 text-red-500" />
  ) : null;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <InputWithAddon
        id={name}
        type="text"
        disabled={isDisabled}
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        className="font-mono"
        placeholder={getPlaceholder()}
        suffix={validationIcon}
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Export specific hash components with their respective schemas
export function Hash160(props: ParamInputProps) {
  return <Hash {...props} hashType="H160" />;
}
Hash160.schema = hash160Schema;

export function Hash256(props: ParamInputProps) {
  return <Hash {...props} hashType="H256" />;
}
Hash256.schema = hash256Schema;

export function Hash512(props: ParamInputProps) {
  return <Hash {...props} hashType="H512" />;
}
Hash512.schema = hash512Schema;
