import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface InputWithAddonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  suffix?: React.ReactNode;
  addonLeft?: React.ReactNode;
}

const InputWithAddon = React.forwardRef<HTMLInputElement, InputWithAddonProps>(
  ({ className, suffix, addonLeft, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {addonLeft && (
          <div className="absolute left-0 flex items-center pl-3 pointer-events-none">
            {addonLeft}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            addonLeft && "pl-10",
            suffix && "pr-28",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-0 flex items-center pr-1">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);
InputWithAddon.displayName = "InputWithAddon";

export { InputWithAddon };
