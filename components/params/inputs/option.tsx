import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { ParamInputProps } from "../types";

interface OptionProps extends ParamInputProps {
  children: React.ReactNode;
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
  children,
}: OptionProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);

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

  // Clone the child component with modified props
  const childComponent = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        isDisabled: !isEnabled || isDisabled,
        onChange: handleChildChange,
      });
    }
    return child;
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Switch
          id={`${name}-switch`}
          checked={isEnabled}
          onCheckedChange={handleSwitchChange}
          disabled={isDisabled}
        />
      </div>
      <div className={isEnabled ? "opacity-100" : "opacity-50 pointer-events-none"}>
        {childComponent}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Option.schema = schema;
