import { useState, useEffect } from "react";
import { fetchAllSheets } from "@/services/googleSheets";
import { processData, type Person, type UnmatchedSurvey } from "@/data/dataProcessor";

interface UseSheetDataResult {
  people: Person[];
  rawSurveyCount: number;
  unmatchedSurveys: UnmatchedSurvey[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

export function useSheetData(): UseSheetDataResult {
  const [people, setPeople] = useState<Person[]>([]);
  const [rawSurveyCount, setRawSurveyCount] = useState(0);
  const [unmatchedSurveys, setUnmatchedSurveys] = useState<UnmatchedSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async (cancelledRef: { current: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllSheets();
      if (cancelledRef.current) return;
      const result = processData(data);
      setPeople(result.people);
      setRawSurveyCount(result.rawSurveyCount);
      setUnmatchedSurveys(result.unmatchedSurveys);
      setLastUpdated(new Date());
    } catch (err) {
      if (!cancelledRef.current) setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const cancelledRef = { current: false };
    loadData(cancelledRef);
    return () => { cancelled = true; cancelledRef.current = true; };
  }, []);

  const refresh = () => {
    const cancelledRef = { current: false };
    loadData(cancelledRef);
  };

  return { people, rawSurveyCount, unmatchedSurveys, loading, error, refresh, lastUpdated };
}
