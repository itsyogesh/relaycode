import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { ComponentPreview } from "@/components/docs/component-preview";
import {
  AccountDemo,
  BalanceDemo,
  EnumDemo,
  BoolDemo,
  TextDemo,
  HashDemo,
  BytesDemo,
  AmountDemo,
  OptionDemo,
  VectorDemo,
  ValidatorSelectorDemo,
  ValidatorMultiSelectorDemo,
  PoolSelectorDemo,
  EraSelectorDemo,
  ReferendumSelectorDemo,
  TrackSelectorDemo,
  BountySelectorDemo,
} from "@/components/docs/demos";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            ComponentPreview,
            AccountDemo,
            BalanceDemo,
            EnumDemo,
            BoolDemo,
            TextDemo,
            HashDemo,
            BytesDemo,
            AmountDemo,
            OptionDemo,
            VectorDemo,
            ValidatorSelectorDemo,
            ValidatorMultiSelectorDemo,
            PoolSelectorDemo,
            EraSelectorDemo,
            ReferendumSelectorDemo,
            TrackSelectorDemo,
            BountySelectorDemo,
            Tab,
            Tabs,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
