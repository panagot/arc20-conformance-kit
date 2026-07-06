# Integrator Guide — ARC-20 Conformance

For wallet teams, DEX builders, and token issuers verifying **IARC20** compatibility before mainnet.

---

## Why use this kit?

[ARC-20](https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md) enables **dynamic dispatch**: your AMM or router can call `IARC20@(token_id)::transfer_from_public(...)` without compiling against each token.

If a token program is missing a required function or uses wrong types, integration fails at runtime. This kit catches **interface mismatches early**.

Provable maintains the [IARC20 interface library](https://github.com/ProvableHQ/ARCs/tree/master/arc-0020/IARC20). This project adds:

1. Portable **test vectors** (JSON)
2. **ABI validation** from `leo build`
3. **CI-friendly CLI** with exit codes

---

## Step 1 — Declare IARC20 in Leo

```leo
program my_token.aleo: IARC20 {
  record Token {
    owner: address,
    amount: u128,
  }

  // Implement all IARC20 transfer, approval, join/split, and view fn accessors.
}
```

Import or mirror the official interface from [ProvableHQ/ARCs](https://github.com/ProvableHQ/ARCs/tree/master/arc-0020/IARC20).

---

## Step 2 — Build and check ABI

```bash
leo build
npx arc20-check --abi ./build/my_token/abi.json --vectors
```

The checker validates:

- `Token` record with `owner: address` and `amount: u128`
- All 11 required entry functions with correct input/output shapes
- All 7 required `view fn` accessors

Warnings (non-blocking):

- Program id naming
- Missing `: IARC20` in source (when using `--program` mode)

---

## Step 3 — Check deployed program (optional)

```bash
npx arc20-check --program my_token.aleo --network testnet
```

Fetches program source from Provable API and verifies function/view presence.

---

## Step 4 — Review behavioral vectors

See `src/spec/data/iarc20-vectors.json`. Each vector documents expected behavior:

| ID | Scenario |
|----|----------|
| IARC20-001 | Public transfer |
| IARC20-006 | Transfer-from with allowance |
| IARC20-007 | Additive approvals (not ERC-20 replace) |
| IARC20-011 | View accessor suite |

**v0.1** covers static interface checks. Runtime vector execution is planned for M2 (Leo test harness + Provable API).

---

## ARC-20 vs ERC-20 reminders

| Topic | ARC-20 behavior |
|-------|-----------------|
| Approvals | **Additive** — use `unapprove_public` to decrease |
| Amounts | **u128** everywhere |
| Privacy | Private transfers, shield/unshield, join/split |
| Token identity | Program name (e.g. `my_token.aleo`), not contract address |
| Native credits | `credits.aleo` cannot implement IARC20 directly — use a **stateful wrapper** |

---

## CI snippet (planned GitHub Action)

```yaml
- run: leo build
- run: npx arc20-check --abi ./build/my_token/abi.json --json
```

---

## Getting help / grant feedback

- Aleo grants: [aleo.org/grants](https://aleo.org/grants/)
- ARC discussion: [ARC-20 #124](https://github.com/ProvableHQ/ARCs/discussions/124)

When requesting acceptor sign-off, ask a wallet or ARC contributor to confirm ≥8/12 vectors against a reference token program.
