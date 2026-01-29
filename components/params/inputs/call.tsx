import React from "react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParamInputProps } from "../types";

interface CallParam {
  name: string;
  type: string;
  component: React.ReactNode;
}

interface CallFunction {
  name: string;
  description?: string;
  params: CallParam[];
}

interface CallPallet {
  name: string;
  functions: CallFunction[];
}

interface CallProps extends ParamInputProps {
  pallets: CallPallet[];
}

const schema = z.object({
  pallet: z.string(),
  function: z.string(),
  args: z.record(z.string(), z.any()),
});

export function Call({
  name,
  label,
  description,
  isDisabled,
  isRequired,
  error,
  onChange,
  pallets,
}: CallProps) {
  const [selectedPallet, setSelectedPallet] = React.useState<string>();
  const [selectedFunction, setSelectedFunction] = React.useState<string>();
  const [args, setArgs] = React.useState<Record<string, any>>({});

  const handlePalletChange = (value: string) => {
    setSelectedPallet(value);
    setSelectedFunction(undefined);
    setArgs({});
    updateParentValue(value, undefined, {});
  };

  const handleFunctionChange = (value: string) => {
    setSelectedFunction(value);
    setArgs({});
    updateParentValue(selectedPallet, value, {});
  };

  const handleArgChange = (paramName: string, value: any) => {
    const newArgs = {
      ...args,
      [paramName]: value,
    };
    setArgs(newArgs);
    updateParentValue(selectedPallet, selectedFunction, newArgs);
  };

  const updateParentValue = (
    pallet: string | undefined,
    func: string | undefined,
    args: Record<string, any>
  ) => {
    if (pallet && func) {
      onChange?.({
        pallet,
        function: func,
        args,
      });
    } else {
      onChange?.(undefined);
    }
  };

  // Render parameters for selected function
  const renderParams = () => {
    if (!selectedPallet || !selectedFunction) return null;

    const pallet = pallets.find((p) => p.name === selectedPallet);
    const func = pallet?.functions.find((f) => f.name === selectedFunction);

    if (!func) return null;

    return func.params.map((param) => {
      if (React.isValidElement(param.component)) {
        return (
          <div key={param.name} className="mb-4 last:mb-0">
            {React.cloneElement(param.component, {
              ...param.component.props,
              name: `${name}-${param.name}`,
              label: param.name,
              description: `Type: ${param.type}`,
              isDisabled: isDisabled,
              onChange: (value: any) => handleArgChange(param.name, value),
            })}
          </div>
        );
      }
      return null;
    });
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

      <Select
        disabled={isDisabled}
        onValueChange={handlePalletChange}
        value={selectedPallet}
      >
        <SelectTrigger id={`${name}-pallet`}>
          <SelectValue placeholder="Select pallet" />
        </SelectTrigger>
        <SelectContent>
          {pallets.map((pallet) => (
            <SelectItem key={pallet.name} value={pallet.name}>
              {pallet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPallet && (
        <Select
          disabled={isDisabled}
          onValueChange={handleFunctionChange}
          value={selectedFunction}
        >
          <SelectTrigger id={`${name}-function`}>
            <SelectValue placeholder="Select function" />
          </SelectTrigger>
          <SelectContent>
            {pallets
              .find((p) => p.name === selectedPallet)
              ?.functions.map((func) => (
                <SelectItem key={func.name} value={func.name}>
                  {func.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}

      {selectedFunction && renderParams()}
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

Call.schema = schema;
