import React, { useState, useEffect } from "react";
import { $, DedotClient } from "dedot";
import {
  HexString,
  stringCamelCase,
  toHex,
  u8aToHex,
  hexStripPrefix,
  hexAddPrefix,
  xxhashAsU8a,
  xxhashAsHex,
} from "dedot/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GenericTxCall } from "dedot/types";
import { PolkadotApi } from "@dedot/chaintypes";
import { UseFormReturn } from "react-hook-form";
import { BuilderFormValues } from "@/app/builder/page";

interface InformationPaneProps {
  client: DedotClient<PolkadotApi>;
  tx: GenericTxCall | null;
  builderForm: UseFormReturn<BuilderFormValues>;
  onTxChange: (tx: GenericTxCall) => void;
}

interface Argument {
  name: string;
  type: number;
  value?: HexString;
}

const InformationPane: React.FC<InformationPaneProps> = ({
  client,
  tx,
  builderForm,
  onTxChange,
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
  const [hexEncodedCall, setHexEncodedCall] = useState<string>("");

  useEffect(() => {
    const section = builderForm.watch("section");
    if (section) {
      setSectionHex(u8aToHex($.u8.tryEncode(parseInt(section.split(":")[0]))));
    }
  }, [builderForm.watch("section")]);

  useEffect(() => {
    if (tx) {
      setFunctionHex(u8aToHex($.u8.tryEncode(tx.meta?.index)));

      const callData =
        hexStripPrefix(sectionHex || "") +
          hexStripPrefix(functionHex || "") +
          argsHex?.map((arg) => hexStripPrefix(arg.value)).join("") || "";
      setEncodedCallData(hexAddPrefix(callData));
      setEncodedCallHash(hexAddPrefix(xxhashAsHex(callData, 128)));
    }
  }, [tx]);

  const handleEncodedCallDataChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editing) return;

    const newCallData = e.target.value;
    try {
      const newTx = client.registry.$Extrinsic.decode(
        $.u8.tryEncode(newCallData)
      );
      console.log("newTx", newTx);
    } catch (error) {
      console.error("Error updating extrinsic from encoded call data:", error);
    }
  };

  const handleEncodedCallHashChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editing) return;

    const newCallHash = e.target.value;

    console.log("newcallhash", newCallHash);

    setEncodedCallHash(toHex(e.target.value));
    try {
      const newTx = client.registry.$Extrinsic.tryDecode(newCallHash);
      console.log("newTx", newTx);
    } catch (e) {
      console.error("Error updating extrinsic from encoded call hash", e);
    }
  };

  const handleHexEncodedCall = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editing) return;

    const hexEncodedCallHash = e.target.value;

    setHexEncodedCall(hexEncodedCallHash);
    try {
      const newTx = client.registry.$Extrinsic.tryDecode(hexEncodedCallHash);
      console.log("new tx for encoded call", newTx);
      const palletCall = newTx.call.palletCall;
      if (!palletCall) return;
      const callName = typeof palletCall === "string" ? palletCall : palletCall.name;
      const newTransaction =
        client.tx[stringCamelCase(newTx.call.pallet)][
          stringCamelCase(callName)
        ];

      onTxChange(newTransaction);
    } catch (e) {
      console.error("Error updating extrinsic from encoded call hash", e);
    }
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

        {tx?.meta?.fields?.map((arg, index) => (
          <div key={index}>
            <Label className="text-sm font-medium">
              {stringCamelCase(arg.name || "")} Hex
            </Label>
            <Input
              value={toHex("0x")}
              //onChange={handleHexChange("args", index)}
              disabled={!editing}
              className="font-mono text-blue-500"
            />
          </div>
        ))}

        <div>
          <Label className="text-sm font-medium">Encoded Call Data</Label>
          {editing ? (
            <Input
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
            disabled={!editing}
            className="font-mono"
            onChange={handleEncodedCallHashChange}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Hex Encoded Call Data</Label>
          <Textarea
            value={hexEncodedCall}
            disabled={!editing}
            className="font-mono"
            onChange={handleHexEncodedCall}
          />
        </div>
      </div>
    </div>
  );
};

export default InformationPane;
