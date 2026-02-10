import { source } from "@/lib/source";
import { structure } from "fumadocs-core/mdx-plugins";
import { createFromSource } from "fumadocs-core/search/server";

// In fumadocs-core v15.x, the remarkStructure plugin does not implement
// the `exportAs` option, so `page.data.structuredData` is always undefined.
// This was fixed in fumadocs-core v16+. As a workaround, we read the raw
// MDX content and compute structuredData at index time using `structure()`.
export const { GET } = createFromSource(source, {
  async buildIndex(page) {
    let structuredData = page.data.structuredData;

    if (!structuredData) {
      const raw = await page.data.getText("raw");
      structuredData = structure(raw);
    }

    return {
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData,
    };
  },
});
