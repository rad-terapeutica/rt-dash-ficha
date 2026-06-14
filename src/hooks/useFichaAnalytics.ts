import { useState, useEffect, useCallback } from "react";
import { fetchFichaAnalytics, type FichaAnalyticsData } from "@/services/fichaAnalytics";

interface UseFichaAnalyticsResult {
  data: FichaAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Analítico agregado do Domínio A (respostas/dia, cobertura, distribuições), do banco.
export function useFichaAnalytics(): UseFichaAnalyticsResult {
  const [data, setData] = useState<FichaAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFichaAnalytics();
      if (cancelledRef.current) return;
      setData(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar analítico do banco");
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
