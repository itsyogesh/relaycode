"use client";

import React, { useState } from "react";
import { Boolean } from "@/components/params/inputs/boolean";
import { Text } from "@/components/params/inputs/text";
import { Hash256 } from "@/components/params/inputs/hash";
import { Bytes } from "@/components/params/inputs/bytes";
import { Amount } from "@/components/params/inputs/amount";
import { Moment } from "@/components/params/inputs/moment";
import { VoteThreshold } from "@/components/params/inputs/vote-threshold";
import { KeyValue } from "@/components/params/inputs/key-value";

export function BoolDemo() {
  const [value, setValue] = useState(false);

  return (
    <div className="w-full max-w-md">
      <Boolean
        name="approve"
        label="Approve Proposal"
        value={value}
        client={null as any}
        onChange={(v) => setValue(v as boolean)}
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

export function MomentDemo() {
  return (
    <div className="w-full max-w-md">
      <Moment
        name="when"
        label="Schedule Time"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function VoteThresholdDemo() {
  return (
    <div className="w-full max-w-md">
      <VoteThreshold
        name="threshold"
        label="Vote Threshold"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function KeyValueDemo() {
  return (
    <div className="w-full max-w-md">
      <KeyValue
        name="entry"
        label="Storage Entry"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}
