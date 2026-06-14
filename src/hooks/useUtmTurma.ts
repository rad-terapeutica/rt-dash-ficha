import { useState, useEffect, useCallback } from "react";
import { fetchUtmTurma } from "@/services/utmTurma";

interface UseUtmTurmaResult {
  rows: Awaited<ReturnType<typeof fetchUtmTurma>> | null;
  loading: boolean;
  error: string | null;
}

// UTMs por turma (banco).
export function useUtmTurma(): UseUtmTurmaResult {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchUtmTurma>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUtmTurma();
      if (cancelledRef.current) return;
      setRows(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar UTMs");
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { current: false };
    load(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  return { rows, loading, error };
}
