import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParamInputProps } from "../types";
import { Balance } from "./balance";

type VoteMode = "Standard" | "Split" | "SplitAbstain";
type VoteDirection = "aye" | "nay";

const schema = z.any();

const CONVICTION_INFO: Record<number, string> = {
  0: "No lock period",
  1: "Lock for 1 enactment period (~28 days)",
  2: "Lock for 2x enactment (~56 days)",
  3: "Lock for 4x enactment (~112 days)",
  4: "Lock for 8x enactment (~224 days)",
  5: "Lock for 16x enactment (~448 days)",
  6: "Lock for 32x enactment (~896 days)",
};

/**
 * Encode vote direction + conviction into a single byte (PalletConvictionVotingVote).
 * High bit (0x80) = aye, low bits = conviction (0-6).
 */
function encodeVoteByte(direction: VoteDirection, conviction: number): number {
  const base = direction === "aye" ? 0x80 : 0x00;
  return base | (conviction & 0x7f);
}

export function Vote({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
}: ParamInputProps) {
  const [mode, setMode] = React.useState<VoteMode>("Standard");
  const [direction, setDirection] = React.useState<VoteDirection>("aye");
  const [conviction, setConviction] = React.useState(0);
  const [balance, setBalance] = React.useState<string | undefined>(undefined);
  const [ayeBalance, setAyeBalance] = React.useState<string | undefined>(undefined);
  const [nayBalance, setNayBalance] = React.useState<string | undefined>(undefined);
  const [abstainBalance, setAbstainBalance] = React.useState<string | undefined>(undefined);

  const handleBalanceChange = React.useCallback((v: unknown) => setBalance(v as string | undefined), []);
  const handleAyeChange = React.useCallback((v: unknown) => setAyeBalance(v as string | undefined), []);
  const handleNayChange = React.useCallback((v: unknown) => setNayBalance(v as string | undefined), []);
  const handleAbstainChange = React.useCallback((v: unknown) => setAbstainBalance(v as string | undefined), []);

  // Emit the proper AccountVote enum value whenever state changes
  const emitValue = React.useCallback(() => {
    if (mode === "Standard") {
      onChange?.({
        type: "Standard",
        value: {
          vote: encodeVoteByte(direction, conviction),
          balance: balance ?? "0",
        },
      });
    } else if (mode === "Split") {
      onChange?.({
        type: "Split",
        value: {
          aye: ayeBalance ?? "0",
          nay: nayBalance ?? "0",
        },
      });
    } else {
      onChange?.({
        type: "SplitAbstain",
        value: {
          aye: ayeBalance ?? "0",
          nay: nayBalance ?? "0",
          abstain: abstainBalance ?? "0",
        },
      });
    }
  }, [mode, direction, conviction, balance, ayeBalance, nayBalance, abstainBalance, onChange]);

  // Re-emit on any change
  React.useEffect(() => {
    emitValue();
  }, [emitValue]);

  const handleDirectionChange = (dir: VoteDirection) => {
    setDirection(dir);
  };

  const handleConvictionChange = (value: string) => {
    setConviction(parseInt(value));
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as VoteMode);
  };

  return (
    <div className="flex flex-col gap-2 pt-7">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={mode} onValueChange={handleModeChange} disabled={isDisabled}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Split">Split</SelectItem>
            <SelectItem value="SplitAbstain">Split Abstain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "Standard" && (
        <div className="flex flex-col gap-3">
          {/* Vote direction buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => handleDirectionChange("aye")}
              className={cn(
                "flex-1",
                direction === "aye" && "bg-green-500/10 border-green-500 text-green-700 hover:bg-green-500/20 hover:text-green-700"
              )}
            >
              <ThumbsUp className="h-4 w-4 mr-1.5" />
              Aye
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => handleDirectionChange("nay")}
              className={cn(
                "flex-1",
                direction === "nay" && "bg-red-500/10 border-red-500 text-red-700 hover:bg-red-500/20 hover:text-red-700"
              )}
            >
              <ThumbsDown className="h-4 w-4 mr-1.5" />
              Nay
            </Button>
          </div>

          {/* Conviction selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Conviction</label>
            <Select
              disabled={isDisabled}
              onValueChange={handleConvictionChange}
              value={conviction.toString()}
            >
              <SelectTrigger id={`${name}-conviction`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None (0.1x voting power)</SelectItem>
                <SelectItem value="1">Locked 1x</SelectItem>
                <SelectItem value="2">Locked 2x</SelectItem>
                <SelectItem value="3">Locked 3x</SelectItem>
                <SelectItem value="4">Locked 4x</SelectItem>
                <SelectItem value="5">Locked 5x</SelectItem>
                <SelectItem value="6">Locked 6x</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {CONVICTION_INFO[conviction]}
            </p>
          </div>

          {/* Balance */}
          <Balance
            client={client}
            name={`${name}-balance`}
            label="Balance"
            isDisabled={isDisabled}
            onChange={handleBalanceChange}
            value={balance}
          />
        </div>
      )}

      {mode === "Split" && (
        <div className="flex flex-col gap-3">
          <Balance
            client={client}
            name={`${name}-aye`}
            label="Aye balance"
            isDisabled={isDisabled}
            onChange={handleAyeChange}
            value={ayeBalance}
          />
          <Balance
            client={client}
            name={`${name}-nay`}
            label="Nay balance"
            isDisabled={isDisabled}
            onChange={handleNayChange}
            value={nayBalance}
          />
        </div>
      )}

      {mode === "SplitAbstain" && (
        <div className="flex flex-col gap-3">
          <Balance
            client={client}
            name={`${name}-aye`}
            label="Aye balance"
            isDisabled={isDisabled}
            onChange={handleAyeChange}
            value={ayeBalance}
          />
          <Balance
            client={client}
            name={`${name}-nay`}
            label="Nay balance"
            isDisabled={isDisabled}
            onChange={handleNayChange}
            value={nayBalance}
          />
          <Balance
            client={client}
            name={`${name}-abstain`}
            label="Abstain balance"
            isDisabled={isDisabled}
            onChange={handleAbstainChange}
            value={abstainBalance}
          />
        </div>
      )}

      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Vote.schema = schema;
