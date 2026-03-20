"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DedotClient } from "dedot";
import type { AssetHubApi, GenericChainClient } from "@/lib/chain-types";
import { hasReviveApi } from "@/lib/chain-types";

export interface GasEstimationResult {
  estimating: boolean;
  weightRequired: { refTime: bigint; proofSize: bigint } | null;
  storageDeposit: { type: "Charge" | "Refund"; value: bigint } | null;
  gasConsumed: bigint | null;
  deployedAddress: string | null;
  error: string | null;
  estimate: () => Promise<void>;
}

const BUFFER_PERCENT = BigInt(10);

function applyBuffer(value: bigint): bigint {
  return value + (value * BUFFER_PERCENT) / BigInt(100);
}

export function useGasEstimation(
  client: GenericChainClient | null,
  origin: string,
  value: bigint,
  code: string | Uint8Array,
  data: string,
  salt?: string
): GasEstimationResult {
  const [estimating, setEstimating] = useState(false);
  const [weightRequired, setWeightRequired] = useState<{
    refTime: bigint;
    proofSize: bigint;
  } | null>(null);
  const [storageDeposit, setStorageDeposit] = useState<{
    type: "Charge" | "Refund";
    value: bigint;
  } | null>(null);
  const [gasConsumed, setGasConsumed] = useState<bigint | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invalidate gas estimates when any deploy input changes (including account)
  const prevInputsRef = useRef({ origin, value, code, data, salt });
  useEffect(() => {
    const prev = prevInputsRef.current;
    if (
      prev.origin !== origin ||
      prev.value !== value ||
      prev.code !== code ||
      prev.data !== data ||
      prev.salt !== salt
    ) {
      prevInputsRef.current = { origin, value, code, data, salt };
      setWeightRequired(null);
      setStorageDeposit(null);
      setGasConsumed(null);
      setDeployedAddress(null);
      setError(null);
    }
  }, [origin, value, code, data, salt]);

  const estimate = useCallback(async () => {
    if (!client) {
      setError("No client connected");
      return;
    }

    if (!hasReviveApi(client)) {
      setError("Connected chain does not support Revive API. Switch to an Asset Hub chain.");
      return;
    }

    if (!origin) {
      setError("No account connected. Connect a wallet first.");
      return;
    }

    if (!code) {
      setError("No bytecode provided. Compile a contract first.");
      return;
    }

    setEstimating(true);
    setError(null);
    setWeightRequired(null);
    setStorageDeposit(null);
    setGasConsumed(null);
    setDeployedAddress(null);

    try {
      const assetHubClient = client as DedotClient<AssetHubApi>;

      // Prepare code as Upload variant — ensure hex string type
      const codeHex = typeof code === "string" ? code : `0x${Buffer.from(code).toString("hex")}`;
      const codeParam = { type: "Upload" as const, value: codeHex as `0x${string}` };

      // Salt: undefined means no salt
      const saltParam = salt && salt !== "" ? (salt as `0x${string}`) : undefined;

      const result = await assetHubClient.call.reviveApi.instantiate(
        origin,
        value,
        undefined, // gas_limit: let the runtime estimate
        undefined, // storage_deposit_limit: let the runtime estimate
        codeParam,
        (data || "0x") as `0x${string}`,
        saltParam
      );

      // Check if the dry-run succeeded before populating estimate state
      if (result.result.isOk) {
        // Apply 10% buffer to weight
        const bufferedWeight = {
          refTime: applyBuffer(result.weightRequired.refTime),
          proofSize: applyBuffer(result.weightRequired.proofSize),
        };
        setWeightRequired(bufferedWeight);

        // Storage deposit with buffer (only for Charge)
        const sd = result.storageDeposit;
        if (sd.type === "Charge") {
          setStorageDeposit({
            type: "Charge",
            value: applyBuffer(sd.value),
          });
        } else {
          setStorageDeposit({
            type: "Refund",
            value: sd.value,
          });
        }

        setGasConsumed(result.gasConsumed);

        const instantiateResult = result.result.value;
        if (instantiateResult.addr) {
          const addr = instantiateResult.addr;
          setDeployedAddress(typeof addr === "string" ? addr : String(addr));
        }
      } else {
        // Dry-run failed — keep estimate state null so consumers don't act on it
        const dispatchError = result.result.err;
        const errorMsg = dispatchError
          ? `Dry-run failed: ${JSON.stringify(dispatchError)}`
          : "Dry-run failed with unknown error";
        setError(errorMsg);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gas estimation failed";
      setError(message);
    } finally {
      setEstimating(false);
    }
  }, [client, origin, value, code, data, salt]);

  return {
    estimating,
    weightRequired,
    storageDeposit,
    gasConsumed,
    deployedAddress,
    error,
    estimate,
  };
}
