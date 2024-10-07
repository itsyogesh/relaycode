import { PolkadotApi } from "@dedot/chaintypes";
import { DedotClient } from "dedot";
import { Metadata } from "dedot/codecs";
import { assert, stringCamelCase } from "dedot/utils";

export function createSectionOptions(
  metadata: Metadata["latest"] | null
): { text: string; value: number }[] | null {
  if (!metadata) return null;
  return metadata?.pallets
    .filter((pallet) => !!pallet.calls)
    .map((pallet) => ({
      value: pallet.index,
      text: pallet.name,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));
}

export type ClientMethod = {
  sectionName: string;
  sectionIndex: number;
  methodName: string;
  methodIndex: number;
  args: { name: string; type: number; value?: string }[] | null;
};

export function createMethodOptions(
  client: DedotClient<PolkadotApi>,
  metadata: Metadata["latest"] | null,
  sectionIndex: number
): ClientMethod[] | null {
  const pallet = metadata?.pallets.find(
    (pallet) => pallet.index === sectionIndex
  );

  console.log("pallet data", pallet, sectionIndex);

  if (!pallet?.calls) return null;

  const palletCalls = client.registry.findType(pallet?.calls);
  assert(palletCalls.typeDef.type === "Enum");

  console.log("palletCalls", palletCalls);

  return palletCalls.typeDef.value.members.map((call) => {
    return {
      sectionName: pallet.name,
      sectionIndex: pallet.index,
      methodName: call.name,
      methodIndex: call.index,
      args: call.fields.map((arg) => ({
        name: arg.name || "",
        type: arg.typeId,
      })),
    };
  });
}
