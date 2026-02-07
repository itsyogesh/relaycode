import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface KeyValueProps extends ParamInputProps {
  keyComponent?: React.ReactNode;
  valueComponent?: React.ReactNode;
}

const schema = z.object({
  key: z.any(),
  value: z.any(),
});

export function KeyValue({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  client,
  typeId,
  keyComponent,
  valueComponent,
}: KeyValueProps) {
  const [keyValue, setKeyValue] = React.useState<any>();
  const [valueValue, setValueValue] = React.useState<any>();

  // Try to resolve key/value types from metadata when no explicit components
  const resolvedTypes = React.useMemo(() => {
    if (keyComponent || valueComponent) return null;
    if (!client || typeId === undefined) return null;

    try {
      const typeInfo = client.registry.findType(typeId);
      if (typeInfo.typeDef.type === "Tuple" && typeInfo.typeDef.value.fields.length === 2) {
        const keyTypeId = typeInfo.typeDef.value.fields[0];
        const valTypeId = typeInfo.typeDef.value.fields[1];
        const keyTypeInfo = client.registry.findType(keyTypeId);
        const valTypeInfo = client.registry.findType(valTypeId);
        const keyTypeName = keyTypeInfo.path?.join("::") || keyTypeInfo.typeDef.type || "";
        const valTypeName = valTypeInfo.path?.join("::") || valTypeInfo.typeDef.type || "";
        return {
          key: { typeId: keyTypeId, typeName: keyTypeName, resolved: findComponent(keyTypeName, keyTypeId, client) },
          value: { typeId: valTypeId, typeName: valTypeName, resolved: findComponent(valTypeName, valTypeId, client) },
        };
      }
    } catch {
      // Type resolution failed
    }
    return null;
  }, [client, typeId, keyComponent, valueComponent]);

  const handleKeyChange = (value: any) => {
    setKeyValue(value);
    updateParentValue(value, valueValue);
  };

  const handleValueChange = (value: any) => {
    setValueValue(value);
    updateParentValue(keyValue, value);
  };

  const updateParentValue = (key: any, value: any) => {
    if (key !== undefined && value !== undefined) {
      onChange?.({ key, value });
    } else {
      onChange?.(undefined);
    }
  };

  // Render key component
  const renderKeyComponent = () => {
    if (React.isValidElement(keyComponent)) {
      return React.cloneElement(keyComponent as React.ReactElement<any>, {
        name: `${name}-key`,
        label: "Key",
        isDisabled: isDisabled,
        isRequired: isRequired,
        onChange: handleKeyChange,
      });
    }

    // Use resolved typed component if available
    if (resolvedTypes?.key) {
      const KeyComp = resolvedTypes.key.resolved.component;
      return (
        <KeyComp
          client={client}
          name={`${name}-key`}
          label="Key"
          typeId={resolvedTypes.key.typeId}
          typeName={resolvedTypes.key.typeName}
          isDisabled={isDisabled}
          isRequired={isRequired}
          onChange={handleKeyChange}
        />
      );
    }

    // Default to text input if no component provided
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${name}-key`}>Key</Label>
        <Input
          id={`${name}-key`}
          type="text"
          disabled={isDisabled}
          onChange={(e) => handleKeyChange(e.target.value)}
          className="font-mono"
        />
      </div>
    );
  };

  // Render value component
  const renderValueComponent = () => {
    if (React.isValidElement(valueComponent)) {
      return React.cloneElement(valueComponent as React.ReactElement<any>, {
        name: `${name}-value`,
        label: "Value",
        isDisabled: isDisabled,
        isRequired: isRequired,
        onChange: handleValueChange,
      });
    }

    // Use resolved typed component if available
    if (resolvedTypes?.value) {
      const ValComp = resolvedTypes.value.resolved.component;
      return (
        <ValComp
          client={client}
          name={`${name}-value`}
          label="Value"
          typeId={resolvedTypes.value.typeId}
          typeName={resolvedTypes.value.typeName}
          isDisabled={isDisabled}
          isRequired={isRequired}
          onChange={handleValueChange}
        />
      );
    }

    // Default to text input if no component provided
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${name}-value`}>Value</Label>
        <Input
          id={`${name}-value`}
          type="text"
          disabled={isDisabled}
          onChange={(e) => handleValueChange(e.target.value)}
          className="font-mono"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          {renderKeyComponent()}
          {renderValueComponent()}
        </CardContent>
      </Card>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

KeyValue.schema = schema;

// Export KeyValueArray component that uses Vector with KeyValue
export { Vector as KeyValueArray } from "./vector";
