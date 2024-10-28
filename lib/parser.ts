import { PolkadotApi } from "@dedot/chaintypes";
import { DedotClient } from "dedot";
import { Metadata, TypeDef } from "dedot/codecs";
import { assert, stringCamelCase } from "dedot/utils";

export function createSectionOptions(
  metadata: Metadata["latest"] | null
): { text: string; value: number; docs: string[] }[] | null {
  if (!metadata) return null;
  return metadata?.pallets
    .filter((pallet) => !!pallet.calls)
    .map((pallet) => {
      return {
        value: pallet.index,
        text: pallet.name,
        docs: pallet.docs,
      };
    })
    .sort((a, b) => a.text.localeCompare(b.text));
}

export type ClientMethod = {
  sectionName: string;
  sectionIndex: number;
  methodName: string;
  methodIndex: number;
  args:
    | {
        name: string;
        type: number;
        value?: string;
        typeName?: string;
      }[]
    | null;
};

export function createMethodOptions(
  client: DedotClient<PolkadotApi>,
  sectionIndex: number
): { text: string; value: number }[] | null {
  const pallet = client.metadata.latest.pallets.find(
    (pallet) => pallet.index === sectionIndex
  );

  if (!pallet?.calls) return null;

  const palletCalls = client.registry.findType(pallet?.calls);
  assert(palletCalls.typeDef.type === "Enum");

  return palletCalls.typeDef.value.members.map((call) => {
    return {
      text: call.name,
      value: call.index,
    };
  });
}

/**
 * Sample type:
 * {"id":113,"path":["sp_runtime","multiaddress","MultiAddress"],"params":[{"name":"AccountId","typeId":0},{"name":"AccountIndex","typeId":35}],"typeDef":{"type":"Enum","value":{"members":[{"name":"Id","fields":[{"typeId":0,"typeName":"AccountId","docs":[]}],"index":0,"docs":[]},{"name":"Index","fields":[{"typeId":114,"typeName":"AccountIndex","docs":[]}],"index":1,"docs":[]},{"name":"Raw","fields":[{"typeId":14,"typeName":"Vec<u8>","docs":[]}],"index":2,"docs":[]},{"name":"Address32","fields":[{"typeId":1,"typeName":"[u8; 32]","docs":[]}],"index":3,"docs":[]},{"name":"Address20","fields":[{"typeId":62,"typeName":"[u8; 20]","docs":[]}],"index":4,"docs":[]}]}},"docs":[]}
 * If the type is an Enum, return enum details and recursive type details.
 * {
 *   "type": "Enum",
 *   "value": {
 *     "members": [{ "name": "Id", "fields": [{ "typeId": 0, "typeName": "AccountId", "docs": [] }], "index": 0, "docs": [] }]
 *   }
 * }
 *
 */
export function getArgType(client: DedotClient<PolkadotApi>, typeId: number) {
  const type = client.registry.findType(typeId);
  console.log("codec", client.registry.findCodec(typeId));
  if (type.typeDef.type === "Enum") {
    console.log("enum types", client.registry.getEnumOptions(typeId));
  }
  return getTypeDetails(type.typeDef);
}

function getTypeDetails(typeDef: TypeDef) {
  if (typeDef.type === "Enum") {
    return {
      type: typeDef.type,
      value: {
        members: typeDef.value.members.map((member) => ({
          name: member.name,
          fields: member.fields.map((field) => ({
            typeId: field.typeId,
            typeName: field.typeName,
            docs: field.docs,
          })),
          index: member.index,
          docs: member.docs,
        })),
      },
    };
  } else {
    return typeDef;
  }
}
