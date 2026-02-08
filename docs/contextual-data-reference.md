# Contextual Data Reference

## API Reference

### Polkassembly API

**Base URL:** `https://api.polkassembly.io/api/v1`
**Proxy:** `/api/polkassembly/[...path]`
**Auth:** `x-api-key` header (optional, tracked)
**Network:** `x-network` header (`polkadot`, `kusama`, `westend`, `paseo`)

#### List Referenda (OpenGov)

```
GET /listing/on-chain-posts
  ?proposalType=referendums_v2
  &sortBy=newest
  &listingLimit=100
  &page=1
```

Response shape:
```json
{
  "posts": [
    {
      "post_id": 1234,
      "title": "Referendum Title",
      "status": "Deciding",
      "track_no": 1,
      "track_name": "whitelisted_caller",
      "proposer": "5GrwvaEF...",
      "tally": { "ayes": "1000000000000", "nays": "500000000000", "support": "..." },
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### List Bounties

```
GET /listing/on-chain-posts
  ?proposalType=bounties
  &sortBy=newest
  &listingLimit=100
  &page=1
```

Response shape: Same as referenda, with bounty-specific fields (`content`, `reward`, `curator`).

---

### Subscan API

**Base URL:** `https://{network}.api.subscan.io/api`
**Proxy:** `/api/subscan/{network}/[...path]`
**Auth:** `X-API-Key` header (recommended; free tier: 5 req/s, 100K req/day)

#### List Validators

```
POST /scan/staking/validators
Body: {
  "order_field": "bonded_total",
  "order": "desc",
  "page": 0,
  "row": 100
}
```

Response shape:
```json
{
  "data": {
    "list": [
      {
        "stash_account": "5GNJ...",
        "controller_account": "5GNJ...",
        "node_name": "My Validator",
        "stash_account_display": {
          "display": "Alice",
          "identity": true,
          "parent_display": "Parent",
          "sub_symbol": "sub"
        },
        "commission": "5.00",
        "bonded_total": "1000000000000000",
        "count_nominators": 256,
        "is_active": true,
        "is_oversubscribed": false
      }
    ]
  }
}
```

#### List Nomination Pools

```
POST /scan/nomination_pool/pools
Body: {
  "order_field": "pool_id",
  "order": "asc",
  "page": 0,
  "row": 100,
  "status": []
}
```

Response shape:
```json
{
  "data": {
    "list": [
      {
        "pool_id": 1,
        "metadata": "Polkadot Pool #1",
        "state": "Open",
        "member_count": 50,
        "bonded_total": "500000000000000",
        "depositor": "5GNJ...",
        "depositor_display": { "display": "Alice", "identity": true }
      }
    ]
  }
}
```

---

### Wisesama API

**Base URL:** `https://api.wisesama.com/api/v1`
**Proxy:** `/api/wisesama/[...path]`
**Auth:** `x-api-key` header (required)

#### Identity Lookup

```
GET /identity/{address}?chain=polkadot
```

Response shape:
```json
{
  "displayName": "Alice",
  "isVerified": true,
  "judgements": [{ "registrar": 0, "judgement": "Reasonable" }],
  "riskLevel": "low"
}
```

**Caching:** Results cached in-memory for 1 hour, keyed by `address:chain`.

---

## Multi-Step Template Catalog (Future Feature)

These are documented workflows for common Substrate operations that could be implemented as guided multi-step templates.

| # | Flow | Extrinsic Steps | Batchable? | Priority |
|---|------|----------------|-----------|----------|
| 1 | Start Nominating | `staking.bond` + `staking.nominate` | All | High |
| 2 | Validator Setup | `staking.bond` + `session.setKeys` + `staking.validate` | All | High |
| 3 | Identity Setup | `identity.setIdentity` + `identity.requestJudgement` | Steps 1+2 | High |
| 4 | OpenGov Referendum | `preimage.notePreimage` + `referenda.submit` + `referenda.placeDecisionDeposit` | Steps 1+2+3 | High |
| 5 | Governance Delegation | `convictionVoting.delegate` across all tracks | All | High |
| 6 | Proxy Setup | Multiple `proxy.addProxy` calls | All | Medium |
| 7 | Stop Nominating | `staking.chill` + `staking.unbond` (+ wait + `staking.withdrawUnbonded`) | Steps 1+2 | Medium |
| 8 | Nom Pool Creation | `nominationPools.create` + `nominationPools.nominate` + `nominationPools.setMetadata` | Steps 1+2 | Medium |
| 9 | Asset Creation | `assets.create` + `assets.setMetadata` + `assets.mint` | All | Medium |
| 10 | Bounty Lifecycle | `bounties.proposeBounty` + approve + fund + curator + award + claim | Limited | Low |
| 11 | Child Bounty | `childBounties.addChildBounty` + `proposeCurator` (+ accept + award + claim) | Steps 1+2 | Low |
| 12 | Multisig Execution | `multisig.asMulti` initiate + approve(s) + execute | None (multi-signer) | Low |
| 13 | Coretime Purchase | `broker.purchase` + `broker.assign` + `broker.enableAutoRenew` | Steps 1+2 | Low |
| 14 | XCM Transfer | `xcmPallet.limitedTeleportAssets` (single call) | N/A | Low |
| 15 | Vesting Claim | `vesting.vest` (repeated) | Multiple vest calls | Low |

---

## Pallet Coverage Roadmap

| Group | Pallets | Status |
|-------|---------|--------|
| governance | ConvictionVoting, Referenda, Bounties, Treasury | Implemented |
| staking | Staking, NominationPools | Implemented |
| identity | Identity (People Chain) | Via Wisesama in selectors |
| proxy | Proxy | Future |
| multisig | Multisig | Future |
| vesting | Vesting | Future |
| assets | Assets, ForeignAssets (Asset Hub) | Future |
| coretime | Broker | Future |
| xcm | XcmPallet | Future |

---

## Environment Variables

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `POLKASSEMBLY_API_KEY` | Polkassembly | No | API key for tracking usage |
| `SUBSCAN_API_KEY` | Subscan | Recommended | Free tier: 5 req/s, 100K/day |
| `WISESAMA_API_KEY` | Wisesama | Yes | Required for identity lookups |
| `WISESAMA_API_URL` | Wisesama | No | Override base URL (default: `https://api.wisesama.com/api/v1`) |
