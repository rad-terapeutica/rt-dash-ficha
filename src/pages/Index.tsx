import { useState, useMemo, useCallback } from "react";
import { useSheetData } from "@/hooks/useSheetData";
import { useKpiPesquisa } from "@/hooks/useKpiPesquisa";
import { useFichaAnalytics } from "@/hooks/useFichaAnalytics";
import { useFunilTurma } from "@/hooks/useFunilTurma";
import { useDistribuicaoComprador } from "@/hooks/useDistribuicaoComprador";
import { useDashAtualizacao } from "@/hooks/useDashAtualizacao";
import { useUtmTurma } from "@/hooks/useUtmTurma";
import { buildPerfilScope } from "@/services/distribuicaoComprador";
import { buildUtmScope } from "@/services/utmTurma";
import { getGlobalStats, getDirectCRTStats, getTurmaList } from "@/data/dataProcessor";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICards from "@/components/dashboard/KPICards";
import FunnelChart from "@/components/dashboard/FunnelChart";
import UtmTurma from "@/components/dashboard/UtmTurma";
import DailyResponses, { type DailyPoint, type CoverageData } from "@/components/dashboard/DailyResponses";
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

// Extrai a data embutida no nome da turma ("Desafio - dd/mm/yy") como timestamp,
// para ordenar o menu por recência real (mais nova → mais antiga).
function turmaDateValue(turmaNome: string): number {
  const m = turmaNome.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (!m) return 0;
  const [, dd, mm, yy] = m;
  const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
  return new Date(year, Number(mm) - 1, Number(dd)).getTime();
}

const Index = () => {
  const { people, unmatchedSurveys, crtRows, surveyEmails, loading, error } = useSheetData();
  const { data: kpiBanco } = useKpiPesquisa();
  const { data: fichaBanco } = useFichaAnalytics();
  const { data: funilBanco } = useFunilTurma();
  const { rows: distCompradorRows } = useDistribuicaoComprador();
  const { data: dashAtualizacao } = useDashAtualizacao();
  const { rows: utmRows } = useUtmTurma();
  const [activeTab, setActiveTab] = useState<TabKey>("visao-geral");
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [statusResposta, setStatusResposta] = useState("all");
  const [statusCRT, setStatusCRT] = useState("all");
  const [crossFilter, setCrossFilter] = useState<CrossFilter | null>(null);

  // Menu de turmas: fonte oficial = banco (vw_pesquisa_por_tag), ordenado por
  // data da turma decrescente. Fallback p/ sheets só enquanto o banco carrega.
  const turmaList = useMemo(() => {
    if (kpiBanco?.porTag?.length) {
      return [...kpiBanco.porTag]
        .sort((a, b) => turmaDateValue(b.turmaNome) - turmaDateValue(a.turmaNome))
        .map((r) => r.turmaNome);
    }
    return getTurmaList(people);
  }, [kpiBanco, people]);

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
  const directCRT = useMemo(
    () => getDirectCRTStats(crtRows, surveyEmails, turmaFilter),
    [crtRows, surveyEmails, turmaFilter]
  );

  // KPI OFICIAL (banco): Total da Turma / Respostas da Pesquisa / Adesão.
  // Fonte = view vw_pesquisa_por_tag (interseção de email por tag). Chaveado só
  // pela turma selecionada; "all" usa a linha de total geral (distinct, sem somar).
  const kpiOficial = useMemo(() => {
    if (!kpiBanco) return null;
    if (turmaFilter === "all") {
      return {
        total: kpiBanco.global.totalLeads,
        respondentes: kpiBanco.global.responderamPesquisa,
        pct: kpiBanco.global.conversaoPesquisaPct,
      };
    }
    const row = kpiBanco.porTag.find((r) => r.turmaNome === turmaFilter);
    return row
      ? { total: row.totalLeads, respondentes: row.responderamPesquisa, pct: row.conversaoPesquisaPct }
      : null;
  }, [kpiBanco, turmaFilter]);

  // Cards/funil usam o banco quando disponível; senão caem na fonte antiga (sheets).
  const cardStats = useMemo(() => {
    if (!kpiOficial) return stats;
    return {
      ...stats,
      total: kpiOficial.total,
      respondentes: kpiOficial.respondentes,
      pctRespondentes: kpiOficial.pct,
    };
  }, [stats, kpiOficial]);

  // ── Domínio A agregável (banco): respostas/dia, cobertura, distribuições ──

  // Respostas por dia (banco) da turma selecionada — 1ª submissão por email.
  const dailyBanco = useMemo<DailyPoint[]>(() => {
    if (!fichaBanco || turmaFilter === "all") return [];
    return fichaBanco.respostasPorDia
      .filter((r) => r.turmaNome === turmaFilter)
      .map((r) => {
        const [y, m, d] = r.dia.split("-");
        return { date: `${d}/${m}/${y}`, dateISO: r.dia, count: r.respostas };
      })
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [fichaBanco, turmaFilter]);

  // Cobertura (banco): reage à turma; em "all" vira visão global.
  const coverageBanco = useMemo<CoverageData>(() => {
    const fallback: CoverageData = { mode: "global", totalRespostasFicha: 0, identificados: 0, foraDaBase: 0 };
    if (!fichaBanco) return fallback;
    if (turmaFilter === "all") {
      const g = fichaBanco.cobertura.find((c) => c.turmaSlug === null);
      if (!g) return fallback;
      return {
        mode: "global",
        totalRespostasFicha: g.totalRespostasFicha ?? 0,
        identificados: g.responderam,
        foraDaBase: g.respostasForaDaBase ?? 0,
      };
    }
    const t = fichaBanco.cobertura.find((c) => c.turmaNome === turmaFilter);
    if (!t) return { mode: "turma", totalLeads: 0, responderam: 0, naoResponderam: 0, pctResposta: 0 };
    return {
      mode: "turma",
      totalLeads: t.totalLeads,
      responderam: t.responderam,
      naoResponderam: t.naoResponderam,
      pctResposta: t.pctResposta,
    };
  }, [fichaBanco, turmaFilter]);

  // Distribuições (banco) no escopo selecionado (turma ou total geral).
  const distribuicaoBanco = useMemo(() => {
    if (!fichaBanco) return [];
    return turmaFilter === "all"
      ? fichaBanco.distribuicao.filter((d) => d.turmaSlug === null)
      : fichaBanco.distribuicao.filter((d) => d.turmaNome === turmaFilter);
  }, [fichaBanco, turmaFilter]);

  // Funil COMU RT (banco): card "Na Comu RT" + estágio do funil + conversões de compra.
  // "all" usa o total geral (pessoas únicas, não soma de turmas).
  const funilOficial = useMemo(() => {
    if (!funilBanco) return null;
    if (turmaFilter === "all") {
      return {
        crt: funilBanco.global.compraramComuRt,
        crtComPesquisa: funilBanco.global.responderamECompraram,
        pctCrtTotal: funilBanco.global.conversaoCompraPct,
        pctCrtRespondentes: funilBanco.global.conversaoRespondeuParaCompraPct,
      };
    }
    const row = funilBanco.porTag.find((r) => r.turmaNome === turmaFilter);
    return row
      ? {
          crt: row.compraramComuRt,
          crtComPesquisa: row.responderamECompraram,
          pctCrtTotal: row.conversaoCompraPct,
          pctCrtRespondentes: row.conversaoRespondeuParaCompraPct,
        }
      : null;
  }, [funilBanco, turmaFilter]);

  // Perfil por comprador (banco) no escopo selecionado (turma ou total geral).
  // Alimenta CompareCard, toggle "somente Comu RT", sinais do InsightsPanel e a aba Leadscore.
  const perfilComprador = useMemo(() => {
    if (!distCompradorRows) return null;
    return buildPerfilScope(distCompradorRows, turmaFilter === "all" ? null : turmaFilter);
  }, [distCompradorRows, turmaFilter]);

  // UTMs (banco) do escopo selecionado.
  const utmCampos = useMemo(() => {
    if (!utmRows) return [];
    return buildUtmScope(utmRows, turmaFilter === "all" ? null : turmaFilter);
  }, [utmRows, turmaFilter]);

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
          ultimaAtualizacao={dashAtualizacao?.ultima ?? null}
          fontesAtualizacao={
            dashAtualizacao
              ? { ac: dashAtualizacao.ac, ficha: dashAtualizacao.ficha, comprador: dashAtualizacao.comprador }
              : undefined
          }
          crossFilter={crossFilter}
          onTurmaChange={setTurmaFilter}
          onStatusRespostaChange={setStatusResposta}
          onStatusCRTChange={setStatusCRT}
          onClear={clearFilters}
          onClearCrossFilter={() => setCrossFilter(null)}
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
            <KPICards
              {...cardStats}
              crt={funilOficial ? funilOficial.crt : directCRT.crtTotal}
              crtComPesquisa={funilOficial ? funilOficial.crtComPesquisa : directCRT.crtComPesquisa}
              pctCrtTotal={
                funilOficial
                  ? funilOficial.pctCrtTotal
                  : cardStats.total > 0
                  ? (directCRT.crtTotal / cardStats.total) * 100
                  : 0
              }
              pctCrtRespondentes={funilOficial ? funilOficial.pctCrtRespondentes : cardStats.pctCrtRespondentes}
              crtFromBanco={!!funilOficial}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <FunnelChart
                  total={cardStats.total}
                  respondentes={cardStats.respondentes}
                  crt={funilOficial ? funilOficial.crt : directCRT.crtTotal}
                  crtComPesquisa={funilOficial ? funilOficial.crtComPesquisa : directCRT.crtComPesquisa}
                />
              </div>
              <div className="lg:col-span-2">
                <InsightsPanel
                  kpiPorTag={kpiBanco?.porTag ?? []}
                  funilPorTag={funilBanco?.porTag ?? []}
                  perfilComprador={perfilComprador}
                />
              </div>
            </div>

            <UtmTurma campos={utmCampos} turmaFilter={turmaFilter} />

            <DailyResponses
              daily={dailyBanco}
              turmaFilter={turmaFilter}
              coverage={coverageBanco}
              unmatchedSurveys={unmatchedSurveys}
            />

            <ThemePairs
              distribuicao={distribuicaoBanco}
              perfilComprador={perfilComprador}
              crossFilter={crossFilter}
              onCrossFilter={handleCrossFilter}
            />

            <DetailTable people={filtered} />
          </>
        ) : (
          <Leadscore perfilComprador={perfilComprador} />
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
