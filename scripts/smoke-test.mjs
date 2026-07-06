/**
 * Smoke test for ARC-20 Conformance Kit API (local or Vercel).
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 * Default: http://localhost:5173 (Vite proxy -> API)
 */

const base = (process.argv[2] ?? "http://localhost:5173").replace(/\/$/, "");

const results = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, ok: false, detail: message });
    console.log(`✗ ${name} — ${message}`);
  }
}

async function getJson(path) {
  const res = await fetch(`${base}${path}`);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${res.status} non-JSON: ${text.slice(0, 120)}`);
  }
  if (!res.ok) throw new Error(`${res.status}: ${body.error ?? text.slice(0, 120)}`);
  return body;
}

async function postJson(path, payload) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${res.status} non-JSON: ${text.slice(0, 120)}`);
  }
  if (!res.ok) throw new Error(`${res.status}: ${body.error ?? text.slice(0, 120)}`);
  return body;
}

function scorePercent(report) {
  const checks = report.checks ?? [];
  if (!checks.length) return 0;
  const passed = checks.filter((c) => c.status === "pass").length;
  return Math.round((passed / checks.length) * 100);
}

console.log(`\nARC-20 Conformance Kit smoke test\nBase URL: ${base}\n`);

await check("GET /api/health", async () => {
  const body = await getJson("/api/health");
  if (!body.ok) throw new Error("health not ok");
  return body.service;
});

await check("GET /api/spec", async () => {
  const body = await getJson("/api/spec");
  const fnCount = body.spec?.functions?.length ?? 0;
  const vecCount = body.vectors?.length ?? 0;
  if (fnCount < 10) throw new Error(`expected 11+ functions, got ${fnCount}`);
  if (vecCount !== 12) throw new Error(`expected 12 vectors, got ${vecCount}`);
  return `${fnCount} functions, ${vecCount} vectors`;
});

await check("GET /api/demo/abi", async () => {
  const body = await getJson("/api/demo/abi");
  if (!body.program?.includes(".aleo")) throw new Error("missing program id");
  return body.program;
});

await check("GET /api/demo (run demo check)", async () => {
  const report = await getJson("/api/demo");
  const score = scorePercent(report);
  if (score !== 100) throw new Error(`expected 100% demo score, got ${score}%`);
  return `${score}% pass, ${report.checks?.length ?? 0} checks`;
});

await check("POST /api/check/abi (conforming sample)", async () => {
  const abi = await getJson("/api/demo/abi");
  const report = await postJson("/api/check/abi", { abi, includeVectors: true });
  const score = scorePercent(report);
  if (score !== 100) throw new Error(`expected 100%, got ${score}%`);
  return `${score}% pass`;
});

await check("POST /api/check/abi (invalid payload)", async () => {
  const res = await fetch(`${base}/api/check/abi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abi: {} }),
  });
  if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
  return "400 as expected";
});

await check("POST /api/check/program (testnet credits.aleo)", async () => {
  const report = await postJson("/api/check/program", {
    programId: "credits.aleo",
    network: "testnet",
    includeVectors: true,
  });
  if (report.passed === true) throw new Error("credits.aleo should not pass IARC20");
  if (!report.checks?.length) throw new Error("expected conformance checks");
  return `correctly failed (${report.summary?.fail ?? "?"} fails)`;
});

await check("POST /api/check/program (missing id)", async () => {
  const res = await fetch(`${base}/api/check/program`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
  return "400 as expected";
});

await check("GET / (SPA index)", async () => {
  const res = await fetch(`${base}/`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  const html = await res.text();
  if (!html.includes("ARC-20") && !html.includes("root")) {
    throw new Error("unexpected index HTML");
  }
  return `status ${res.status}`;
});

await check("GET /check/abi (client route)", async () => {
  const res = await fetch(`${base}/check/abi`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  const html = await res.text();
  if (!html.includes("root")) throw new Error("SPA fallback missing");
  return "SPA fallback OK";
});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;

console.log(`\n${passed}/${results.length} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
