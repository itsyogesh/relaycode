# Changelog

All notable changes to Relaycode are documented here.

The `0.1.0` and `0.2.0` entries reflect the two accepted Web3 Foundation grant milestones. Starting with `0.3.0`, releases track the continued development of Relaycode after those milestones.

## [0.3.0] - 2026-09-13

### Added

- Added Contract Studio, a browser-based Solidity workspace for compiling EVM and PVM contracts, estimating gas, and deploying through Polkadot wallets.
- Added a multi-file editor, artifact tracking, compiler feedback, and safer handling of stale build and deployment results.
- Added Paseo and expanded the supported Polkadot ecosystem networks.
- Added Relaycode branding as the browser favicon and improved page metadata and social preview images.

### Changed

- Refreshed the project after an extended maintenance gap to use current work from the libraries it depends on, including Dedot 1.4, Dedot chain types 0.280, LunoKit 0.0.13, Next.js 16, React 19, and the current TypeScript toolchain.
- Moved development, CI, and production builds to Node.js 24.
- Refined the landing page, navigation, documentation previews, and responsive layouts.
- Expanded automated coverage to more than 1,000 tests across the builder, wallet, encoding, validation, and Contract Studio flows.

### Fixed

- Restored signing on Polkadot Asset Hub after changes to its transaction extensions, including `VerifyMultiSignature`.
- Improved wallet startup and RPC fallback behavior when an endpoint is slow or unavailable.
- Fixed the Information Pane so method changes immediately produce the correct function hex, encoded call data, and call hash.
- Fixed transaction submission feedback so the builder completes at block inclusion and shows a success toast instead of remaining stuck on “Submitting…”.
- Improved dispatch-error reporting and cleared stale encoded, compiled, gas-estimate, and deployment values after failed operations.

## [0.2.0] - 2026-02-20

Web3 Foundation grant [Milestone 2](https://github.com/w3f/Grant-Milestone-Delivery/pull/1310): enhanced functionality and production deployment.

### Added

- Added LunoKit wallet connectivity for Polkadot.js, Talisman, SubWallet, and other compatible extensions.
- Added signing and submission from the builder, account selection, and network switching across Polkadot, Kusama, Westend, and related system chains.
- Added 21 type-aware input components with real-time validation for common Substrate parameter types.
- Added one-to-one hex decomposition so the Information Pane mirrors the selected call and its individual fields.
- Added bidirectional editing to decode pasted extrinsic data back into builder fields.
- Expanded the documentation, testing guide, and automated suite to 174 tests.

### Changed

- Upgraded the chain integration to Dedot v1.
- Refined the builder for responsive use, themes, clearer errors, and production deployment at [relaycode.org](https://relaycode.org).

## [0.1.0] - 2025-02-12

Web3 Foundation grant [Milestone 1](https://github.com/w3f/Grant-Milestone-Delivery/pull/1244): MVP development and initial deployment.

### Added

- Added the original split-view Extrinsic Builder and Information Pane.
- Added metadata-driven pallet and method selection.
- Added dynamic parameter fields for the selected extrinsic.
- Added real-time SCALE encoding and decoding through Dedot.
- Added encoded call data and call-hash inspection.
- Added the initial documentation, unit tests, Docker setup, and public demo deployment.

[Web3 Foundation grant application](https://github.com/w3f/Grants-Program/blob/master/applications/relaycode.md)
