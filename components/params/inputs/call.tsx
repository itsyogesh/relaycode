import React, { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/builder/combobox";
import { createSectionOptions, createMethodOptions } from "@/lib/parser";
import { findComponent } from "@/lib/input-map";
import { stringCamelCase, assert } from "dedot/utils";
import type { ParamInputProps } from "../types";

const schema = z.object({
  type: z.string(),
  value: z.any(),
});

export function Call({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
}: ParamInputProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [args, setArgs] = useState<Record<string, unknown>>({});

  // Get sections from metadata
  const sections = useMemo(() => {
    if (!client?.metadata?.latest) return [];
    return createSectionOptions(client.metadata.latest) || [];
  }, [client]);

  // Get methods for selected section
  const methods = useMemo(() => {
    if (!client || !selectedSection) return [];
    const sectionIndex = parseInt(selectedSection.split(":")[0]);
    return createMethodOptions(client, sectionIndex) || [];
  }, [client, selectedSection]);

  // Get method fields (parameters) for selected method
  const methodFields = useMemo(() => {
    if (!client || !selectedSection || !selectedMethod) return [];

    try {
      const sectionIndex = parseInt(selectedSection.split(":")[0]);
      const methodIndex = parseInt(selectedMethod.split(":")[0]);

      // Find the pallet
      const pallet = client.metadata.latest.pallets.find(
        (p) => p.index === sectionIndex
      );
      if (!pallet?.calls) return [];

      // Get the calls type
      const callsTypeId = typeof pallet.calls === "number" ? pallet.calls : pallet.calls.typeId;
      const palletCalls = client.registry.findType(callsTypeId);
      assert(palletCalls.typeDef.type === "Enum");

      // Find the specific method variant
      const methodVariant = palletCalls.typeDef.value.members.find(
        (m) => m.index === methodIndex
      );
      if (!methodVariant) return [];

      // Return the fields for this method
      return methodVariant.fields.map((field, index) => ({
        name: field.name || `arg${index}`,
        typeId: field.typeId,
        typeName: field.typeName || "",
      }));
    } catch (e) {
      console.error("Failed to get method fields:", e);
      return [];
    }
  }, [client, selectedSection, selectedMethod]);

  // Reset method and args when section changes
  useEffect(() => {
    setSelectedMethod("");
    setArgs({});
  }, [selectedSection]);

  // Reset args when method changes
  useEffect(() => {
    setArgs({});
  }, [selectedMethod]);

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
  };

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
  };

  const handleArgChange = (fieldName: string, value: unknown) => {
    const newArgs = { ...args, [fieldName]: value };
    setArgs(newArgs);
    emitValue(selectedSection, selectedMethod, newArgs);
  };

  const emitValue = (
    section: string,
    method: string,
    argValues: Record<string, unknown>
  ) => {
    if (!section || !method) {
      onChange?.(undefined);
      return;
    }

    // Get pallet and method names
    const palletName = section.split(":")[1];
    const methodName = method.split(":")[1];

    // Build the call value structure that Dedot expects
    // Format: { type: "PalletName", value: { type: "methodName", ...args } }
    const callValue = {
      type: stringCamelCase(palletName),
      value: {
        type: stringCamelCase(methodName),
        ...argValues,
      },
    };

    onChange?.(callValue);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <FormDescription>{description}</FormDescription>}
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Pallet/Section selector */}
          <div className="flex flex-row items-center justify-between">
            <label className="text-sm font-medium">Pallet</label>
            <Combobox
              items={sections.map((s) => ({
                value: s.value,
                label: s.text,
              }))}
              value={selectedSection}
              onValueChange={handleSectionChange}
              placeholder="Select pallet"
              searchPlaceholder="Search pallets..."
              disabled={isDisabled}
              width="w-[200px]"
            />
          </div>

          {/* Method/Function selector */}
          {selectedSection && (
            <div className="flex flex-row items-center justify-between">
              <label className="text-sm font-medium">Method</label>
              <Combobox
                items={methods.map((m) => ({
                  value: m.value,
                  label: m.text,
                }))}
                value={selectedMethod}
                onValueChange={handleMethodChange}
                placeholder="Select method"
                searchPlaceholder="Search methods..."
                disabled={isDisabled || !selectedSection}
                width="w-[200px]"
              />
            </div>
          )}

          {/* Method parameters */}
          {selectedMethod && methodFields.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Parameters
              </label>
              {methodFields.map((field) => {
                const resolved = findComponent(field.typeName, field.typeId, client);
                const Component = resolved.component;
                return (
                  <div key={field.name} className="ml-4">
                    <Component
                      client={client}
                      name={`${name}-${field.name}`}
                      label={field.name}
                      description={field.typeName}
                      typeId={field.typeId}
                      typeName={field.typeName}
                      isDisabled={isDisabled}
                      onChange={(value: unknown) => handleArgChange(field.name, value)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Show message if method has no parameters */}
          {selectedMethod && methodFields.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              This method has no parameters
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Call.schema = schema;
