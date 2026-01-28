# Milestone 2 Implementation Plan - Overview

## Executive Summary

This document outlines the implementation plan for Relaycode Milestone 2 (M2) deliverables as specified in the W3F Grant application. The plan incorporates learnings from the Polkadot ecosystem research and positions Relaycode for long-term success.

**Timeline:** 1 month
**Budget:** 15,000 USD
**FTE:** 2

---

## M2 Deliverables Checklist

| # | Deliverable | Status | Priority |
|---|-------------|--------|----------|
| 0a | Apache 2.0 License | Done | - |
| 0b | Comprehensive Documentation | Not Started | High |
| 0c | Testing & Testing Guide | Partial | High |
| 0d | Updated Dockerfile | Done | - |
| 0e | Medium Article | Not Started | Medium |
| 1 | UI Refinement | Partial | High |
| 2 | Wallet Integration | Not Started | Critical |
| 3 | Error Handling & Validation | Partial | High |
| 4 | Performance Optimization | Not Started | Medium |
| 5 | Production Deployment | Partial | High |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up wallet integration and core input components

| Task | Deliverable | Est. Hours |
|------|-------------|------------|
| LunoKit integration setup | Wallet connect modal, account selection | 16h |
| Account/Address input component | MultiAddress support with validation | 12h |
| Balance input component | Unit conversion, formatting | 8h |
| Update context providers | Wallet state, chain state | 8h |

**Milestone Check:** Users can connect wallet and see their account in the UI

### Phase 2: Type Coverage (Week 2)
**Goal:** Implement critical input components for common extrinsic types

| Task | Deliverable | Est. Hours |
|------|-------------|------------|
| Enum input component | Variant selection with nested fields | 12h |
| Option wrapper component | Nullable type handling | 6h |
| Vec/Vector input component | Dynamic array inputs | 10h |
| Struct builder component | Composite type rendering | 10h |
| Tuple input component | Fixed heterogeneous collections | 6h |

**Milestone Check:** Can build 80%+ of common extrinsics (transfers, staking, governance)

### Phase 3: Integration & Polish (Week 3)
**Goal:** Connect everything, implement signing, and polish UX

| Task | Deliverable | Est. Hours |
|------|-------------|------------|
| Transaction signing flow | Sign with connected wallet | 12h |
| Transaction submission | Submit to chain, handle results | 8h |
| Error handling system | User-friendly error messages | 10h |
| Loading states & feedback | Skeleton loaders, toasts, progress | 8h |
| Bi-directional editing polish | Improve hex decode accuracy | 8h |

**Milestone Check:** Full flow working - build, sign, submit, see result

### Phase 4: Production & Docs (Week 4)
**Goal:** Documentation, testing, deployment, and article

| Task | Deliverable | Est. Hours |
|------|-------------|------------|
| Integration tests | Component tests, encoding tests | 12h |
| E2E tests | Critical user flows | 8h |
| API documentation | JSDoc, component API docs | 10h |
| User tutorial | Step-by-step guide | 8h |
| Performance optimization | Metadata caching, lazy loading | 8h |
| Production deployment | Security review, deploy | 6h |
| Medium article | Feature overview, ecosystem value | 6h |

**Milestone Check:** All M2 deliverables complete

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Input type coverage | 15+ components | Count implemented |
| Test coverage | >70% | Jest coverage report |
| Build time | <30s | CI measurement |
| First load time | <3s | Lighthouse |
| Successful tx submission | 100% | Manual testing |
| Documentation completeness | All public APIs | Review |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| LunoKit compatibility issues | High | Early integration, fallback to direct extension API |
| Complex type handling | Medium | Prioritize common types, graceful fallback to text |
| Wallet extension inconsistencies | Medium | Test with multiple wallets early |
| Time constraints | High | Focus on critical path, defer nice-to-haves |

---

## Dependencies

### External Libraries to Add

```json
{
  "@luno-kit/react": "latest",
  "@luno-kit/ui": "latest",
  "@tanstack/react-query": "^5.x"
}
```

### Development Dependencies

```json
{
  "@testing-library/user-event": "^14.x",
  "msw": "^2.x"
}
```

---

## File Structure Changes

```
relaycode/
├── components/
│   ├── params/
│   │   ├── inputs/
│   │   │   ├── account.tsx      # NEW
│   │   │   ├── balance.tsx      # NEW (replaces amount.tsx)
│   │   │   ├── enum.tsx         # NEW
│   │   │   ├── option.tsx       # NEW
│   │   │   ├── vector.tsx       # NEW
│   │   │   ├── struct.tsx       # NEW
│   │   │   ├── tuple.tsx        # NEW
│   │   │   ├── hash.tsx         # NEW
│   │   │   └── call.tsx         # NEW (nested extrinsics)
│   │   └── index.ts             # Barrel export
│   ├── wallet/
│   │   ├── wallet-provider.tsx  # NEW - LunoKit wrapper
│   │   ├── connect-button.tsx   # REFACTOR
│   │   ├── account-display.tsx  # NEW
│   │   └── sign-modal.tsx       # NEW
│   └── builder/
│       ├── submit-button.tsx    # NEW
│       └── tx-result.tsx        # NEW
├── context/
│   ├── wallet-context.tsx       # NEW
│   └── chain-context.tsx        # REFACTOR
├── hooks/
│   ├── use-wallet.ts            # NEW
│   ├── use-sign-tx.ts           # NEW
│   └── use-submit-tx.ts         # NEW
├── lib/
│   ├── input-map.ts             # REFACTOR - add new mappings
│   ├── type-utils.ts            # NEW - type parsing helpers
│   └── format.ts                # NEW - balance formatting
└── docs/
    └── m2-plan/
        ├── 01-overview.md       # This file
        ├── 02-architecture.md
        ├── 03-input-components.md
        ├── 04-wallet-integration.md
        ├── 05-testing-docs.md
        └── 06-ecosystem-reference.md
```

---

## Related Documents

- [02-architecture.md](./02-architecture.md) - Component architecture & decoupled design
- [03-input-components.md](./03-input-components.md) - Input component specifications
- [04-wallet-integration.md](./04-wallet-integration.md) - LunoKit integration guide
- [05-testing-docs.md](./05-testing-docs.md) - Testing & documentation strategy
- [06-ecosystem-reference.md](./06-ecosystem-reference.md) - Ecosystem comparison
