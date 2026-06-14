import { useState, useEffect, useCallback } from "react";
import { fetchFunilTurma, type FunilTurmaData } from "@/services/funilTurma";

interface UseFunilTurmaResult {
  data: FunilTurmaData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Funil oficial por turma (banco): leads → respostas → compras COMU RT.
export function useFunilTurma(): UseFunilTurmaResult {
  const [data, setData] = useState<FunilTurmaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunilTurma();
      if (cancelledRef.current) return;
      setData(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar funil do banco");
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

  const refresh = useCallback(() => {
    const cancelledRef = { current: false };
    load(cancelledRef);
  }, [load]);

  return { data, loading, error, refresh };
}
