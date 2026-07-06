import type { ConformanceReport } from "../types";

export async function fetchHealth(): Promise<{ ok: boolean }> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("API offline");
  return res.json();
}

export async function fetchDemoAbi(): Promise<unknown> {
  const res = await fetch("/api/demo/abi");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchDemoReport(): Promise<ConformanceReport> {
  const res = await fetch("/api/demo");
  if (!res.ok) throw new Error(await res.text());
  const report = (await res.json()) as ConformanceReport;
  return { ...report, checkedAt: new Date().toISOString() };
}

export async function fetchSpec() {
  const res = await fetch("/api/spec");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkAbi(abi: unknown): Promise<ConformanceReport> {
  const res = await fetch("/api/check/abi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abi, includeVectors: true }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error ?? "ABI check failed");
  return { ...payload, checkedAt: new Date().toISOString() };
}

export async function checkProgram(
  programId: string,
  network: "mainnet" | "testnet",
): Promise<ConformanceReport> {
  const res = await fetch("/api/check/program", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ programId, network, includeVectors: true }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error ?? "Program check failed");
  return { ...payload, checkedAt: new Date().toISOString() };
}
