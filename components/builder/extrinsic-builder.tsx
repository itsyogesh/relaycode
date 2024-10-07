import React, { useState, useEffect } from "react";
import { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { useKeyring } from "@/context/keyring";
import {
  ClientMethod,
  createMethodOptions,
  createSectionOptions,
} from "@/lib/parser";
import { useForm, Controller } from "react-hook-form";
import { Metadata } from "dedot/codecs";
import { ChainSubmittableExtrinsic } from "@dedot/chaintypes/polkadot/tx";
import { PolkadotRuntimeRuntimeCallLike } from "@dedot/chaintypes/polkadot";
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

interface ExtrinsicBuilderProps {
  client: DedotClient<PolkadotApi>;
  metadata: Metadata["latest"] | null;
  extrinsic: ClientMethod | null;
  onExtrinsicChange: (extrinsic: ClientMethod) => void;
}
interface FormValues {
  section: string;
  method: string;
  [key: string]: string;
}

const ExtrinsicBuilder: React.FC<ExtrinsicBuilderProps> = ({
  client,
  metadata,
  extrinsic,
  onExtrinsicChange,
}) => {
  const { account } = useKeyring();
  const [sections, setSections] = useState<
    { text: string; value: number }[] | null
  >([]);
  const [methods, setMethods] = useState<ClientMethod[] | null>([]);
  const [selectedMethod, setSelectedMethod] = useState<ClientMethod | null>(
    null
  );

  const form = useForm<FormValues>({
    defaultValues: {
      section: "",
      method: "",
    },
  });

  useEffect(() => {
    if (metadata) {
      const sectionOptions = createSectionOptions(metadata);
      setSections(sectionOptions);
    }
  }, [metadata]);

  useEffect(() => {
    const section = form.watch("section");
    console.log("section", section, sections);
    if (section) {
      const newMethods = createMethodOptions(
        client,
        metadata,
        parseInt(section.split(":")[0])
      );
      console.log("newMethods", newMethods);
      setMethods(newMethods);
      updateExtrinsic();
      form.setValue("method", "");
      setSelectedMethod(null);
    }
  }, [form.watch("section")]);

  useEffect(() => {
    const method = form.watch("method");
    const newSelectedMethod =
      methods?.find((m) => m.methodName === method.split(":")[1]) || null;
    setSelectedMethod(newSelectedMethod);

    // Clear previous arg fields and set up new ones
    if (newSelectedMethod && newSelectedMethod.args) {
      const newValues: FormValues = {
        section: form.getValues("section"),
        method: form.getValues("method"),
      };
      newSelectedMethod.args.forEach((arg) => {
        if (arg && arg.name) {
          newValues[arg.name] = "";
        }
      });
      form.reset(newValues);
      updateExtrinsic();
    }
  }, [form.watch("method")]);

  useEffect(() => {
    if (extrinsic) {
      if (
        extrinsic.sectionIndex &&
        extrinsic.sectionName &&
        form.watch("section") !==
          `${extrinsic.sectionIndex}:${extrinsic.sectionName}`
      ) {
        form.setValue(
          "section",
          `${extrinsic.sectionIndex}:${extrinsic.sectionName}`
        );
      }
      if (
        extrinsic.methodIndex &&
        extrinsic.methodName &&
        form.watch("method") !==
          `${extrinsic.methodIndex}:${extrinsic.methodName}`
      ) {
        form.setValue(
          "method",
          `${extrinsic.methodIndex}:${extrinsic.methodName}`
        );
      }

      const newValues: FormValues = {
        section: form.getValues("section"),
        method: form.getValues("method"),
      };

      if (extrinsic.args) {
        extrinsic.args.forEach((arg) => {
          if (arg && arg.name) {
            newValues[arg.name] = arg.value || "";
          }
        });
        form.reset(newValues);
      } else {
        form.reset(newValues);
      }
    }
  }, [extrinsic]);

  const updateExtrinsic = () => {
    if (!client || !metadata) return;

    const section = form.watch("section");
    const method = form.watch("method");

    const args = selectedMethod?.args?.map((arg) => form.watch(arg.name)) || [];

    try {
      const extrinsic: ClientMethod = {
        sectionIndex: section.length ? parseInt(section.split(":")[0]) : -1,
        sectionName: section.length ? section.split(":")[1] : "",
        methodIndex: method.length ? parseInt(method.split(":")[0]) : -1,
        methodName: method.length ? method.split(":")[1] : "",
        args:
          methods
            ?.find((m) => m.methodName === method.split(":")[1])
            ?.args?.map((arg, index) => ({
              name: arg.name,
              type: arg.type,
              value: args[index] || "",
            })) || [],
      };
      onExtrinsicChange(extrinsic);
    } catch (error) {
      console.error("Error creating extrinsic:", error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!client || !account || !selectedMethod) return;

    const section = data.section;
    const method = data.method;

    const args = selectedMethod?.args?.map((arg) => data[arg.name]) || [];

    try {
      const extrinsic = client.tx[section][method](...args);
      const signedExtrinsic = await extrinsic.sign(account.address);
      const txHash = await signedExtrinsic.send();
      console.log("Transaction sent with hash:", txHash);
    } catch (error) {
      console.error("Error signing and sending extrinsic:", error);
    }
  };

  console.log("data", selectedMethod, methods);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extrinsic Builder</CardTitle>
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
                    A section is an extrinsic function section that allows users
                    to choose an overall section to build the extrinsic code.
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
                          key={`${method.sectionIndex}.${method.methodIndex}`}
                          value={`${method.methodIndex}:${method.methodName}`}
                        >
                          {method.methodName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {selectedMethod?.args?.map((arg) => (
              <FormField
                key={arg.name}
                control={form.control}
                name={arg.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{arg.name}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Enter ${arg.name}`}
                        onChange={(e) => {
                          field.onChange(e);
                          updateExtrinsic();
                        }}
                      />
                    </FormControl>
                    <FormDescription>{`${JSON.stringify(client?.registry.findType(arg.type))} Codec:${JSON.stringify(client?.registry.findCodec(arg.type))}`}</FormDescription>
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit" disabled={!account}>
              {account ? "Sign and Submit" : "Connect Wallet to Sign"}
            </Button>
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
