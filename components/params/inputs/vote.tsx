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
import { Input } from "@/components/ui/input";
import type { ParamInputProps } from "../types";

const schema = z.object({
  aye: z.boolean(),
  conviction: z.number().min(0).max(6),
});

export function Vote({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
}: ParamInputProps) {
  const [vote, setVote] = React.useState<{ aye: boolean; conviction: number }>({
    aye: true,
    conviction: 0,
  });

  const handleVoteChange = (value: string) => {
    const newVote = { ...vote, aye: value === "aye" };
    setVote(newVote);
    onChange?.(newVote);
  };

  const handleConvictionChange = (value: string) => {
    const conviction = parseInt(value);
    const newVote = { ...vote, conviction };
    setVote(newVote);
    onChange?.(newVote);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <Select
          disabled={isDisabled}
          onValueChange={handleVoteChange}
          value={vote.aye ? "aye" : "nay"}
        >
          <SelectTrigger id={`${name}-vote`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aye">Aye</SelectItem>
            <SelectItem value="nay">Nay</SelectItem>
          </SelectContent>
        </Select>

        <Select
          disabled={isDisabled}
          onValueChange={handleConvictionChange}
          value={vote.conviction.toString()}
        >
          <SelectTrigger id={`${name}-conviction`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            <SelectItem value="1">Locked 1x</SelectItem>
            <SelectItem value="2">Locked 2x</SelectItem>
            <SelectItem value="3">Locked 3x</SelectItem>
            <SelectItem value="4">Locked 4x</SelectItem>
            <SelectItem value="5">Locked 5x</SelectItem>
            <SelectItem value="6">Locked 6x</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Vote.schema = schema;
