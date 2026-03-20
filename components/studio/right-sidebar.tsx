"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CompilerSection } from "./compiler-section";
import { DeploySection } from "./deploy-section";

export function RightSidebar() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Accordion
        type="multiple"
        defaultValue={["compile", "deploy"]}
        className="w-full"
      >
        <AccordionItem value="compile" className="border-b">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:no-underline">
            Compile
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <CompilerSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deploy" className="border-b-0">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:no-underline">
            Deploy
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <DeploySection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
