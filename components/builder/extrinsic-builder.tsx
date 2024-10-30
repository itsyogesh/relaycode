import React, { useState, useEffect } from "react";
import { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import {
  createMethodOptions,
  createSectionOptions,
  getArgType,
} from "@/lib/parser";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericTxCall } from "dedot/types";
import { stringCamelCase } from "dedot/utils";

interface ExtrinsicBuilderProps {
  client: DedotClient<PolkadotApi>;
  tx: GenericTxCall<"v2"> | null;
  onTxChange: (tx: GenericTxCall<"v2">) => void;
  onSectionChange: (section: { text: string; value: number } | null) => void;
}
interface FormValues {
  section: string;
  method: string;
  [key: string]: string;
}

const ExtrinsicBuilder: React.FC<ExtrinsicBuilderProps> = ({
  client,
  tx,
  onTxChange,
  onSectionChange,
}) => {
  const [sections, setSections] = useState<
    { text: string; value: number; docs: string[] }[] | null
  >([]);
  const [methods, setMethods] = useState<
    { text: string; value: number }[] | null
  >([]);
  const [expandedDocs, setExpandedDocs] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      section: "",
      method: "",
    },
  });

  useEffect(() => {
    if (client) {
      const sectionOptions = createSectionOptions(client.metadata.latest);
      setSections(sectionOptions);
    }
  }, [client]);

  useEffect(() => {
    const section = form.watch("section");
    if (section) {
      const newMethods = createMethodOptions(
        client,
        parseInt(section.split(":")[0])
      );
      setMethods(newMethods);
      form.setValue("method", "");
      if (section) {
        onSectionChange(
          sections?.find((s) => s.value === parseInt(section.split(":")[0])) ||
            null
        );
      }
    }
  }, [form.watch("section")]);

  useEffect(() => {
    const method = form.watch("method");
    const section = form.watch("section");
    if (section && method) {
      const newTx =
        client.tx[stringCamelCase(section.split(":")[1])][
          stringCamelCase(method.split(":")[1])
        ];
      console.log("newTx", newTx);
      onTxChange(newTx);
    }
  }, [form.watch("method")]);

  useEffect(() => {
    console.log("transaction_update", tx);
    // if (tx?.meta?.fields) {
    //   const newValues: FormValues = {
    //     section: form.getValues("section"),
    //     method: form.getValues("method"),
    //   };
    //   tx?.meta?.fields.forEach((arg) => {
    //     if (arg && arg.name) {
    //       newValues[arg.name] = "";
    //     }
    //   });
    //   form.reset(newValues);
    // }
  }, [tx]);

  const onSubmit = async (data: any) => {
    // if (!tx || !account) return;
    // try {
    //   const extrinsic = tx(...data.args?.map((arg: any) => arg.value));
    //   const signedExtrinsic = await extrinsic.sign(account.address);
    //   const txHash = await signedExtrinsic.send();
    //   console.log("Transaction sent with hash:", txHash);
    // } catch (error) {
    //   console.error("Error signing and sending extrinsic:", error);
    // }
  };

  console.log("tx_in_body", tx);

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Extrinsic Builder</h2>
        <p className="text-sm text-gray-500">
          Build and analyze extrinsics for Polkadot
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a section</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sections?.map((section) => (
                        <SelectItem
                          key={section.value}
                          value={`${section.value}:${section.text}`}
                        >
                          {section.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {sections
                      ?.find(
                        (s) => s.value === parseInt(field.value.split(":")[0])
                      )
                      ?.docs.join(", ")}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select extrinsic function</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {methods?.map((method) => (
                        <SelectItem
                          key={`${method.value}`}
                          value={`${method.value}:${method.text}`}
                        >
                          {method.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {tx?.meta?.docs && tx.meta.docs.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div
                          className={`${!expandedDocs ? "line-clamp-1" : ""} flex-1`}
                        >
                          {tx.meta.docs.join(" ")}
                        </div>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal ml-2"
                          onClick={() => setExpandedDocs(!expandedDocs)}
                        >
                          {expandedDocs ? "Show Less" : "Show More"}
                        </Button>
                      </div>
                    )}
                  </FormDescription>
                </FormItem>
              )}
            />

            {tx?.meta?.fields?.map((arg) => (
              <FormField
                key={arg.name}
                control={form.control}
                name={arg.name || ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{`${arg.name}: (${arg.typeName})`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Enter ${arg.name}`}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {`${arg.docs?.join(" ") || " "} ${JSON.stringify(
                        getArgType(client, arg.typeId)
                      )}`}
                    </FormDescription>
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit">Sign and Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExtrinsicBuilder;

// useEffect(() => {
//   if (client && selectedMethod) {
//     const extrinsic = client.tx[selectedMethod.section][
//       selectedMethod.method
//     ](...args?.map((arg) => arg.value));
//     onExtrinsicChange(extrinsic);
//   }
// }, [client, selectedMethod]);

// const signAndSubmitExtrinsic = async () => {
//   if (!selectedMethod || !account || !window.injected || !api) return;

//   const { section, method, args } = selectedMethod;

//   const extrinsic = client.tx[section][method](
//     ...args.map((arg, index) => {
//       const input = args[index];
//       return input.value || input.placeholder || "";
//     })
//   );

//   const signer = window.injected.signer as Signer;
//   api.setSigner(signer);

//   try {
//     const unsub = await extrinsic.signAndSend(account.address, (result) => {
//       toast.info("Extrinsic status: " + result.status.toString);
//       if (result.status.isFinalized) {
//         toast.success(
//           "Extrinsic finalized at block: " +
//             result.status.asFinalized.toString()
//         );
//         unsub();
//       }
//     });
//   } catch (error) {
//     toast.error("Error signing and sending extrinsic: " + error);
//   }
// };
