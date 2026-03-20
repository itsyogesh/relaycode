"use client";

import React, { useState, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useClient } from "@/context/client";
import { useContractContext } from "@/context/contract-provider";
import { useGasEstimation } from "@/hooks/use-gas-estimation";
import { useChainToken } from "@/hooks/use-chain-token";
import { formatFee, formatWeight } from "@/lib/fee-display";
import { ConstructorForm } from "./constructor-form";
import { TransactionLog, LogEntry } from "./transaction-log";
import { ChainRequiredBanner } from "./chain-required-banner";
import { hasReviveApi } from "@/lib/chain-types";
import { allConstructorTypesSupported, getConstructorInputs } from "@/lib/abi-encoder";
import { useAccount, useSendTransaction } from "@luno-kit/react";
import { Loader2, Zap, Rocket } from "lucide-react";

export function DeployPanel() {
  const { client } = useClient();
  const { abi, bytecode } = useContractContext();
  const { account } = useAccount();
  const { sendTransactionAsync, isPending } = useSendTransaction();
  const { symbol, decimals } = useChainToken(client);

  const [constructorData, setConstructorData] = useState<string | undefined>();
  const [hexDataInput, setHexDataInput] = useState("");
  const [valueInput, setValueInput] = useState("0");
  const [saltInput, setSaltInput] = useState("");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // Detect whether the constructor has unsupported types (needs hex fallback)
  const constructorInputs = abi ? getConstructorInputs(abi) : [];
  const hasConstructor = constructorInputs.length > 0;
  const needsHexFallback = abi ? hasConstructor && !allConstructorTypesSupported(abi) : false;
  const [hexDataError, setHexDataError] = useState<string | null>(null);

  // Reset constructor-related state when the ABI changes (contract switch / recompile)
  React.useEffect(() => {
    setConstructorData(undefined);
    setHexDataInput("");
    setHexDataError(null);
  }, [abi]);

  const logId = useId();
  const logCounterRef = React.useRef(0);

  const addLog = useCallback(
    (type: LogEntry["type"], message: string) => {
      const counter = logCounterRef.current++;
      setLogEntries((prev) => [
        ...prev,
        {
          id: `${logId}-${Date.now()}-${counter}`,
          type,
          message,
          timestamp: new Date(),
        },
      ]);
    },
    [logId]
  );

  const code = bytecode ? `0x${bytecode}` : "";
  const valueBigInt = (() => {
    try {
      return BigInt(valueInput || "0");
    } catch {
      return BigInt(0);
    }
  })();

  // Validate hex fallback input
  const isValidHex = (v: string) =>
    !v || v === "0x" || (/^0x[0-9a-fA-F]*$/.test(v) && v.length % 2 === 0);

  const handleHexDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setHexDataInput(val);
    if (!val || val === "0x") {
      setHexDataError(null);
    } else if (!/^0x[0-9a-fA-F]*$/.test(val)) {
      setHexDataError("Must be a hex string with 0x prefix");
    } else if (val.length % 2 !== 0) {
      setHexDataError("Hex string must have even length");
    } else {
      setHexDataError(null);
    }
  };

  // When hex fallback is active, use the raw hex input; otherwise use the encoded form data
  const effectiveData = needsHexFallback
    ? (hexDataInput || "0x")
    : (constructorData || "0x");

  const gasEstimation = useGasEstimation(
    client,
    account?.address || "",
    valueBigInt,
    code,
    effectiveData,
    saltInput || undefined
  );

  const isAssetHub = client ? hasReviveApi(client) : false;

  const handleEstimate = async () => {
    addLog("info", "Estimating gas...");
    await gasEstimation.estimate();
    // State updates from the hook won't be visible until next render.
    // The effect below handles logging success/failure after React re-renders.
  };

  // Log estimation results after React applies the hook's state updates
  React.useEffect(() => {
    if (gasEstimation.weightRequired && !gasEstimation.error) {
      addLog(
        "success",
        `Estimated: ${formatWeight(gasEstimation.weightRequired)}`
      );
      if (gasEstimation.storageDeposit) {
        const sd = gasEstimation.storageDeposit;
        addLog(
          "info",
          `Storage: ${sd.type} ${formatFee(sd.value, symbol, decimals)}`
        );
      }
    }
    if (gasEstimation.error && !gasEstimation.estimating) {
      addLog("error", `Estimation failed: ${gasEstimation.error}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasEstimation.weightRequired, gasEstimation.error]);

  const handleDeploy = async () => {
    if (!client || !account || !bytecode) return;

    if (!hasReviveApi(client)) {
      addLog("error", "Chain does not support Revive API");
      return;
    }

    addLog("pending", "Deploying contract...");

    try {
      const assetHubClient = client as any;
      const salt = saltInput ? saltInput : undefined;

      const extrinsic = assetHubClient.tx.revive.instantiateWithCode(
        valueBigInt,
        gasEstimation.weightRequired
          ? {
              refTime: gasEstimation.weightRequired.refTime,
              proofSize: gasEstimation.weightRequired.proofSize,
            }
          : { refTime: BigInt(0), proofSize: BigInt(0) },
        gasEstimation.storageDeposit?.type === "Charge"
          ? gasEstimation.storageDeposit.value
          : BigInt(0),
        `0x${bytecode}`,
        effectiveData,
        salt
      );

      const receipt = await sendTransactionAsync({ extrinsic });

      addLog("success", `Deployed in block: ${receipt.blockHash}`);
      if (gasEstimation.deployedAddress) {
        addLog("success", `Address: ${gasEstimation.deployedAddress}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Deploy failed";
      addLog("error", message);
    }
  };

  if (!isAssetHub && client) {
    return (
      <div className="flex flex-col h-full p-3 gap-3">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Deploy
        </h3>
        <ChainRequiredBanner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
      {/* Constructor */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Constructor
        </h3>
        <ConstructorForm abi={abi} onEncodedChange={setConstructorData} hasHexFallback={needsHexFallback} />
        {needsHexFallback && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Constructor Data (hex)</Label>
            <Input
              type="text"
              value={hexDataInput}
              onChange={handleHexDataChange}
              className={`font-mono text-xs h-8 ${hexDataError ? "border-red-500" : ""}`}
              placeholder="0x..."
            />
            {hexDataError && (
              <p className="text-xs text-red-500">{hexDataError}</p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Config */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Config
        </h3>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Value ({symbol})</Label>
          <Input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="font-mono text-xs h-8"
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Salt (optional)</Label>
          <Input
            type="text"
            value={saltInput}
            onChange={(e) => setSaltInput(e.target.value)}
            className="font-mono text-xs h-8"
            placeholder="0x... or leave empty"
          />
        </div>
      </div>

      {/* Gas estimation */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          disabled={!code || !account || gasEstimation.estimating || !!hexDataError}
          onClick={handleEstimate}
        >
          {gasEstimation.estimating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          {gasEstimation.estimating ? "Estimating..." : "Estimate Gas"}
        </Button>

        {gasEstimation.weightRequired && (
          <div className="text-xs text-muted-foreground space-y-0.5 rounded-md border border-border bg-muted/50 p-2">
            <p>
              Weight: {formatWeight(gasEstimation.weightRequired)}
            </p>
            {gasEstimation.storageDeposit && (
              <p>
                Storage ({gasEstimation.storageDeposit.type}):{" "}
                {formatFee(gasEstimation.storageDeposit.value, symbol, decimals)}
              </p>
            )}
            {gasEstimation.gasConsumed !== null && (
              <p>Gas consumed: {gasEstimation.gasConsumed.toString()}</p>
            )}
          </div>
        )}

        {gasEstimation.error && (
          <p className="text-xs text-red-500">{gasEstimation.error}</p>
        )}
      </div>

      <Separator />

      {/* Deploy */}
      <Button
        type="button"
        size="sm"
        className="w-full gap-1.5"
        disabled={!code || !account || isPending || !gasEstimation.weightRequired || !!hexDataError}
        onClick={handleDeploy}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Rocket className="h-3.5 w-3.5" />
        )}
        {isPending
          ? "Deploying..."
          : !account
            ? "Connect Wallet"
            : !code
              ? "Compile First"
              : "Deploy"}
      </Button>

      {/* Transaction log */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
          Log
        </h3>
        <div className="h-[150px] rounded-md border border-border">
          <TransactionLog entries={logEntries} />
        </div>
      </div>
    </div>
  );
}
