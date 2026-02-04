import { TypeDef, TypeRegistry } from "dedot/codecs";
import { Amount } from "@/components/params/inputs/amount";
import { Boolean } from "@/components/params/inputs/boolean";

import type {
  ParamComponents,
  ParamComponentType,
} from "@/components/params/types";
import { Text } from "@/components/params/inputs/text";

export const paramComponents: ParamComponents = {
  bool: {
    component: Boolean,
    schema: Boolean.schema,
  },
  number: {
    component: Amount,
    schema: Amount.schema,
  },
  text: {
    component: Text,
    schema: Text.schema,
  },
};

export function findComponent(type: string): ParamComponentType {
  // First check exact type matches
  if (paramComponents[type]) {
    return paramComponents[type];
  }

  // Then check type categories
  switch (type) {
    case "bool":
      return paramComponents.bool;
    case "compact":
    case "T::Balance":
    case "T::Amount":
      return paramComponents.number;
    default:
      // Default to text input for unknown types
      return paramComponents.text;
  }
}
