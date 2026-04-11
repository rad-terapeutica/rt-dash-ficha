import { useState, useMemo, useCallback } from "react";
import { useSheetData } from "@/hooks/useSheetData";
import { getGlobalStats, getTurmaList } from "@/data/dataProcessor";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICards from "@/components/dashboard/KPICards";
import FunnelChart from "@/components/dashboard/FunnelChart";
import DailyResponses from "@/components/dashboard/DailyResponses";
import ThemePairs from "@/components/dashboard/ThemePairs";
import DetailTable from "@/components/dashboard/DetailTable";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import { Loader2, AlertCircle } from "lucide-react";

export interface CrossFilter {
  themeTitle: string;
  themeKey: string;
  value: string;
}

const AREA_LABEL_TO_KEY: Record<string, string> = {
  "Prosperidade": "areaProsperdade",
  "Saúde": "areaSaude",
  "Ambiente": "areaAmbiente",
  "Relacionamento": "areaRelacionamento",
  "Procrastinação": "areaProcrastinacao",
  "Saúde Emocional": "areaSaudeEmocional",
};

const Index = () => {
  const { people, rawSurveyCount, loading, error, refresh, lastUpdated } = useSheetData();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [statusResposta, setStatusResposta] = useState("all");
  const [statusCRT, setStatusCRT] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [crossFilter, setCrossFilter] = useState<CrossFilter | null>(null);

  const turmaList = useMemo(() => getTurmaList(people), [people]);

  const baseFiltered = useMemo(() => {
    return people.filter((p) => {
      if (turmaFilter !== "all" && p.turma !== turmaFilter) return false;
      if (statusResposta === "sim" && !p.respondeuPesquisa) return false;
      if (statusResposta === "nao" && p.respondeuPesquisa) return false;
      if (statusCRT === "sim" && !p.virouCRT) return false;
      if (statusCRT === "nao" && p.virouCRT) return false;
      return true;
    });
  }, [people, turmaFilter, statusResposta, statusCRT]);

  const filtered = useMemo(() => {
    if (!crossFilter) return baseFiltered;
    return baseFiltered.filter((p) => {
      if (!p.survey) return false;
      if (crossFilter.themeKey === "areas") {
        const areaKey = AREA_LABEL_TO_KEY[crossFilter.value];
        if (!areaKey) return false;
        return (p.survey as any)[areaKey] === true;
      }
      const fieldValue = (p.survey as any)[crossFilter.themeKey] || "(vazio)";
      return fieldValue === crossFilter.value;
    });
  }, [baseFiltered, crossFilter]);

  const stats = useMemo(() => getGlobalStats(filtered), [filtered]);

  const handleCrossFilter = useCallback((filter: CrossFilter | null) => {
    setCrossFilter((prev) => {
      if (!filter) return null;
      if (prev && prev.themeKey === filter.themeKey && prev.value === filter.value) return null;
      return filter;
    });
  }, []);

  const clearFilters = () => {
    setTurmaFilter("all");
    setStatusResposta("all");
    setStatusCRT("all");
    setCrossFilter(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              Carregando dados reais...
            </p>
            <p className="text-sm text-muted-foreground">
              Lendo planilhas do Google Sheets
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              Erro ao carregar dados
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-6">
        <FilterBar
          turmaFilter={turmaFilter}
          statusResposta={statusResposta}
          statusCRT={statusCRT}
          turmaList={turmaList}
          filteredCount={filtered.length}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          crossFilter={crossFilter}
          onTurmaChange={setTurmaFilter}
          onStatusRespostaChange={setStatusResposta}
          onStatusCRTChange={setStatusCRT}
          onClear={clearFilters}
          onClearCrossFilter={() => setCrossFilter(null)}
          onRefresh={handleRefresh}
        />

        <KPICards {...stats} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <FunnelChart
              total={stats.total}
              respondentes={stats.respondentes}
              crt={stats.crt}
            />
          </div>
          <div className="lg:col-span-2">
            <InsightsPanel people={filtered} />
          </div>
        </div>

        <DailyResponses
          people={filtered}
          turmaFilter={turmaFilter}
          rawSurveyCount={rawSurveyCount}
          identifiedCount={people.filter((p) => p.respondeuPesquisa).length}
        />

        <ThemePairs
          people={filtered}
          crossFilter={crossFilter}
          onCrossFilter={handleCrossFilter}
        />

        <DetailTable people={filtered} />
      </main>
    </div>
  );
};

export default Index;
