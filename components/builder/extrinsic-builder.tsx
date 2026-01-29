import React, { useState, useEffect } from "react";
import { DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import {
  createMethodOptions,
  createSectionOptions,
  getArgType,
} from "@/lib/parser";
import { useForm, UseFormReturn } from "react-hook-form";
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
import { AlertCircle } from "lucide-react";
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
import { Field } from "dedot/codecs";
import { BuilderFormValues } from "@/app/builder/page";

interface ExtrinsicBuilderProps {
  client: DedotClient<PolkadotApi>;
  tx: GenericTxCall | null;
  onTxChange: (tx: GenericTxCall) => void;
  builderForm: UseFormReturn<BuilderFormValues>;
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
  builderForm,
}) => {
  const sections = createSectionOptions(client.metadata.latest);

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
      console.log("newTx", newTx);
      onTxChange(newTx);
    }
  }, [builderForm.watch("method")]);

  const getAllTypes = () => {
    const allTypes: Field[] = [];
    sections?.forEach((section) => {
      const methods = createMethodOptions(client, section.value);
      // const typeArray = printType(section.text, methods || []);
      // typeArray.forEach((type) => {
      //   allTypes.push(type);
      // });
    });
    return allTypes;
  };

  const printType = (
    section: string,
    methods: { text: string; value: number }[]
  ) => {
    const typeArray: Field[] = [];

    methods.forEach((method) => {
      const tx =
        client.tx[stringCamelCase(section)][stringCamelCase(method.text)];
      tx.meta?.fields?.map((arg) => {
        typeArray.push(arg);
      });
    });
    return typeArray;
  };

  /*
  {
    "name": "asset_kind",
    "typeId": 55,
    "typeName": "Box<T::AssetKind>",
    "docs": []
  },
  */

  useEffect(() => {
    const allTypes = getAllTypes();
    const uniqueTypes = allTypes.reduce((acc: Field[], curr) => {
      if (!acc.find((item) => item.typeName === curr.typeName)) {
        acc.push(curr);
      }
      return acc;
    }, []);
    const uniqueTypesByTypeId = uniqueTypes.reduce((acc: Field[], curr) => {
      if (!acc.find((item) => item.typeId === curr.typeId)) {
        acc.push(curr);
      }
      return acc;
    }, []);
    // console.log("Unique Types Length:", uniqueTypes.length);
    // console.log("Unique Types By TypeId Length:", uniqueTypesByTypeId.length);
    // console.log("Unique TypeIds", JSON.stringify(uniqueTypesByTypeId, null, 2));
  }, [sections]);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Extrinsic Builder</h2>
        <p className="text-sm text-gray-500">
          Build and analyze extrinsics for Polkadot
        </p>
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
                    <FormLabel>Section</FormLabel>
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
                    <FormLabel>Method</FormLabel>
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
                  //console.log("argument array", arg);
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
              <Button type="submit">Sign and Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExtrinsicBuilder;
