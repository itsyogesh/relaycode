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
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

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
  const sections = createSectionOptions(client.metadata.latest);

  const [methods, setMethods] = useState<
    { text: string; value: number }[] | null
  >([]);
  const [expandedDocs, setExpandedDocs] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      section: "",
      method: "",
    },
  });

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
  console.log("sections", sections);

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
                  <div className="flex flex-row items-center justify-between">
                    <FormLabel>Section</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              "w-[240px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? sections?.find(
                                  (section) =>
                                    `${section.value}:${section.text}` ===
                                    field.value
                                )?.text
                              : "Select section"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search sections..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No section found.</CommandEmpty>
                            <CommandGroup>
                              {sections && sections.length > 0 ? (
                                sections
                                  .map((section) => {
                                    console.log(
                                      "section inside command group",
                                      section
                                    );
                                    return {
                                      value: section.value,
                                      label: section.text,
                                    };
                                  })
                                  .map((section) => (
                                    <CommandItem
                                      key={section.value}
                                      value={`${section.value}:${section.label}`}
                                      onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setOpen(false);
                                      }}
                                    >
                                      {section.label}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value ===
                                            `${section.value}:${section.label}`
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))
                              ) : (
                                <CommandItem disabled>
                                  Loading sections...
                                </CommandItem>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center justify-between">
                    <FormLabel>Method</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={!form.watch("section")}
                            className={cn(
                              "w-[240px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? methods?.find(
                                  (method) =>
                                    `${method.value}:${method.text}` ===
                                    field.value
                                )?.text
                              : "Select method"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search methods..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No method found.</CommandEmpty>
                            <CommandGroup>
                              {!form.watch("section") ? (
                                <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Please select a section first
                                  </p>
                                </div>
                              ) : methods && methods.length > 0 ? (
                                methods.map((method) => (
                                  <CommandItem
                                    key={method.value}
                                    value={`${method.value}:${method.text}`}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue);
                                    }}
                                  >
                                    {method.text}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.value ===
                                          `${method.value}:${method.text}`
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))
                              ) : (
                                <CommandItem disabled>
                                  Loading methods...
                                </CommandItem>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                                        form.watch("section")?.split(":")[0] ||
                                          "0"
                                      )
                                  )?.text || ""}{" "}
                                  /{" "}
                                  {methods?.find(
                                    (m) =>
                                      `${m.value}:${m.text}` ===
                                      form.watch("method")
                                  )?.text || ""}
                                </div>
                                <div className="text-sm font-normal text-muted-foreground">
                                  Function Documentation
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                  {tx?.meta?.docs.join("\n")}
                                </ReactMarkdown>
                              </div>
                              {tx?.meta?.fields &&
                                tx.meta.fields.length > 0 && (
                                  <div className="space-y-2">
                                    <h3 className="text-sm font-semibold">
                                      Parameters:
                                    </h3>
                                    <div className="space-y-1">
                                      {tx.meta.fields.map((field, index) => (
                                        <div key={index} className="text-sm">
                                          <span className="font-medium">
                                            {field.name}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {" "}
                                            ({field.typeName})
                                          </span>
                                          {field.docs &&
                                            field.docs.length > 0 && (
                                              <div className="ml-4 prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>
                                                  {field.docs.join(" ")}
                                                </ReactMarkdown>
                                              </div>
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
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
