#!/usr/bin/env node

import { formatJsonReport, formatTextReport } from "./report/format-report.js";
import { runConformanceCheck } from "./validate/run-check.js";

function printHelp(): void {
  console.log(`arc20-check — ARC-20 (IARC20) conformance checker

Usage:
  arc20-check --abi ./build/my_token/abi.json [--vectors] [--json]
  arc20-check --program my_token.aleo [--network testnet|mainnet] [--vectors] [--json]

Options:
  --abi <path>        Validate a Leo build abi.json against IARC20
  --program <id>      Fetch deployed program source via Provable API
  --network <name>    mainnet or testnet (default: testnet)
  --vectors           Include behavioral vector static-coverage summary
  --json              Emit JSON report
  --help              Show this help
`);
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const abiPath = readFlag(args, "--abi");
  const programId = readFlag(args, "--program");
  const network = readFlag(args, "--network") as "mainnet" | "testnet" | undefined;
  const includeVectors = args.includes("--vectors");
  const json = args.includes("--json");

  try {
    const report = await runConformanceCheck({
      abiPath,
      programId,
      network,
      includeVectors,
      json,
    });

    const output = json ? formatJsonReport(report) : formatTextReport(report);
    console.log(output);
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`arc20-check error: ${message}`);
    process.exit(2);
  }
}

main();
