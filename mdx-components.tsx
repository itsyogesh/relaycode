import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ComponentPreview } from "@/components/docs/component-preview";
import { AccountDemo, BalanceDemo, EnumDemo } from "@/components/docs/demos";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    AccountDemo,
    BalanceDemo,
    EnumDemo,
    Tab,
    Tabs,
    ...components,
  };
}
