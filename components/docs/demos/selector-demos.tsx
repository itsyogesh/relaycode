"use client";

import React from "react";
import { DocsSelectorPreview } from "./docs-selector-preview";
import { ValidatorSelector } from "@/components/params/selectors/validator-selector";
import { ValidatorMultiSelector } from "@/components/params/selectors/validator-multi-selector";
import { PoolSelector } from "@/components/params/selectors/pool-selector";
import { EraSelector } from "@/components/params/selectors/era-selector";
import { ReferendumSelector } from "@/components/params/selectors/referendum-selector";
import { TrackSelector } from "@/components/params/selectors/track-selector";
import { BountySelector } from "@/components/params/selectors/bounty-selector";

export function ValidatorSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Staking">
      <ValidatorSelector
        name="target"
        label="Validator"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function ValidatorMultiSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Staking">
      <ValidatorMultiSelector
        name="targets"
        label="Validators"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function PoolSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="NominationPools">
      <PoolSelector
        name="poolId"
        label="Pool"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function EraSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Staking">
      <EraSelector
        name="era"
        label="Era"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function ReferendumSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Referenda">
      <ReferendumSelector
        name="pollIndex"
        label="Referendum"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function TrackSelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Referenda">
      <TrackSelector
        name="trackId"
        label="Track"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}

export function BountySelectorDemo() {
  return (
    <DocsSelectorPreview palletName="Bounties">
      <BountySelector
        name="bountyId"
        label="Bounty"
        client={null as any}
        onChange={() => {}}
      />
    </DocsSelectorPreview>
  );
}
