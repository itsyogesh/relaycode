import { z } from "zod";
import type { DedotClient } from "dedot";
import { PolkadotApi } from "@dedot/chaintypes";

export interface ParamInputProps {
  name: string;
  label?: string;
  description?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  error?: string;
  client: DedotClient<PolkadotApi>;
  typeId?: number;
  onChange?: (value: unknown) => void;
  typeId?: number;
}

export interface ParamComponentType {
  component: React.ComponentType<ParamInputProps>;
  schema: z.ZodType;
}

export type ParamComponents = Record<string, ParamComponentType>;
