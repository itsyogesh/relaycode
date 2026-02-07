import React from "react";

export interface ModeOption {
  id: string;
  label: string;
}

interface ModeToggleProps {
  modes: ModeOption[];
  activeMode: string;
  onModeChange: (mode: string) => void;
  disabled?: boolean;
}

export function ModeToggle({ modes, activeMode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex gap-1">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onModeChange(m.id)}
          disabled={disabled}
          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
            activeMode === m.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:bg-accent"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
