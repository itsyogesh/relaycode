"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, AlertCircle } from "lucide-react";
import { stringCamelCase } from "dedot/utils";
import type { HexTreeNode } from "@/lib/codec";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

interface FieldHexDisplayProps {
  fieldName: string;
  typeName?: string;
  hex: string;
  decomposition: HexTreeNode;
  editing: boolean;
  error?: string | null;
  hasError?: boolean;
  onHexChange: (hex: string) => void;
  onSubHexChange?: (path: (string | number)[], hex: string, typeId: number) => void;
}

export const FieldHexDisplay: React.FC<FieldHexDisplayProps> = ({
  fieldName,
  typeName,
  hex,
  decomposition,
  editing,
  error,
  hasError,
  onHexChange,
  onSubHexChange,
}) => {
  if (decomposition.kind === "leaf") {
    return (
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {stringCamelCase(fieldName)} Hex
          </Label>
          {typeName && (
            <span className="text-xs text-gray-400 font-mono">{typeName}</span>
          )}
        </div>
        <div className="flex items-center">
          <Input
            value={hex || "0x"}
            onChange={(e) => onHexChange(e.target.value)}
            disabled={!editing}
            className={`font-mono text-blue-500 ${hasError ? "border-red-500" : ""}`}
          />
          {hex && hex !== "0x" && <CopyButton text={hex} />}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // Compound node — render parent label + children
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {stringCamelCase(fieldName)} Hex
        </Label>
        {typeName && (
          <span className="text-xs text-gray-400 font-mono">{typeName}</span>
        )}
      </div>
      {/* Top-level (concatenated) hex — read-only, for reference */}
      <div className="flex items-center">
        <Input
          value={hex || "0x"}
          onChange={(e) => onHexChange(e.target.value)}
          disabled={!editing}
          className={`font-mono text-blue-500 ${hasError ? "border-red-500" : ""}`}
        />
        {hex && hex !== "0x" && <CopyButton text={hex} />}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Per-element sub-hex inputs */}
      <div className="ml-4 border-l-2 border-muted pl-3 mt-2 space-y-2">
        {decomposition.children.map((child, i) => {
          const childLabel = `${stringCamelCase(fieldName)}${child.label}`;
          const childPath = buildPath(child.label, decomposition.compoundType);

          return (
            <SubHexNode
              key={i}
              label={childLabel}
              child={child}
              path={childPath}
              editing={editing}
              onSubHexChange={onSubHexChange}
            />
          );
        })}
      </div>
    </div>
  );
};

interface SubHexNodeProps {
  label: string;
  child: { label: string; typeId: number; hex: string; children?: HexTreeNode };
  path: (string | number)[];
  editing: boolean;
  onSubHexChange?: (path: (string | number)[], hex: string, typeId: number) => void;
}

const SubHexNode: React.FC<SubHexNodeProps> = ({
  label,
  child,
  path,
  editing,
  onSubHexChange,
}) => {
  const node = child.children;

  // If this child has its own compound children, recurse
  if (node && node.kind === "compound") {
    return (
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          {label} Hex
        </Label>
        <div className="flex items-center">
          <Input
            value={child.hex || "0x"}
            onChange={(e) => onSubHexChange?.(path, e.target.value, child.typeId)}
            disabled={!editing}
            className="font-mono text-blue-400 text-sm h-8"
          />
          {child.hex && child.hex !== "0x" && <CopyButton text={child.hex} />}
        </div>
        <div className="ml-4 border-l-2 border-muted pl-3 mt-1 space-y-1">
          {node.children.map((grandchild, j) => {
            const grandchildLabel = `${label}${grandchild.label}`;
            const grandchildPath = [...path, ...buildPath(grandchild.label, node.compoundType)];
            return (
              <SubHexNode
                key={j}
                label={grandchildLabel}
                child={grandchild}
                path={grandchildPath}
                editing={editing}
                onSubHexChange={onSubHexChange}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Leaf sub-node
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">
        {label} Hex
      </Label>
      <div className="flex items-center">
        <Input
          value={child.hex || "0x"}
          onChange={(e) => onSubHexChange?.(path, e.target.value, child.typeId)}
          disabled={!editing}
          className="font-mono text-blue-400 text-sm h-8"
        />
        {child.hex && child.hex !== "0x" && <CopyButton text={child.hex} />}
      </div>
    </div>
  );
};

/**
 * Convert a child label into a path segment for patchValueAtPath.
 * "[0]" → [0], "fieldName" → ["fieldName"], "VariantName" (Enum) → ["value"]
 */
function buildPath(label: string, compoundType: string): (string | number)[] {
  // Array index: [0], [1], etc.
  const indexMatch = label.match(/^\[(\d+)\]$/);
  if (indexMatch) return [parseInt(indexMatch[1], 10)];

  // Enum variant: the path into enum form value is through "value"
  if (compoundType === "Enum") return ["value"];

  // Struct field or other named path
  return [label];
}
