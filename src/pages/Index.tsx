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
import Leadscore from "@/pages/Leadscore";
import { Loader2, AlertCircle, LayoutDashboard, Crosshair } from "lucide-react";

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

type TabKey = "visao-geral" | "leadscore";

const Index = () => {
  const { people, rawSurveyCount, unmatchedSurveys, loading, error, refresh, lastUpdated } = useSheetData();
  const [activeTab, setActiveTab] = useState<TabKey>("visao-geral");
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(225,20%,7%)] border border-border/50 w-fit">
          <TabButton
            active={activeTab === "visao-geral"}
            onClick={() => setActiveTab("visao-geral")}
            icon={<LayoutDashboard className="w-3.5 h-3.5" />}
            label="Visão Geral"
          />
          <TabButton
            active={activeTab === "leadscore"}
            onClick={() => setActiveTab("leadscore")}
            icon={<Crosshair className="w-3.5 h-3.5" />}
            label="Leadscore"
          />
        </div>

        {/* Tab Content */}
        {activeTab === "visao-geral" ? (
          <>
            <KPICards {...stats} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <FunnelChart
                  total={stats.total}
                  respondentes={stats.respondentes}
                  crt={stats.crt}
                  crtComPesquisa={stats.crtComPesquisa}
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
              identifiedCount={new Set(people.filter((p) => p.respondeuPesquisa).map((p) => p.email)).size}
              unmatchedSurveys={unmatchedSurveys}
            />

            <ThemePairs
              people={filtered}
              crossFilter={crossFilter}
              onCrossFilter={handleCrossFilter}
            />

            <DetailTable people={filtered} />
          </>
        ) : (
          <Leadscore people={filtered} />
        )}
      </main>
    </div>
  );
};

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-primary/15 text-primary shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default Index;
