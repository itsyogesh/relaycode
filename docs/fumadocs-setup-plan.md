# Fumadocs Setup Plan

## Overview
Setting up Fumadocs as the documentation framework for Relaycode, replacing placeholder "Coming Soon" pages with real documentation.

## Phases

### Phase 1: Installation & Configuration
- Install fumadocs-core, fumadocs-ui, fumadocs-mdx, @types/mdx
- Create source.config.ts for content collection
- Wrap next.config.mjs with createMDX()
- Create lib/source.ts for source loader
- Create mdx-components.tsx for component overrides
- Add Fumadocs CSS to globals.css
- Add .source/ path alias to tsconfig.json
- Add RootProvider to app/layout.tsx

### Phase 2: Route Structure
- Create app/docs/layout.tsx with DocsLayout
- Create app/docs/[[...slug]]/page.tsx for dynamic rendering
- Create app/api/search/route.ts for search API
- Redirect /components to /docs/components

### Phase 3: Content Migration
- Create content/docs/ directory structure
- Migrate getting-started.md to MDX
- Migrate API docs (input-map, codec, validation) to MDX
- Create architecture overview

### Phase 4: Component Documentation
- Create component preview infrastructure
- Document Account, Balance, and Enum components
- Create components overview page

## Verification
1. yarn dev — docs loads at /docs
2. Navigation works with sidebar
3. Component docs render at /docs/components/*
4. Search works
5. yarn build succeeds
6. yarn test passes
