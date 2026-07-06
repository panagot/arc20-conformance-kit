# ARC-20 Conformance Kit

**Validate Aleo Leo token programs against the IARC20 standard — before you ship to mainnet.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node-%3E%3D20-1c1917.svg)](package.json)
[![Aleo](https://img.shields.io/badge/Standard-ARC--20-57534e.svg)](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md)

Open-source conformance QA for [ARC-20 (IARC20)](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md) token programs on Aleo. Wallet teams, DeFi integrators, and token issuers use it to answer one question:

> **Does this Leo program actually implement ARC-20?**

The kit checks ABI signatures, deployed program interfaces, and behavioral vector coverage — with a CLI for CI and a web workstation for visual reports.

**Live demo:** deploy from this repo on [Vercel](https://vercel.com) · **Maintainer:** [@panagot](https://github.com/panagot)

---

## Why this exists

Leo v4 introduced interfaces and dynamic dispatch: protocols can call any IARC20-compliant token at runtime. Before integrating a token, you need confidence that its interface matches the spec — not just that it compiles.

| Problem | How this kit helps |
|--------|---------------------|
| ABI drift after `leo build` | Compare `abi.json` against the IARC20 requirement set |
| Deployed program differs from local build | Fetch source via [Provable API](https://docs.provable.com/docs/api/v2/intro) and scan signatures |
| No shared integrator test language | 12 portable behavioral vectors with coverage mapping |
| Manual review doesn't scale | CLI exit codes + JSON reports for CI pipelines |

This complements [ProvableHQ/ARCs](https://github.com/ProvableHQ/ARCs/tree/master/arc-0020) (the interface library) with an **integrator-facing QA layer** — not a duplicate of the ARC reference implementation.

---

## Features

- **IARC20 spec mirror** — machine-readable requirements (`src/spec/data/iarc20.json`)
- **12 behavioral vectors** — integrator QA scenarios with static check mapping
- **ABI validator** — paste or upload `leo build` output
- **Program-source validator** — testnet / mainnet program ID lookup
- **Conformance score** — pass rate, category breakdown, vector heatmap
- **CLI (`arc20-check`)** — scriptable checks with CI-friendly exit codes
- **Web workstation** — Overview, ABI Check, Program Check, Report, Spec browser, Vectors

---

## Web workstation

| Page | Route | Purpose |
|------|-------|---------|
| Overview | `/` | Run demo check, see live score |
| ABI Check | `/check/abi` | Upload or paste ABI JSON |
| Program Check | `/check/program` | Validate deployed program ID |
| Report | `/report` | Full conformance breakdown |
| IARC20 Spec | `/spec` | Browse required functions & views |
| Vectors | `/vectors` | Behavioral test scenario catalog |
| About | `/about` | CLI usage & project links |

---

## Quick start

### Web UI (local)

```bash
git clone https://github.com/panagot/arc20-conformance-kit.git
cd arc20-conformance-kit
npm install
npm run dev:web
```

Open **http://localhost:5173** (API on `:8787`, proxied by Vite).

### Deploy on Vercel

1. Import [github.com/panagot/arc20-conformance-kit](https://github.com/panagot/arc20-conformance-kit) in Vercel
2. Use the default settings — `vercel.json` configures build + API routes
3. Deploy — demo check, ABI validation, and spec browser work out of the box

### CLI

After `leo build` in your token project:

```bash
# Check local ABI + vector coverage
npm run dev -- --abi ./build/my_token/abi.json --vectors

# Check a deployed program
npm run dev -- --program my_token.aleo --network testnet --vectors

# JSON output for CI
npm run dev -- --abi ./build/my_token/abi.json --json
```

**Exit codes:** `0` pass · `1` conformance failure · `2` tool error

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Web UI (React + Vite)          CLI (arc20-check)       │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────────────────────────────────────┐
│  Conformance engine                                       │
│  · ABI validator        · Program-source validator        │
│  · IARC20 spec loader   · Vector coverage mapper          │
└───────────────┬───────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│  Data                                                     │
│  · src/spec/data/iarc20.json                              │
│  · src/spec/data/iarc20-vectors.json                      │
│  · src/spec/data/demo-abi.json                          │
└───────────────────────────────────────────────────────────┘
```

---

## Project layout

```
src/
  spec/data/              # IARC20 spec, vectors, demo ABI (bundled at runtime)
  validate/               # ABI + program-source validators
  cli.ts                  # arc20-check entrypoint
server/                   # Express API (local dev + Vercel serverless)
api/                      # Vercel function entry
web/                      # React workstation
docs/
  INTEGRATOR_GUIDE.md     # Guide for wallet & DeFi teams
tests/
  abi-validator.test.ts
```

See [docs/INTEGRATOR_GUIDE.md](./docs/INTEGRATOR_GUIDE.md) for integration workflows.

---

## Development

```bash
npm test              # Run unit tests
npm run build:web     # Production UI build
npm run build         # Compile CLI to dist/
```

Requires **Node.js 20+**.

---

## Related work

- [ARC-20 specification](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md)
- [Provable dynamic dispatch example](https://github.com/ProvableHQ/dynamic-dispatch-example)
- [Leo ABI guide](https://github.com/ProvableHQ/leo/blob/master/documentation/guides/abi.md)

---

## License

[MIT](./LICENSE) · maintained by [panagot](https://github.com/panagot)
