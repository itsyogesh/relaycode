import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
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

export function Hash({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  hashType,
}: HashInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    onChange?.(value === "" ? undefined : value);
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

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="text"
        disabled={isDisabled}
        onChange={handleChange}
        className="font-mono"
        placeholder={getPlaceholder()}
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
