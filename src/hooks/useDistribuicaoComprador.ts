import { useState, useEffect, useCallback } from "react";
import { fetchDistribuicaoComprador, type DistCompradorRow } from "@/services/distribuicaoComprador";

interface UseDistribuicaoCompradorResult {
  rows: DistCompradorRow[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Perfil por comprador (banco) — distribuição dos campos da ficha por comprou × não comprou.
export function useDistribuicaoComprador(): UseDistribuicaoCompradorResult {
  const [rows, setRows] = useState<DistCompradorRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDistribuicaoComprador();
      if (cancelledRef.current) return;
      setRows(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil por comprador");
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

  return { rows, loading, error, refresh };
}
