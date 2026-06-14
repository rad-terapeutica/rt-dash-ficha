import { useState, useEffect, useCallback } from "react";
import { fetchKpiPesquisa, type KpiPesquisaData } from "@/services/kpiPesquisa";

interface UseKpiPesquisaResult {
  data: KpiPesquisaData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// KPI oficial por tag, lido do banco (view vw_pesquisa_por_tag).
export function useKpiPesquisa(): UseKpiPesquisaResult {
  const [data, setData] = useState<KpiPesquisaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchKpiPesquisa();
      if (cancelledRef.current) return;
      setData(result);
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar KPI do banco");
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
