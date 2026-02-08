import type { DedotClient } from "dedot";
import type { ParamComponentType } from "@/components/params/types";
import { Account } from "@/components/params/inputs/account";
import { Amount } from "@/components/params/inputs/amount";
import { Balance } from "@/components/params/inputs/balance";
import { Boolean } from "@/components/params/inputs/boolean";
import { BTreeMap } from "@/components/params/inputs/btree-map";
import { BTreeSet } from "@/components/params/inputs/btree-set";
import { Bytes } from "@/components/params/inputs/bytes";
import { Call } from "@/components/params/inputs/call";
import { Enum } from "@/components/params/inputs/enum";
import { Hash160, Hash256, Hash512 } from "@/components/params/inputs/hash";
import { KeyValue } from "@/components/params/inputs/key-value";
import { Moment } from "@/components/params/inputs/moment";
import { Option } from "@/components/params/inputs/option";
import { Struct } from "@/components/params/inputs/struct";
import { Text } from "@/components/params/inputs/text";
import { Tuple } from "@/components/params/inputs/tuple";
import { Vector } from "@/components/params/inputs/vector";
import { VectorFixed } from "@/components/params/inputs/vector-fixed";
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
    patterns: [
      "Balance",
      "BalanceOf",
      "T::Balance",
      "Compact<Balance>",
      "Compact<BalanceOf>",
      /^Balance/,
      /::Balance$/,
    ],
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
    component: Hash160,
    schema: Hash160.schema,
    patterns: ["H160", /^H160$/],
    priority: 82,
  },
  {
    component: Hash256,
    schema: Hash256.schema,
    patterns: ["H256", "Hash", /H256/, /Hash/],
    priority: 80,
  },
  {
    component: Hash512,
    schema: Hash512.schema,
    patterns: ["H512", /^H512$/],
    priority: 78,
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
    patterns: ["AccountVote", /^AccountVote/],
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
    component: VectorFixed,
    schema: VectorFixed.schema,
    patterns: [/^\[.+;\s*\d+\]$/],
    priority: 43,
  },
  {
    component: BTreeMap,
    schema: BTreeMap.schema,
    patterns: [/^BTreeMap</],
    priority: 42,
  },
  {
    component: BTreeSet,
    schema: BTreeSet.schema,
    patterns: [/^BTreeSet</],
    priority: 41,
  },
  {
    component: Vector,
    schema: Vector.schema,
    patterns: [/^Vec</, /^BoundedVec</],
    priority: 40,
  },
  {
    component: Tuple,
    schema: Tuple.schema,
    patterns: [/^\(/, /^Tuple/],
    priority: 38,
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

export function findComponent(typeName: string, typeId?: number, client?: DedotClient<any>): ParamComponentType & { typeId?: number } {
  for (const entry of sortedRegistry) {
    for (const pattern of entry.patterns) {
      if (typeof pattern === "string") {
        if (typeName === pattern) {
          return { component: entry.component, schema: entry.schema, typeId };
        }
      } else {
        if (pattern.test(typeName)) {
          return { component: entry.component, schema: entry.schema, typeId };
        }
      }
    }
  }

  // Path-based fallback: try the type's path name from metadata for pattern matching
  if (client && typeId !== undefined) {
    try {
      const portableType = client.registry.findType(typeId);
      // Extract typeName from path (e.g. ["sp_runtime", "multiaddress", "MultiAddress"] → "MultiAddress")
      const path = (portableType as any)?.path as string[] | undefined;
      const pathName = path && path.length > 0 ? path[path.length - 1] : "";

      // Try pattern matching with the path-derived name
      if (pathName && pathName !== typeName) {
        for (const entry of sortedRegistry) {
          for (const pattern of entry.patterns) {
            if (typeof pattern === "string") {
              if (pathName === pattern) {
                return { component: entry.component, schema: entry.schema, typeId };
              }
            } else {
              if (pattern.test(pathName)) {
                return { component: entry.component, schema: entry.schema, typeId };
              }
            }
          }
        }
      }

      // TypeDef-based fallback: use metadata to determine if this is an Enum or Struct
      const typeDef = portableType?.typeDef;
      if (typeDef) {
        if (typeDef.type === "Enum") {
          return { component: Enum, schema: Enum.schema, typeId };
        }
        if (typeDef.type === "Struct") {
          // Struct has additional required props (fields) that are injected at render time
          return { component: Struct as any, schema: Struct.schema, typeId };
        }
      }
    } catch {
      // Type lookup failed, fall through to Text
    }
  }

  // Fallback to Text for unknown types
  return { component: Text, schema: Text.schema, typeId };
}

export { findComponentWithContext } from "./pallet-overrides";
