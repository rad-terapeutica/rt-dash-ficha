import { useState, useEffect, useCallback } from "react";
import { fetchDashAtualizacao, type DashAtualizacao } from "@/services/dashAtualizacao";

interface UseDashAtualizacaoResult {
  data: DashAtualizacao | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Timestamp real da última atualização do banco.
export function useDashAtualizacao(): UseDashAtualizacaoResult {
  const [data, setData] = useState<DashAtualizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDashAtualizacao();
      if (cancelledRef.current) return;
      setData(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao ler atualização do banco");
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

  const refresh = useCallback(async () => {
    const cancelledRef = { current: false };
    await load(cancelledRef);
  }, [load]);

  return { data, loading, error, refresh };
}
