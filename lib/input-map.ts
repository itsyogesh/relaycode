import type { ParamComponentType } from "@/components/params/types";
import { Account } from "@/components/params/inputs/account";
import { Amount } from "@/components/params/inputs/amount";
import { Balance } from "@/components/params/inputs/balance";
import { Boolean } from "@/components/params/inputs/boolean";
import { Bytes } from "@/components/params/inputs/bytes";
import { Call } from "@/components/params/inputs/call";
import { Enum } from "@/components/params/inputs/enum";
import { Hash256 } from "@/components/params/inputs/hash";
import { KeyValue } from "@/components/params/inputs/key-value";
import { Moment } from "@/components/params/inputs/moment";
import { Option } from "@/components/params/inputs/option";
import { Struct } from "@/components/params/inputs/struct";
import { Text } from "@/components/params/inputs/text";
import { Vector } from "@/components/params/inputs/vector";
import { Vote } from "@/components/params/inputs/vote";
import { VoteThreshold } from "@/components/params/inputs/vote-threshold";

interface ComponentRegistration {
  component: React.ComponentType<any>;
  schema: any;
  patterns: (string | RegExp)[];
  priority: number;
}

const registry: ComponentRegistration[] = [
  {
    component: Account,
    schema: Account.schema,
    patterns: [
      "AccountId",
      "AccountId32",
      "AccountId20",
      "MultiAddress",
      "Address",
      "LookupSource",
      /^AccountId/,
      /^MultiAddress/,
    ],
    priority: 100,
  },
  {
    component: Balance,
    schema: Balance.schema,
    patterns: ["Balance", "BalanceOf", /^Balance/],
    priority: 95,
  },
  {
    component: Amount,
    schema: Amount.schema,
    patterns: [
      "Compact<u128>",
      "Compact<u64>",
      "Compact<u32>",
      "u128",
      "u64",
      "u32",
      "u16",
      "u8",
      "i128",
      "i64",
      "i32",
      "i16",
      "i8",
      /Compact</,
    ],
    priority: 90,
  },
  {
    component: Boolean,
    schema: Boolean.schema,
    patterns: ["bool"],
    priority: 85,
  },
  {
    component: Hash256,
    schema: Hash256.schema,
    patterns: ["H256", "Hash", /H256/, /Hash/],
    priority: 80,
  },
  {
    component: Bytes,
    schema: Bytes.schema,
    patterns: ["Bytes", "Vec<u8>", /Bytes/],
    priority: 75,
  },
  {
    component: Call,
    schema: Call.schema,
    patterns: ["Call", "RuntimeCall", /Call$/, /RuntimeCall>/],
    priority: 70,
  },
  {
    component: Moment,
    schema: Moment.schema,
    patterns: ["Moment", /Moment/],
    priority: 65,
  },
  {
    component: Vote,
    schema: Vote.schema,
    patterns: ["Vote", /^Vote$/],
    priority: 60,
  },
  {
    component: VoteThreshold,
    schema: VoteThreshold.schema,
    patterns: ["VoteThreshold", /VoteThreshold/],
    priority: 55,
  },
  {
    component: KeyValue,
    schema: KeyValue.schema,
    patterns: ["KeyValue", /KeyValue/],
    priority: 50,
  },
  {
    component: Option,
    schema: Option.schema,
    patterns: [/^Option</],
    priority: 45,
  },
  {
    component: Vector,
    schema: Vector.schema,
    patterns: [/^Vec</, /^BoundedVec</],
    priority: 40,
  },
  {
    component: Struct,
    schema: Struct.schema,
    patterns: [],
    priority: 35,
  },
  {
    component: Enum,
    schema: Enum.schema,
    patterns: [],
    priority: 30,
  },
];

// Sort by priority descending
const sortedRegistry = [...registry].sort((a, b) => b.priority - a.priority);

export function findComponent(typeName: string): ParamComponentType {
  for (const entry of sortedRegistry) {
    for (const pattern of entry.patterns) {
      if (typeof pattern === "string") {
        if (typeName === pattern) {
          return { component: entry.component, schema: entry.schema };
        }
      } else {
        if (pattern.test(typeName)) {
          return { component: entry.component, schema: entry.schema };
        }
      }
    }
  }

  // Fallback to Text for unknown types
  return { component: Text, schema: Text.schema };
}
