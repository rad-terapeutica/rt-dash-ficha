import { useState, useEffect } from "react";
import { fetchAllSheets } from "@/services/googleSheets";
import { processData, type Person } from "@/data/dataProcessor";

interface UseSheetDataResult {
  people: Person[];
  loading: boolean;
  error: string | null;
}

export function useSheetData(): UseSheetDataResult {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllSheets();
        if (cancelled) return;
        const result = processData(data);
        setPeople(result.people);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { people, loading, error };
}
