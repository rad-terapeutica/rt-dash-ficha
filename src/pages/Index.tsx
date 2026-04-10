import { useState, useMemo } from "react";
import { useSheetData } from "@/hooks/useSheetData";
import { getGlobalStats, getTurmaList } from "@/data/dataProcessor";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICards from "@/components/dashboard/KPICards";
import FunnelChart from "@/components/dashboard/FunnelChart";
import TurmaComparison from "@/components/dashboard/TurmaComparison";
import ResponseDistribution from "@/components/dashboard/ResponseDistribution";
import RespondentesVsCRT from "@/components/dashboard/RespondentesVsCRT";
import DetailTable from "@/components/dashboard/DetailTable";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";

const Index = () => {
  const { people, loading, error } = useSheetData();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [statusResposta, setStatusResposta] = useState("all");
  const [statusCRT, setStatusCRT] = useState("all");
  const [search, setSearch] = useState("");

  const turmaList = useMemo(() => getTurmaList(people), [people]);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (turmaFilter !== "all" && p.turma !== turmaFilter) return false;
      if (statusResposta === "sim" && !p.respondeuPesquisa) return false;
      if (statusResposta === "nao" && p.respondeuPesquisa) return false;
      if (statusCRT === "sim" && !p.virouCRT) return false;
      if (statusCRT === "nao" && p.virouCRT) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.nome.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [people, turmaFilter, statusResposta, statusCRT, search]);

  const stats = useMemo(() => getGlobalStats(filtered), [filtered]);

  const clearFilters = () => {
    setTurmaFilter("all");
    setStatusResposta("all");
    setStatusCRT("all");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <div>
            <p className="text-lg font-semibold text-foreground">Carregando dados reais...</p>
            <p className="text-sm text-muted-foreground">Lendo planilhas do Google Sheets</p>
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
            <p className="text-lg font-semibold text-foreground">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 shadow-[var(--glow-primary)]">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Ficha de Interesse <span className="text-primary">×</span> Desafio <span className="text-primary">×</span> COMU RT
              </h1>
              <p className="text-xs text-muted-foreground">
                Turma do Desafio → Respondeu Pesquisa → CRT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              {filtered.length.toLocaleString("pt-BR")} registros
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Dados reais carregados" />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <FilterBar
          turmaFilter={turmaFilter}
          statusResposta={statusResposta}
          statusCRT={statusCRT}
          search={search}
          turmaList={turmaList}
          onTurmaChange={setTurmaFilter}
          onStatusRespostaChange={setStatusResposta}
          onStatusCRTChange={setStatusCRT}
          onSearchChange={setSearch}
          onClear={clearFilters}
        />

        <KPICards {...stats} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <FunnelChart total={stats.total} respondentes={stats.respondentes} crt={stats.crt} />
          </div>
          <div className="lg:col-span-2">
            <InsightsPanel people={filtered} />
          </div>
        </div>

        <TurmaComparison people={filtered} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponseDistribution people={filtered} />
          <RespondentesVsCRT people={filtered} />
        </div>

        <DetailTable people={filtered} />
      </main>
    </div>
  );
};

export default Index;
