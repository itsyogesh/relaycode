"use client";

import React from "react";
import { Option } from "@/components/params/inputs/option";
import { Vector } from "@/components/params/inputs/vector";
import { Text } from "@/components/params/inputs/text";

export function OptionDemo() {
  return (
    <div className="w-full max-w-md">
      <Option
        name="tip"
        label="Tip"
        client={null as any}
        onChange={() => {}}
      >
        <Text
          name="tip-value"
          label="Tip value"
          client={null as any}
          onChange={() => {}}
        />
      </Option>
    </div>
  );
}

export function VectorDemo() {
  return (
    <div className="w-full max-w-md">
      <Vector
        name="remarks"
        label="Remarks"
        client={null as any}
        onChange={() => {}}
      >
        <Text
          name="item"
          label="Item"
          client={null as any}
          onChange={() => {}}
        />
      </Vector>
    </div>
  );
}
