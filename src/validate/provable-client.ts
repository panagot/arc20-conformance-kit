import type { ProvableProgramResponse } from "../types.js";

const DEFAULT_BASE = "https://api.provable.com/v2";

export async function fetchProgramSource(
  programId: string,
  network: "mainnet" | "testnet",
  baseUrl = DEFAULT_BASE,
): Promise<{ source: string; edition?: number }> {
  const normalized = programId.endsWith(".aleo") ? programId : `${programId}.aleo`;
  const url = `${baseUrl}/${network}/program/${encodeURIComponent(normalized)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      `Provable API ${response.status} for ${normalized} on ${network}`,
    );
  }

  const payload = (await response.json()) as
    | string
    | (ProvableProgramResponse & {
        program_id?: string;
        edition?: number;
        program?: string;
        source?: string;
      });

  if (typeof payload === "string") {
    return { source: payload };
  }

  const source = payload.source ?? payload.program;
  if (!source || typeof source !== "string") {
    throw new Error(
      `Provable API returned no program source for ${normalized}. Use --abi with leo build output instead.`,
    );
  }

  return { source, edition: payload.edition };
}
