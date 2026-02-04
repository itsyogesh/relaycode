import React, { useState, useEffect } from "react";
import { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
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
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GenericTxCall } from "dedot/types";
import { stringCamelCase } from "dedot/utils";
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
import { findComponent } from "@/lib/input-map";
import { BuilderFormValues } from "@/app/builder/page";
import { useAccount, useSendTransaction } from "@luno-kit/react";
import { toast } from "sonner";

interface ExtrinsicBuilderProps {
  client: DedotClient<PolkadotApi>;
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
  const { sendTransactionAsync, isPending } = useSendTransaction();

  const [methods, setMethods] = useState<
    { text: string; value: number }[] | null
  >([]);

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

    try {
      // Build the args array from form data matching tx field order
      const args = tx.meta?.fields?.map((field) => data[field.name || ""]) ?? [];

      // Create the submittable extrinsic by calling the tx function with args
      const extrinsic = (tx as any)(...args);

      toast.info("Signing and submitting transaction...");

      const receipt = await sendTransactionAsync({ extrinsic });

      toast.success("Transaction included in block", {
        description: `Block: ${receipt.blockHash}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Transaction failed", { description: message });
      console.error("Error signing and sending extrinsic:", error);
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
                  <FormDescription>
                    {tx?.meta?.docs && tx.meta.docs.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-1 flex-1">
                          {tx.meta.docs[0]}
                        </div>
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
                              <DialogTitle className="space-y-1">
                                <div className="text-xl font-semibold">
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
                                </div>
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
                  </FormDescription>
                </FormItem>
              )}
            />

            {tx?.meta?.fields?.map((arg) => (
              <FormField
                key={arg.name}
                control={builderForm.control}
                name={arg.name || ""}
                render={({ field }) => {
                  const Component = findComponent(arg.typeName || "").component;
                  return (
                    <FormItem className="ml-8">
                      <Component
                        client={client}
                        label={arg.name || ""}
                        {...field}
                      />
                    </FormItem>
                  );
                }}
              />
            ))}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!account || !tx || isPending}
              >
                {isPending
                  ? "Submitting..."
                  : !account
                    ? "Connect Wallet to Submit"
                    : "Sign and Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExtrinsicBuilder;
