# Contextual Pallet Data — Implementation Plan

## Overview

Make the extrinsic builder contextually intelligent. When a user selects a pallet, eagerly fetch relevant on-chain data and replace raw typed inputs with smart inline selectors showing real enriched data — referendum titles from Polkassembly, validator identities from Wisesama, pool details from Subscan.

**Branch:** `feature/contextual-pallet-data` from `master`

---

## Data Source Strategy (Layered)

| Layer | Source | Purpose |
|-------|--------|---------|
| Primary | Polkassembly API | Governance data — referenda titles, descriptions, tally |
| Primary | Subscan API | Staking data — validators, pools, identity |
| Primary | Wisesama API | Identity resolution — display names, verification, risk |
| Fallback | Dedot RPC | Universal fallback for all data if APIs unavailable |

**UI Pattern:** Inline searchable selectors (rich combobox items with multiple data fields)
**Fetch Strategy:** Eager on pallet select
**Scope:** Contextual selectors only. Multi-step templates documented separately.

---

## Architecture

### Core Concept: Pallet Override Map

**Problem:** A `u32` in `convictionVoting.vote()` is a referendum index, but a `u32` in `system.remark` is just a number. The type-based registry can't distinguish them.

**Solution:** A `pallet → method → fieldName → component` override map runs BEFORE the generic `findComponent()` registry.

```
User selects pallet → usePalletContext() eagerly fetches from APIs + RPC
User selects method → findComponentWithContext() checks overrides first
  → Override found? → Render smart selector with enriched context data
  → No override?   → Fall through to findComponent() (unchanged)
```

### Context Groups + Data Sources

| Group | Pallets | Primary Source | Fallback | Data |
|-------|---------|---------------|----------|------|
| governance | ConvictionVoting, Referenda, Bounties, Treasury | Polkassembly API | Dedot RPC | Referenda (title, status, track, tally), tracks, bounties |
| staking | Staking, NominationPools | Subscan API | Dedot RPC | Validators, pools, eras, bonding info |
| identity | (cross-cutting, used by selectors) | Wisesama API | — | Display names, verification status, risk level |

### API Key Management

| Service | Env Var | Header | Required? |
|---------|---------|--------|-----------|
| Polkassembly | `POLKASSEMBLY_API_KEY` | `x-api-key` | Optional |
| Subscan | `SUBSCAN_API_KEY` | `X-API-Key` | Recommended (free: 5 req/s, 100K/day) |
| Wisesama | `WISESAMA_API_KEY` | `Authorization: Bearer` or `x-api-key` | Yes |

All API calls go through Next.js API route proxies to keep keys server-side.

---

## File Structure

### New Files (~24)

#### Layer 1: API Clients
| File | Purpose |
|------|---------|
| `lib/api/polkassembly.ts` | Polkassembly API client (referenda, bounties) |
| `lib/api/subscan.ts` | Subscan API client (validators, pools, tracks) |
| `lib/api/wisesama.ts` | Wisesama API client (identity resolution) |

#### Layer 2: Next.js API Proxy Routes
| File | Purpose |
|------|---------|
| `app/api/polkassembly/[...path]/route.ts` | Polkassembly proxy |
| `app/api/subscan/[...path]/route.ts` | Subscan proxy |
| `app/api/wisesama/[...path]/route.ts` | Wisesama proxy |

#### Layer 3: Context Types + Fetchers
| File | Purpose |
|------|---------|
| `types/pallet-context.ts` | All context data interfaces |
| `lib/pallet-context/governance.ts` | Governance fetcher (Polkassembly → RPC fallback) |
| `lib/pallet-context/staking.ts` | Staking fetcher (Subscan → RPC fallback) |
| `lib/pallet-context/index.ts` | Context dispatcher |
| `lib/pallet-context/utils.ts` | Shared helpers |

#### Layer 4: Hook + Override Resolution
| File | Purpose |
|------|---------|
| `hooks/use-pallet-context.ts` | Main context hook with eager fetch + cache |
| `lib/pallet-overrides.ts` | Override map + `findComponentWithContext()` |

#### Layer 5: Smart Selectors
| File | Purpose |
|------|---------|
| `components/params/selectors/referendum-selector.tsx` | Referendum picker with titles, status, track, tally |
| `components/params/selectors/track-selector.tsx` | Governance track picker |
| `components/params/selectors/bounty-selector.tsx` | Bounty picker with descriptions, values |
| `components/params/selectors/validator-selector.tsx` | Single validator picker with identity, commission |
| `components/params/selectors/validator-multi-selector.tsx` | Multi-validator picker (max 16, chips) |
| `components/params/selectors/pool-selector.tsx` | Nomination pool picker |
| `components/params/selectors/era-selector.tsx` | Era info + numeric input |
| `components/params/selectors/context-hint.tsx` | Reusable info hint component |
| `components/params/selectors/selector-fallback.tsx` | Fallback for unavailable context |
| `components/params/selectors/index.ts` | Barrel exports |

#### Documentation
| File | Purpose |
|------|---------|
| `docs/contextual-data-reference.md` | API reference, template catalog, roadmap |

### Modified Files (3)
| File | Change |
|------|--------|
| `components/params/types.ts` | Add `palletContext?`, `contextItems?`, `isContextLoading?` to `ParamInputProps` |
| `lib/input-map.ts` | Re-export `findComponentWithContext` |
| `components/builder/extrinsic-builder.tsx` | Wire up `usePalletContext()` hook + override resolution |

---

## Override Mappings

| Pallet | Method | Field | Selector Component |
|--------|--------|-------|-------------------|
| ConvictionVoting | vote | poll_index | ReferendumSelector |
| ConvictionVoting | delegate | class | TrackSelector |
| ConvictionVoting | undelegate | class | TrackSelector |
| ConvictionVoting | removeVote | class | TrackSelector |
| ConvictionVoting | removeVote | index | ReferendumSelector |
| Referenda | cancel | index | ReferendumSelector |
| Referenda | kill | index | ReferendumSelector |
| Referenda | placeDecisionDeposit | index | ReferendumSelector |
| Referenda | refundDecisionDeposit | index | ReferendumSelector |
| Staking | nominate | targets | ValidatorMultiSelector |
| NominationPools | join | pool_id | PoolSelector |
| NominationPools | bondExtra | pool_id | PoolSelector |
| NominationPools | unbond | pool_id | PoolSelector |
| NominationPools | nominate | pool_id | PoolSelector |
| NominationPools | nominate | validators | ValidatorMultiSelector |
| Bounties | approveBounty | bounty_id | BountySelector |
| Bounties | proposeCurator | bounty_id | BountySelector |
| Bounties | closeBounty | bounty_id | BountySelector |
| Bounties | awardBounty | bounty_id | BountySelector |
| Bounties | claimBounty | bounty_id | BountySelector |

---

## Implementation Order

1. **API clients + proxy routes** — `lib/api/*`, `app/api/*`
2. **Types + context fetchers** — `types/pallet-context.ts`, `lib/pallet-context/*`
3. **Hook + override map** — `hooks/use-pallet-context.ts`, `lib/pallet-overrides.ts`
4. **Shared selector infrastructure** — `context-hint.tsx`, `selector-fallback.tsx`, `index.ts`
5. **Governance selectors** — `referendum-selector.tsx`, `track-selector.tsx`, `bounty-selector.tsx`
6. **Staking selectors** — `validator-selector.tsx`, `validator-multi-selector.tsx`, `pool-selector.tsx`, `era-selector.tsx`
7. **Integration wiring** — modify `types.ts`, `input-map.ts`, `extrinsic-builder.tsx`
8. **Documentation** — `docs/contextual-data-reference.md`
9. **Build verification** — `yarn build` + `yarn test`

---

## Verification Checklist

- [ ] `yarn build` succeeds
- [ ] `yarn test` passes (existing tests)
- [ ] ConvictionVoting.vote → Referendum selector shows referenda with Polkassembly titles
- [ ] ConvictionVoting.delegate → Track selector shows governance tracks
- [ ] Staking.nominate → Validator multi-selector shows validators with identities
- [ ] NominationPools.join → Pool selector shows open pools with names/members
- [ ] Bounties.approveBounty → Bounty selector shows bounties with descriptions/values
- [ ] Non-overridden pallets (e.g., Balances.transfer) unchanged
- [ ] API down → Falls back to RPC data gracefully
- [ ] Chain switch → Cache clears, context refetches for new chain
- [ ] Loading states → Skeleton/spinner while fetching
- [ ] Empty states → Manual input fallback when no data
