import { describe, expect, it } from "vitest";

import { loadIarc20Spec } from "../src/spec/load-spec.js";
import { validateAbiAgainstSpec } from "../src/validate/abi-validator.js";
import { validateProgramSource } from "../src/validate/program-source-validator.js";
import type { LeoAbi } from "../src/types.js";

function addressInput(mode: "Public" | "Private") {
  return {
    Plaintext: {
      ty: { Primitive: "Address" as const },
      mode,
    },
  };
}

function u128Input(mode: "Public" | "Private") {
  return {
    Plaintext: {
      ty: { Primitive: { UInt: "U128" as const } },
      mode,
    },
  };
}

function tokenInput(program: string) {
  return {
    Record: {
      path: ["Token"],
      program,
    },
  };
}

function tokenOutput(program: string) {
  return tokenInput(program);
}

function buildConformingAbi(program = "sample_token.aleo"): LeoAbi {
  return {
    program,
    records: [
      {
        path: ["Token"],
        fields: [
          {
            name: "owner",
            ty: { Primitive: "Address" },
            mode: "Private",
          },
          {
            name: "amount",
            ty: { Primitive: { UInt: "U128" } },
            mode: "Private",
          },
        ],
      },
    ],
    functions: [
      {
        name: "transfer_public",
        inputs: [addressInput("Public"), u128Input("Public")],
        outputs: ["Final"],
      },
      {
        name: "transfer_private",
        inputs: [tokenInput(program), addressInput("Private"), u128Input("Private")],
        outputs: [tokenOutput(program), tokenOutput(program)],
      },
      {
        name: "transfer_private_to_public",
        inputs: [tokenInput(program), addressInput("Public"), u128Input("Public")],
        outputs: [tokenOutput(program), "Final"],
      },
      {
        name: "transfer_public_to_private",
        inputs: [addressInput("Private"), u128Input("Public")],
        outputs: [tokenOutput(program), "Final"],
      },
      {
        name: "transfer_public_as_signer",
        inputs: [addressInput("Public"), u128Input("Public")],
        outputs: ["Final"],
      },
      {
        name: "transfer_from_public",
        inputs: [
          addressInput("Public"),
          addressInput("Public"),
          u128Input("Public"),
        ],
        outputs: ["Final"],
      },
      {
        name: "transfer_from_public_to_private",
        inputs: [
          addressInput("Public"),
          addressInput("Private"),
          u128Input("Public"),
        ],
        outputs: [tokenOutput(program), "Final"],
      },
      {
        name: "approve_public",
        inputs: [addressInput("Public"), u128Input("Public")],
        outputs: ["Final"],
      },
      {
        name: "unapprove_public",
        inputs: [addressInput("Public"), u128Input("Public")],
        outputs: ["Final"],
      },
      {
        name: "join",
        inputs: [tokenInput(program), tokenInput(program)],
        outputs: [tokenOutput(program)],
      },
      {
        name: "split",
        inputs: [tokenInput(program), u128Input("Private")],
        outputs: [tokenOutput(program), tokenOutput(program)],
      },
    ],
    views: [
      {
        name: "balance_of",
        inputs: [addressInput("Public")],
        outputs: [u128Input("Public")],
      },
      {
        name: "allowance",
        inputs: [addressInput("Public"), addressInput("Public")],
        outputs: [u128Input("Public")],
      },
      {
        name: "supply",
        inputs: [],
        outputs: [u128Input("Public")],
      },
      {
        name: "max_supply",
        inputs: [],
        outputs: [u128Input("Public")],
      },
      {
        name: "decimals",
        inputs: [],
        outputs: [
          {
            Plaintext: {
              ty: { Primitive: { UInt: "U8" } },
              mode: "Public",
            },
          },
        ],
      },
      {
        name: "name",
        inputs: [],
        outputs: [
          {
            Plaintext: {
              ty: { Primitive: "Field" },
              mode: "Public",
            },
          },
        ],
      },
      {
        name: "symbol",
        inputs: [],
        outputs: [
          {
            Plaintext: {
              ty: { Primitive: "Field" },
              mode: "Public",
            },
          },
        ],
      },
    ],
  };
}

describe("validateAbiAgainstSpec", () => {
  it("passes a fully conforming IARC20 ABI", () => {
    const spec = loadIarc20Spec();
    const checks = validateAbiAgainstSpec(buildConformingAbi(), spec);
    const failures = checks.filter((check) => check.status === "fail");
    expect(failures).toEqual([]);
  });

  it("flags missing transfer_public", () => {
    const spec = loadIarc20Spec();
    const abi = buildConformingAbi();
    abi.functions = abi.functions?.filter(
      (entry) => entry.name !== "transfer_public",
    );
    const checks = validateAbiAgainstSpec(abi, spec);
    expect(checks.some((check) => check.id === "fn:transfer_public" && check.status === "fail")).toBe(true);
  });

  it("flags missing Token.amount u128", () => {
    const spec = loadIarc20Spec();
    const abi = buildConformingAbi();
    const token = abi.records?.[0];
    if (token) {
      token.fields = token.fields.filter((field) => field.name !== "amount");
    }
    const checks = validateAbiAgainstSpec(abi, spec);
    expect(checks.some((check) => check.id === "record:Token" && check.status === "fail")).toBe(true);
  });
});

describe("validateProgramSource", () => {
  it("detects IARC20 interface declaration and required functions", () => {
    const spec = loadIarc20Spec();
    const source = `
program sample_token.aleo: IARC20 {
  record Token { owner: address, amount: u128 }

  fn transfer_public(public recipient: address, public amount: u128) -> Final { /* ... */ }
  fn transfer_private(private input: Token, private recipient: address, private amount: u128) -> (Token, Token) { /* ... */ }
  fn transfer_private_to_public(private input: Token, public recipient: address, public amount: u128) -> (Token, Final) { /* ... */ }
  fn transfer_public_to_private(private recipient: address, public amount: u128) -> (Token, Final) { /* ... */ }
  fn transfer_public_as_signer(public recipient: address, public amount: u128) -> Final { /* ... */ }
  fn transfer_from_public(public owner: address, public recipient: address, public amount: u128) -> Final { /* ... */ }
  fn transfer_from_public_to_private(public owner: address, private recipient: address, public amount: u128) -> (Token, Final) { /* ... */ }
  fn approve_public(public spender: address, public amount: u128) -> Final { /* ... */ }
  fn unapprove_public(public spender: address, public amount: u128) -> Final { /* ... */ }
  fn join(private input_1: Token, private input_2: Token) -> Token { /* ... */ }
  fn split(private input: Token, private amount: u128) -> (Token, Token) { /* ... */ }

  view fn balance_of(account: address) -> u128 { /* ... */ }
  view fn allowance(owner: address, spender: address) -> u128 { /* ... */ }
  view fn supply() -> u128 { /* ... */ }
  view fn max_supply() -> u128 { /* ... */ }
  view fn decimals() -> u8 { /* ... */ }
  view fn name() -> identifier { /* ... */ }
  view fn symbol() -> identifier { /* ... */ }
}
`;
    const checks = validateProgramSource(source, spec, "sample_token.aleo");
    expect(checks.filter((check) => check.status === "fail")).toEqual([]);
  });
});
