"use client";

import React from "react";
import { VectorFixed } from "@/components/params/inputs/vector-fixed";
import { BTreeMap } from "@/components/params/inputs/btree-map";
import { Struct } from "@/components/params/inputs/struct";
import { Text } from "@/components/params/inputs/text";
import { Boolean } from "@/components/params/inputs/boolean";
import { Vote } from "@/components/params/inputs/vote";
import { Amount } from "@/components/params/inputs/amount";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export function VectorFixedDemo() {
  return (
    <div className="w-full max-w-md">
      <VectorFixed
        name="hash"
        label="Hash"
        typeName="[u8; 32]"
        client={null as any}
        typeId={0}
        onChange={() => {}}
      />
    </div>
  );
}

export function BTreeMapDemo() {
  return (
    <div className="w-full max-w-md">
      <BTreeMap
        name="deposits"
        label="Deposits"
        client={null as any}
        typeId={0}
        onChange={() => {}}
      />
    </div>
  );
}

export function StructDemo() {
  return (
    <div className="w-full max-w-md">
      <Struct
        name="identity"
        label="Identity Info"
        client={null as any}
        onChange={() => {}}
        fields={[
          {
            name: "display",
            label: "Display Name",
            typeName: "Text",
            component: (
              <Text
                name="display"
                label="Display Name"
                client={null as any}
                onChange={() => {}}
              />
            ),
            required: true,
          },
          {
            name: "email",
            label: "Email",
            typeName: "Text",
            component: (
              <Text
                name="email"
                label="Email"
                client={null as any}
                onChange={() => {}}
              />
            ),
          },
          {
            name: "verified",
            label: "Verified",
            typeName: "bool",
            component: (
              <Boolean
                name="verified"
                label="Verified"
                client={null as any}
                onChange={() => {}}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export function TupleDemo() {
  const [values, setValues] = React.useState<[string, string]>(["", ""]);

  return (
    <div className="w-full max-w-md">
      <Label>Block Range</Label>
      <Card className="mt-2">
        <CardContent className="pt-6 flex flex-col gap-4">
          <Text
            name="tuple-0"
            label="Text [0]"
            client={null as any}
            onChange={(v) => setValues((prev) => [v as string, prev[1]])}
          />
          <Amount
            name="tuple-1"
            label="u128 [1]"
            typeName="u128"
            client={null as any}
            onChange={(v) => setValues((prev) => [prev[0], v as string])}
          />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-2">
        Simulated tuple layout. The actual Tuple component resolves field types from chain metadata.
      </p>
    </div>
  );
}

export function VoteDemo() {
  return (
    <div className="w-full max-w-md">
      <Vote
        name="vote"
        label="Vote"
        client={null as any}
        onChange={() => {}}
      />
    </div>
  );
}

export function CallDemo() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-2">
        <Label>Nested Call</Label>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Pallet</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="utility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utility">utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Method</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">batch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              The Call input requires a chain connection to populate pallets and methods.{" "}
              <Link href="/builder" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Visit the Builder
              </Link>{" "}
              to try it live.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
