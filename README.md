# ARC-20 Conformance Kit

Open-source **IARC20 conformance QA** for Aleo Leo token programs.

Answers: *Does this program implement [ARC-20](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md)?*

**Maintainer:** [panagot](https://github.com/panagot) · MIT License

---

## What this is

| Layer | Description |
|-------|-------------|
| **IARC20 spec mirror** | `spec/iarc20.json` — functions, views, Token record |
| **12 behavioral vectors** | `spec/vectors/iarc20-vectors.json` — integrator QA scenarios |
| **ABI validator** | Compare `leo build` output (`abi.json`) to IARC20 |
| **Program-source validator** | Fetch deployed program via [Provable API](https://docs.provable.com/docs/api/v2/intro) |
| **CLI** | `arc20-check` with pass/fail exit codes for CI |
| **Web workstation** | Visual report UI at `/` — ABI check, program check, vectors, spec browser |

Complements [ProvableHQ/ARCs](https://github.com/ProvableHQ/ARCs/tree/master/arc-0020) (interface library) with an **integrator-facing QA kit**.

---

## Quick start

```bash
git clone https://github.com/panagot/arc20-conformance-kit.git
cd arc20-conformance-kit
npm install
npm test
npm run dev:web
```

Open **http://localhost:5173** — multi-page conformance workstation.

| Page | Route |
|------|-------|
| Overview | `/` |
| ABI Checker | `/check/abi` |
| Program Checker | `/check/program` |
| Report Viewer | `/report` |
| IARC20 Spec | `/spec` |
| Test Vectors | `/vectors` |
| About | `/about` |

API backend: `http://localhost:8787` (proxied via Vite in dev).

### Deploy on Vercel

Connect this repo to [Vercel](https://vercel.com). The included `vercel.json` builds the web UI and serves API routes from `/api/*`.

### CLI

After `leo build` in your token project:

```bash
npm run dev -- --abi ./build/my_token/abi.json --vectors
```

Check a deployed program (Provable API):

```bash
npm run dev -- --program my_token.aleo --network testnet --vectors
```

JSON output for CI:

```bash
npm run dev -- --abi ./build/my_token/abi.json --json
```

Exit codes: `0` pass · `1` conformance failure · `2` tool error

---

## Project layout

```
spec/
  iarc20.json                     # IARC20 requirements (ARC-20 Final)
  vectors/iarc20-vectors.json     # 12 behavioral test scenarios
src/
  validate/                       # ABI + program-source validators
  cli.ts                          # arc20-check entrypoint
server/
  app.ts                          # Express API (local dev + Vercel)
web/
  src/                            # React workstation UI
docs/
  INTEGRATOR_GUIDE.md             # How wallet/DeFi teams use this
tests/
  abi-validator.test.ts
```

---

## Related work

- [ARC-20 spec](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md)
- [Dynamic dispatch example](https://github.com/ProvableHQ/dynamic-dispatch-example)
- [Leo ABI guide](https://github.com/ProvableHQ/leo/blob/master/documentation/guides/abi.md)

---

## License

MIT
