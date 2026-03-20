import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { GenericChainClient } from "@/lib/chain-types";
import { hasReviveApi } from "@/lib/chain-types";
import {
  createMethodOptions,
  createSectionOptions,
} from "@/lib/parser";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GenericTxCall } from "dedot/types";
import { stringCamelCase } from "dedot/utils";
import { assert } from "dedot/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import { Combobox } from "@/components/builder/combobox";
import { findComponentWithContext } from "@/lib/input-map";
import { validateAllArgs } from "@/lib/validation";
import { BuilderFormValues } from "@/app/builder/page";
import { useAccount, useSendTransaction } from "@luno-kit/react";
import { toast } from "sonner";
import { usePalletContext } from "@/hooks/use-pallet-context";
import { useGasEstimation } from "@/hooks/use-gas-estimation";
import { useChainToken } from "@/hooks/use-chain-token";
import { formatFee, formatWeight } from "@/lib/fee-display";
import { Loader2, Zap, ArrowRight } from "lucide-react";

interface ExtrinsicBuilderProps {
  client: GenericChainClient;
  tx: GenericTxCall | null;
  onTxChange: (tx: GenericTxCall) => void;
  builderForm: UseFormReturn<BuilderFormValues>;
}

const ExtrinsicBuilder: React.FC<ExtrinsicBuilderProps> = ({
  client,
  tx,
  onTxChange,
  builderForm,
}) => {
  const sections = createSectionOptions(client.metadata.latest);
  const { account } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [methods, setMethods] = useState<
    { text: string; value: number }[] | null
  >([]);

  // Extract pallet and method names from current selection
  const sectionValue = builderForm.watch("section");
  const methodValue = builderForm.watch("method");
  const palletName = sectionValue ? sectionValue.split(":")[1] : undefined;
  const methodName = methodValue ? methodValue.split(":")[1] : undefined;

  // Eagerly fetch contextual data when pallet changes
  const { context: palletContext, isLoading: isContextLoading } =
    usePalletContext(client, palletName);

  const { symbol, decimals } = useChainToken(client);

  // Detect Revive instantiate_with_code for gas estimation
  const isReviveInstantiate =
    palletName === "Revive" && methodName === "instantiate_with_code";

  // Watch form values for gas estimation inputs
  const codeValue = builderForm.watch("code") || "";
  const dataValue = builderForm.watch("data") || "";
  const valueValue = builderForm.watch("value") || "0";
  const saltValue = builderForm.watch("salt") || "";

  const valueBigInt = (() => {
    try {
      return BigInt(valueValue || "0");
    } catch {
      return BigInt(0);
    }
  })();

  const gasEstimation = useGasEstimation(
    isReviveInstantiate ? client : null,
    account?.address || "",
    valueBigInt,
    codeValue,
    dataValue,
    saltValue || undefined
  );

  // Auto-fill weight and storage deposit from gas estimation
  const handleEstimateGas = async () => {
    await gasEstimation.estimate();
  };

  useEffect(() => {
    if (!isReviveInstantiate || !gasEstimation.weightRequired || !tx) return;

    // Resolve weight field names from metadata
    const weightField = tx.meta?.fields?.find((f) => f.name === "weight_limit");
    if (weightField) {
      try {
        const weightType = client.registry.findType(weightField.typeId);
        const { typeDef } = weightType;
        if (typeDef.type === "Struct" && typeDef.value.fields.length >= 2) {
          const [field0, field1] = typeDef.value.fields;
          const name0 = String(field0.name);
          const name1 = String(field1.name);
          builderForm.setValue("weight_limit", {
            [name0]: String(gasEstimation.weightRequired.refTime),
            [name1]: String(gasEstimation.weightRequired.proofSize),
          });
        }
      } catch {
        // Fallback: use camelCase names
        builderForm.setValue("weight_limit", {
          refTime: String(gasEstimation.weightRequired.refTime),
          proofSize: String(gasEstimation.weightRequired.proofSize),
        });
      }
    }

    // Auto-fill storage deposit only for Charge
    if (gasEstimation.storageDeposit?.type === "Charge") {
      builderForm.setValue(
        "storage_deposit_limit",
        String(gasEstimation.storageDeposit.value)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasEstimation.weightRequired, gasEstimation.storageDeposit]);

  useEffect(() => {
    const section = builderForm.watch("section");
    if (section) {
      const newMethods = createMethodOptions(
        client,
        parseInt(section.split(":")[0])
      );
      setMethods(newMethods);
      builderForm.setValue("method", "");
    }
  }, [builderForm.watch("section")]);

  useEffect(() => {
    const method = builderForm.watch("method");
    const section = builderForm.watch("section");
    if (section && method) {
      const newTx =
        client.tx[stringCamelCase(section.split(":")[1])][
          stringCamelCase(method.split(":")[1])
        ];
      onTxChange(newTx);
    }
  }, [builderForm.watch("method")]);

  const onSubmit = async (data: Record<string, any>) => {
    if (!tx || !account) return;

    // Validate all arguments before submission
    const fields = tx.meta?.fields || [];
    const validation = validateAllArgs(client, fields, data);

    if (!validation.valid) {
      // Set form errors for each invalid field
      validation.results.forEach((result, fieldName) => {
        if (!result.valid && result.error) {
          builderForm.setError(fieldName, {
            type: "validation",
            message: result.error,
          });
        }
      });

      toast.error("Validation failed", {
        description: validation.errors.slice(0, 3).join("; "),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build the args array from form data matching tx field order
      const args = fields.map((field) => data[field.name || ""]);

      // Create the submittable extrinsic by calling the tx function with args
      const extrinsic = (tx as any)(...args);

      toast.info("Signing transaction...", {
        description: "Please approve in your wallet extension.",
      });

      const receipt = await sendTransactionAsync({ extrinsic });

      if (receipt.status === "failed") {
        const errorMsg = receipt.errorMessage || receipt.dispatchError
          ? `Dispatch error: ${receipt.errorMessage || JSON.stringify(receipt.dispatchError)}`
          : "Transaction failed on-chain";
        toast.error("Transaction failed", {
          description: errorMsg,
        });
      } else {
        toast.success("Transaction included in block", {
          description: `Block: ${receipt.blockHash}`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      // Distinguish user rejection from other errors
      const isUserRejection =
        message.includes("Cancelled") ||
        message.includes("Rejected") ||
        message.includes("User denied") ||
        message.includes("rejected");
      if (isUserRejection) {
        toast.info("Transaction cancelled by user.");
      } else {
        toast.error("Transaction failed", { description: message });
      }
      console.error("Error signing and sending extrinsic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div>
          <h2 className="text-2xl font-bold">Extrinsic Builder</h2>
          <p className="text-sm text-gray-500">
            Build and analyze extrinsics for Polkadot
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...builderForm}>
          <form
            onSubmit={builderForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={builderForm.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center justify-between">
                    <label className="text-sm font-medium">Section</label>
                    <Combobox
                      items={(sections || []).map((section) => ({
                        value: section.value,
                        label: section.text,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select section"
                      searchPlaceholder="Search sections..."
                    />
                  </div>
                  <FormDescription>
                    {sections
                      ?.find(
                        (s) =>
                          s.value ===
                          parseInt(field.value?.split(":")[0] || "0")
                      )
                      ?.docs.join(", ")}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={builderForm.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center justify-between">
                    <label className="text-sm font-medium">Method</label>
                    <Combobox
                      items={(methods || []).map((method) => ({
                        value: method.value,
                        label: method.text,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select method"
                      searchPlaceholder="Search methods..."
                      disabled={!builderForm.watch("section")}
                    />
                  </div>
                  {tx?.meta?.docs && tx.meta.docs.length > 0 && (
                    <div className="flex items-center justify-between text-[0.8rem] text-muted-foreground">
                      <span className="line-clamp-1 flex-1">
                        {tx.meta.docs[0]}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-[0.8rem] text-foreground ml-2"
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              <span className="text-xl font-semibold">
                                {sections?.find(
                                  (s) =>
                                    s.value ===
                                    parseInt(
                                      builderForm
                                        .watch("section")
                                        ?.split(":")[0] || "0"
                                    )
                                )?.text || ""}{" "}
                                /{" "}
                                {methods?.find(
                                  (m) =>
                                    `${m.value}:${m.text}` ===
                                    builderForm.watch("method")
                                )?.text || ""}
                              </span>
                            </DialogTitle>
                            <DialogDescription>
                              Function Documentation
                            </DialogDescription>
                          </DialogHeader>
                          <Separator className="space-y-4" />
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>
                              {tx?.meta?.docs.join("\n")}
                            </ReactMarkdown>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {tx?.meta?.fields?.map((arg) => (
              <FormField
                key={arg.name}
                control={builderForm.control}
                name={arg.name || ""}
                render={({ field }) => {
                  const resolved = findComponentWithContext(
                    palletName,
                    methodName,
                    arg.name || "",
                    arg.typeName || "",
                    arg.typeId,
                    client,
                    palletContext
                  );
                  const Component = resolved.component;
                  return (
                    <FormItem className="ml-8">
                      <Component
                        client={client}
                        label={arg.name || ""}
                        typeName={arg.typeName || ""}
                        typeId={resolved.typeId}
                        palletContext={palletContext}
                        isContextLoading={isContextLoading}
                        {...field}
                      />
                    </FormItem>
                  );
                }}
              />
            ))}
            {/* Gas estimation for Revive instantiate_with_code */}
            {isReviveInstantiate && (
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={
                      !codeValue ||
                      !account ||
                      gasEstimation.estimating
                    }
                    onClick={handleEstimateGas}
                  >
                    {gasEstimation.estimating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    {gasEstimation.estimating
                      ? "Estimating..."
                      : "Estimate Gas"}
                  </Button>
                  <Link
                    href="/studio"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    Open in Contract Studio
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {gasEstimation.weightRequired && (
                  <div className="text-xs text-muted-foreground space-y-0.5 rounded-md border border-border bg-muted/50 p-2.5">
                    <p>
                      Weight: {formatWeight(gasEstimation.weightRequired)}
                    </p>
                    {gasEstimation.storageDeposit && (
                      <p>
                        Storage ({gasEstimation.storageDeposit.type}):{" "}
                        {formatFee(
                          gasEstimation.storageDeposit.value,
                          symbol,
                          decimals
                        )}
                      </p>
                    )}
                  </div>
                )}

                {gasEstimation.error && (
                  <p className="text-xs text-red-500">
                    {gasEstimation.error}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!account || !tx || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : !account ? (
                  "Connect Wallet to Submit"
                ) : (
                  "Sign and Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExtrinsicBuilder;
