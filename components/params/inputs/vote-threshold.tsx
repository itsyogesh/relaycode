import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParamInputProps } from "../types";

const schema = z.enum(["SuperMajorityApprove", "SuperMajorityAgainst", "SimpleMajority"]);

export function VoteThreshold({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const handleChange = (value: string) => {
    onChange?.(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        disabled={isDisabled}
        onValueChange={handleChange}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder="Select threshold" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SuperMajorityApprove">Super Majority Approve</SelectItem>
          <SelectItem value="SuperMajorityAgainst">Super Majority Against</SelectItem>
          <SelectItem value="SimpleMajority">Simple Majority</SelectItem>
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

VoteThreshold.schema = schema;
