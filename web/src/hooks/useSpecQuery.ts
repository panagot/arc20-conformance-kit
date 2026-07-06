import { useQuery } from "@tanstack/react-query";

import { fetchSpec } from "../api";

export function useSpecQuery() {
  return useQuery({
    queryKey: ["spec"],
    queryFn: fetchSpec,
    staleTime: 60_000,
  });
}
