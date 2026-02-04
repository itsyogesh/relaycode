# CLAUDE.md - Relaycode

## Project Overview

Relaycode is a modern extrinsic builder for the Polkadot ecosystem, funded by a Web3 Foundation (W3F) grant. It provides a dual-pane interface for building, encoding/decoding, and submitting Substrate extrinsics with human-readable inputs on one side and encoded data on the other.

## Tech Stack

- **Framework**: Next.js 14 (App Router, SSR)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Polkadot Client**: [Dedot](https://github.com/dedotdev/dedot) (NOT @polkadot/api, which is deprecated)
- **Wallet**: LunoKit (planned M2 — NOT custom wallet provider)
- **State Management**: React Context API + hooks
- **Testing**: Jest + React Testing Library
- **Package Manager**: Yarn 1.x

## Directory Structure

```
app/                    # Next.js App Router pages
  (marketing)/          # Landing/marketing pages
  builder/              # Extrinsic builder tool
components/
  builder/              # Extrinsic builder components
  params/               # Parameter type components
    inputs/             # Substrate type input components (account, balance, enum, etc.)
  ui/                   # shadcn/ui base components
config/                 # App configuration
context/                # React context providers
hooks/                  # Custom React hooks
lib/                    # Utility libraries
types/                  # TypeScript type definitions
utils/                  # Helper utilities
styles/                 # Global styles
__tests__/              # Jest test files
docs/                   # Documentation (public)
```

## Commands

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn start        # Start production server
yarn lint         # Run ESLint
yarn test         # Run Jest tests
yarn test:watch   # Run tests in watch mode
```

## Architecture Notes

**Three-layer architecture** (planned M2):
1. **Infrastructure** — providers, clients, wallet connection (LunoKit)
2. **Components** — reusable UI (params/inputs, builder panes)
3. **App** — pages, routing, layouts

**Key patterns:**
- Path aliases via `@/*` mapping to project root
- shadcn/ui components in `components/ui/` — don't modify directly
- Input components in `components/params/inputs/` map to Substrate types
- Dedot client provides type-safe chain interactions via `DedotClient<PolkadotApi>`

## Code Conventions

- TypeScript strict mode enabled
- Kebab-case for filenames (e.g., `key-value.tsx`, `vote-threshold.tsx`)
- Barrel exports from directories via `index.ts`
- React components use named exports
- `"use client"` directive for client components

## Important Gotchas

1. **Dedot, not polkadot-js** — This project uses Dedot as the Polkadot client. Do not import from `@polkadot/api`.
2. **LunoKit for wallet** — M2 will use LunoKit for wallet connection. Do not build custom wallet/keyring providers.
3. **shadcn/ui components** — Generated into `components/ui/`. Add new ones via `npx shadcn-ui add <component>`.
4. **Next.js 14** — Uses App Router (not Pages Router). Layouts in `layout.tsx`, pages in `page.tsx`.
5. **No `lib/polkadot/`** — Legacy directory removed. Dedot is the only Polkadot integration.

## M2 Implementation Reference

See local `docs/m2-plan/` directory for detailed implementation plans (gitignored, not in repo).
