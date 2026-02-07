import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import type { ParamInputProps } from "../types";
import { findComponent } from "@/lib/input-map";

interface OptionProps extends ParamInputProps {
  children?: React.ReactNode;
}

const schema = z.any().optional();

export function Option({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  value: externalValue,
  children,
  client,
  typeId,
}: OptionProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);

  // Resolve the inner type from metadata (Option is Enum with None/Some variants)
  const innerType = React.useMemo(() => {
    if (!client || typeId === undefined) return null;
    try {
      const typeInfo = client.registry.findType(typeId);
      const typeDef = typeInfo?.typeDef;
      // Option in Dedot = Enum with members [None, Some(T)]
      if (typeDef && typeDef.type === "Enum") {
        const someVariant = typeDef.value.members?.find(
          (m: any) => m.name === "Some"
        );
        if (someVariant && someVariant.fields?.length === 1) {
          const innerTypeId = someVariant.fields[0].typeId;
          const innerTypeInfo = client.registry.findType(innerTypeId);
          const path = (innerTypeInfo as any)?.path as string[] | undefined;
          const typeName = path && path.length > 0 ? path[path.length - 1] : "";
          return { typeId: innerTypeId, typeName };
        }
      }
    } catch {
      // Type lookup failed
    }
    return null;
  }, [client, typeId]);

  // Sync from external value: if a value is provided, auto-enable
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      setIsEnabled(true);
    }
  }, [externalValue]);

  const handleSwitchChange = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onChange?.(undefined);
    }
  };

  const handleChildChange = (value: any) => {
    if (isEnabled) {
      onChange?.(value);
    }
  };

  // Build the child component: use passed children or self-resolve from metadata
  const renderedChild = React.useMemo(() => {
    if (children) {
      // Legacy: clone provided children
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isDisabled: !isEnabled || isDisabled,
            onChange: handleChildChange,
            value: externalValue,
          });
        }
        return child;
      });
    }

    if (innerType) {
      // Self-resolving: derive inner component from metadata
      const resolved = findComponent(innerType.typeName, innerType.typeId, client);
      const InnerComponent = resolved.component;
      return (
        <InnerComponent
          client={client}
          name={`${name}-value`}
          label={`${label || name} value`}
          typeId={innerType.typeId}
          typeName={innerType.typeName}
          isDisabled={!isEnabled || isDisabled}
          value={externalValue}
          onChange={handleChildChange}
        />
      );
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, innerType, isEnabled, isDisabled, externalValue, client, name, label]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isEnabled ? "Some" : "None"}
          </span>
          <Switch
            id={`${name}-switch`}
            checked={isEnabled}
            onCheckedChange={handleSwitchChange}
            disabled={isDisabled}
          />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {renderedChild}
          </motion.div>
        )}
      </AnimatePresence>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Option.schema = schema;
