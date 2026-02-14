"use client";

import React from "react";
import { Enum } from "@/components/params/inputs/enum";

const DEMO_VARIANTS = [
  {
    name: "SuperMajorityApprove",
    docs: ["A supermajority of aye votes is required to pass this motion."],
  },
  {
    name: "SuperMajorityAgainst",
    docs: ["A supermajority of nay votes is required to reject this motion."],
  },
  {
    name: "SimpleMajority",
    docs: ["A simple majority of votes is required."],
  },
];

export function EnumDemo() {
  return (
    <div className="w-full max-w-md">
      <Enum
        name="threshold"
        label="Vote Threshold"
        client={null as any}
        variants={DEMO_VARIANTS}
        onChange={() => {}}
      />
    </div>
  );
}
