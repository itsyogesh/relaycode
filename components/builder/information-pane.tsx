import React, { useState, useEffect } from "react";
import { $, DedotClient } from "dedot";
import type { PolkadotApi } from "@dedot/chaintypes";
import { Metadata } from "dedot/codecs";
import {
  assert,
  HexString,
  stringCamelCase,
  stringPascalCase,
  stringToU8a,
  toHex,
  u8aToHex,
  u8aToString,
  xxhashAsU8a,
  stringToHex,
  hexStripPrefix,
  hexAddPrefix,
} from "dedot/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClientMethod } from "@/lib/parser";
import { set } from "zod";

interface InformationPaneProps {
  extrinsic: ClientMethod | null;
  client: DedotClient<PolkadotApi> | null;
  metadata: Metadata["latest"] | null;
  onExtrinsicChange: (extrinsic: ClientMethod) => void;
}

interface Argument {
  name: string;
  type: number;
  value?: HexString;
}

const InformationPane: React.FC<InformationPaneProps> = ({
  extrinsic,
  client,
  metadata,
  onExtrinsicChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [sectionHex, setSectionHex] = useState<HexString | null>(null);
  const [functionHex, setFunctionHex] = useState<HexString | null>(null);
  const [argsHex, setArgsHex] = useState<Argument[] | null>(null);
  const [encodedCallData, setEncodedCallData] = useState<HexString | null>(
    null
  );
  const [encodedCallHash, setEncodedCallHash] = useState<HexString | null>(
    null
  );

  useEffect(() => {
    if (extrinsic && client && metadata) {
      console.log("Updating display values...", extrinsic);
      updateDisplayValues(extrinsic);
    }
  }, [extrinsic, client, metadata]);

  const updateDisplayValues = (extrinsic: ClientMethod) => {
    if (extrinsic.sectionName) {
      setSectionHex(u8aToHex($.u8.tryEncode(extrinsic.sectionIndex)));
    }
    if (extrinsic.sectionName && extrinsic.methodName) {
      const tx =
        client?.tx[stringCamelCase(extrinsic.sectionName)][
          stringCamelCase(extrinsic.methodName)
        ];
      const { palletIndex, index, fieldCodecs } = tx?.meta!;

      console.log("metadata", tx?.meta);

      setSectionHex(u8aToHex($.u8.tryEncode(palletIndex)));
      setFunctionHex(u8aToHex($.u8.tryEncode(index)));

      if (extrinsic.args?.length && fieldCodecs) {
        const args = extrinsic?.args?.map((arg, index) => {
          const argHex = fieldCodecs[index]
            ? u8aToHex(fieldCodecs[index].tryEncode(arg.value || ""))
            : `0x`;
          return {
            name: arg.name,
            type: arg.type,
            value: argHex,
          };
        });
        if (args) setArgsHex(args);
      }

      const callData =
        hexStripPrefix(sectionHex || "") +
          hexStripPrefix(functionHex || "") +
          argsHex?.map((arg) => hexStripPrefix(arg.value)).join("") || "";

      setEncodedCallData(hexAddPrefix(callData));
      setEncodedCallHash(hexAddPrefix(callData));
    }
  };

  // const handleHexChange = (type: "section" | "function" | "args", index: number = 0) => (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!editing || !client || !metadata) return;

  //   let newValue = e.target.value;
  //   let newExtrinsic: ClientMethod = {
  //     sectionName: "",
  //     sectionIndex: -1,
  //     methodName: "",
  //     methodIndex: -1,
  //     args: null,
  //   };

  //   switch (type) {
  //     case "section":
  //       setSectionHex(u8aToHex($.RawHex.tryEncode(newValue)));
  //       const decodedSection = $.u8.tryDecode(newValue);
  //       newExtrinsic = {
  //         ...newExtrinsic,
  //         sectionName: metadata.pallets.find((p) => p.index === decodedSection)?.name || "",
  //         sectionIndex: decodedSection,
  //       };
  //       break;
  //     case "function":
  //       if (newExtrinsic.sectionIndex === -1) {
  //         setFunctionHex(u8aToHex($.RawHex.tryEncode(newValue)));
  //       } else {
  //         const pallet = metadata.pallets.find((p) => p.index === newExtrinsic.sectionIndex);
  //         if (!pallet?.calls) return;
  //         const palletCalls = client.registry.findType(pallet.calls);
  //         assert(palletCalls.typeDef.type === "Enum");
  //         const method = palletCalls.typeDef.value.members.find((m) => m.index === parseInt(newValue));
  //         if (!method) return;
  //         setFunctionHex(u8aToHex($.RawHex.tryEncode(newValue)));
  //         newExtrinsic = {
  //           ...newExtrinsic,
  //           methodName: method.name,
  //           methodIndex: method.index,
  //         };
  //       }
  //       break;
  //     case "args":
  //       if (newExtrinsic.sectionIndex === -1 || newExtrinsic.methodIndex === -1) return;
  //       const tx = client.tx[stringCamelCase(newExtrinsic.sectionName)][stringCamelCase(newExtrinsic.methodName)];
  //       const { fieldCodecs } = tx.meta!;
  //       const newArgs = [...argsHex || []];
  //       newArgs[index] = {
  //         ...newArgs[index],
  //         value: fieldCodecs[index].tryDecode(newValue),
  //       };

  // }

  // const handleHexChange =
  //   (type: "section" | "function" | "args", index: number = 0) =>
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!editing || !client || !metadata) return;

  //     let newValue = e.target.value;
  //     if (!newValue.startsWith("0x")) {
  //       newValue = toHex(newValue);
  //     }

  //     switch (type) {
  //       case "section":
  //         setSectionHex(u8aToHex($.RawHex.tryEncode(newValue)));
  //         break;
  //       case "function":
  //         setFunctionHex(u8aToHex($.RawHex.tryEncode(newValue)));
  //         break;
  //       case "args":
  //         if (!argsHex) return;
  //         const newArgs = [...argsHex];
  //         newArgs[index] = stringToU8a(newValue);
  //         setArgsHex(newArgs);
  //         break;
  //     }

  //     try {
  //       const pallet = metadata?.pallets.find(
  //         (p) => p.index === parseInt($.RawHex.decode(sectionHex))
  //       );
  //       if (!pallet?.calls) return null;
  //       const palletCalls = client.registry.findType(pallet?.calls);
  //       assert(palletCalls.typeDef.type === "Enum");

  //       const method = palletCalls.typeDef.value.members.find(
  //         (m) => m.index === extrinsic?.methodIndex
  //       );
  //       if (!method) return null;
  //       const args = method.fields.map((arg, index) => {
  //         return {
  //           name: arg.name || "",
  //           type: arg.typeId || 0,
  //           value: argsHex ? u8aToString(argsHex[index]) : "",
  //         };
  //       });
  //       const newExtrinsic: ClientMethod = {
  //         section: pallet.name || "",
  //         method: method.name || "",
  //         args: args,
  //       };
  //       onExtrinsicChange(newExtrinsic);
  //     } catch (error) {
  //       console.error("Error updating extrinsic:", error);
  //     }
  //   };

  // const handleEncodedCallDataChange = (
  //   e: React.ChangeEvent<HTMLTextAreaElement>
  // ) => {
  //   if (!editing || !client) return;

  //   const newCallData = e.target.value;
  //   setEncodedCallData(xxhashAsU8a(newCallData, 128));

  //   // try {
  //   //   const newExtrinsic = client.createFromCallHex(newCallData);
  //   //   onExtrinsicChange(newExtrinsic);
  //   // } catch (error) {
  //   //   console.error("Error updating extrinsic from encoded call data:", error);
  //   // }
  // };

  const handleEncodedCallDataChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!editing || !client) return;

    const newCallData = e.target.value;
    setEncodedCallData(u8aToHex($.RawHex.tryEncode(newCallData)));

    // try {
    //   const newExtrinsic = client.createFromCallHex(newCallData);
    //   onExtrinsicChange(newExtrinsic);
    // } catch (error) {
    //   console.error("Error updating extrinsic from encoded call data:", error);
    // }
  };

  const renderColorCodedCallData = () => {
    if (!encodedCallData) return null;

    const prefix = encodedCallData.slice(0, 2);
    const section = encodedCallData.slice(2, 4);
    const func = encodedCallData.slice(4, 6);
    const args = encodedCallData.slice(6);

    return (
      <div className="font-mono break-all">
        <span className="text-gray-500">{prefix}</span>
        <span className="text-red-500">{section}</span>
        <span className="text-green-500">{func}</span>
        <span className="text-blue-500">{args}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Information Pane</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="editing-mode"
            checked={editing}
            onCheckedChange={setEditing}
          />
          <Label htmlFor="editing-mode">Enable Editing</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Section Hex</Label>
          <Input
            value={sectionHex || ""}
            //onChange={handleHexChange("section")}
            disabled={!editing}
            className="font-mono text-red-500"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Function Hex</Label>
          <Input
            value={toHex(functionHex || "")}
            //onChange={handleHexChange("function")}
            disabled={!editing}
            className="font-mono text-green-500"
          />
        </div>

        {argsHex?.map((arg, index) => (
          <div key={index}>
            <Label className="text-sm font-medium">
              {stringCamelCase(arg.name)} Hex
            </Label>
            <Input
              value={toHex(arg.value || "")}
              //onChange={handleHexChange("args", index)}
              disabled={!editing}
              className="font-mono text-blue-500"
            />
          </div>
        ))}

        <div>
          <Label className="text-sm font-medium">Encoded Call Data</Label>
          {editing ? (
            <Textarea
              value={toHex(encodedCallData || "")}
              onChange={handleEncodedCallDataChange}
              className="font-mono"
            />
          ) : (
            renderColorCodedCallData()
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Encoded Call Hash</Label>
          <Input
            value={toHex(encodedCallHash || "")}
            disabled
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
};

//  const registerTx = client.tx.registrar.register;
//   const { palletIndex, index, fieldCodecs } = registerTx.meta!;
//   const [$id, $genesisHead, $validationCode] = fieldCodecs;

//   const idInput = 1000;
//   const genesisHeadInput = '0x1234';
//   const validationCodeInput = '0x4565';

//   // From inputs to hex
//   const palletHex = u8aToHex($.u8.tryEncode(palletIndex));
//   const methodHex = u8aToHex($.u8.tryEncode(index));

//   const idHex = u8aToHex($id.tryEncode(idInput));
//   const genesisHeadHex = u8aToHex($genesisHead.tryEncode(genesisHeadInput));
//   const validationCodeHex = u8aToHex($validationCode.tryEncode(validationCodeInput));

//   const tx = registerTx(idInput, genesisHeadInput, validationCodeInput);

//   console.log('=== Inputs -> Raw Hex');
//   console.log('palletHex', palletHex);
//   console.log('methodHex', methodHex);
//   console.log('idHex', idHex);
//   console.log('genesisHeadHex', genesisHeadHex);
//   console.log('validationCodeHex', validationCodeHex);

//   const calculatedHex = hexStripPrefix(palletHex) + hexStripPrefix(methodHex) + hexStripPrefix(idHex) + hexStripPrefix(genesisHeadHex) + hexStripPrefix(validationCodeHex)
//   console.log('calculatedHex', hexAddPrefix(calculatedHex));

//   const callHex = tx.callHex;
//   console.log('      callHex', callHex);

//   assert(hexAddPrefix(calculatedHex) === callHex, 'Call hex does not match calculated hex');

//   // Now you have the raw hex value, let's convert it to plain value
//   console.log('=== Raw Hex -> Plain Inputs');
//   const decodedPalletIndex = $.u8.tryDecode(palletHex);
//   const decodedMethodIndex = $.u8.tryDecode(methodHex);

//   // args
//   const decodedId = $id.tryDecode(idHex);
//   const decodedGenesisHead = $genesisHead.tryDecode(genesisHeadHex);
//   const decodedValidationCode = $validationCode.tryDecode(validationCodeHex);

//   console.log('decodedPalletIndex', decodedPalletIndex);
//   console.log('decodedMethodIndex', decodedMethodIndex);
//   console.log('decodedId', decodedId);
//   console.log('decodedGenesisHead', decodedGenesisHead);
//   console.log('decodedValidationCode', decodedValidationCode);

//   await client.disconnect();
// }

// run().catch(console.error);

export default InformationPane;
