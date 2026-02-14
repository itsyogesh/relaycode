"use client";

import React from "react";
import { Boolean } from "@/components/params/inputs/boolean";
import { Text } from "@/components/params/inputs/text";
import { Hash256 } from "@/components/params/inputs/hash";
import { Bytes } from "@/components/params/inputs/bytes";
import { Amount } from "@/components/params/inputs/amount";

export function BoolDemo() {
  return (
    <div className="w-full max-w-md">
      <Boolean
        name="approve"
        label="Approve Proposal"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function TextDemo() {
  return (
    <div className="w-full max-w-md">
      <Text
        name="remark"
        label="Remark"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function HashDemo() {
  return (
    <div className="w-full max-w-md">
      <Hash256
        name="codeHash"
        label="Code Hash"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function BytesDemo() {
  return (
    <div className="w-full max-w-md">
      <Bytes
        name="data"
        label="Data"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function AmountDemo() {
  return (
    <div className="w-full max-w-md">
      <Amount
        name="value"
        label="Value"
        typeName="u32"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}
