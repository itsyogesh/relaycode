import { z } from "zod";
import type { DedotClient } from "dedot";
import { PolkadotApi } from "@dedot/chaintypes";
import type { PalletContextData } from "@/types/pallet-context";

export interface ParamInputProps {
  name: string;
  label?: string;
  description?: string;
  typeName?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  error?: string;
  client: DedotClient<PolkadotApi>;
  typeId?: number;
  value?: any;
  onChange?: (value: unknown) => void;
  palletContext?: PalletContextData | null;
  isContextLoading?: boolean;
}

export interface ParamComponentType {
  component: React.ComponentType<ParamInputProps>;
  schema: z.ZodType;
}

export type ParamComponents = Record<string, ParamComponentType>;
