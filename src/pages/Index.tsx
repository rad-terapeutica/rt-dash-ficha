import { useState, useMemo } from "react";
import { mockPeople, getGlobalStats } from "@/data/mockData";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICards from "@/components/dashboard/KPICards";
import FunnelChart from "@/components/dashboard/FunnelChart";
import TurmaComparison from "@/components/dashboard/TurmaComparison";
import ResponseDistribution from "@/components/dashboard/ResponseDistribution";
import RespondentesVsCRT from "@/components/dashboard/RespondentesVsCRT";
import DetailTable from "@/components/dashboard/DetailTable";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [statusResposta, setStatusResposta] = useState("all");
  const [statusCRT, setStatusCRT] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockPeople.filter((p) => {
      if (turmaFilter !== "all" && p.turma !== turmaFilter) return false;
      if (statusResposta === "sim" && !p.respondeuPesquisa) return false;
      if (statusResposta === "nao" && p.respondeuPesquisa) return false;
      if (statusCRT === "sim" && !p.virouCRT) return false;
      if (statusCRT === "nao" && p.virouCRT) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [turmaFilter, statusResposta, statusCRT, search]);

  const stats = useMemo(() => getGlobalStats(filtered), [filtered]);

  const clearFilters = () => {
    setTurmaFilter("all");
    setStatusResposta("all");
    setStatusCRT("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Ficha de Interesse × Desafio × COMU RT</h1>
              <p className="text-xs text-muted-foreground">Dashboard analítico de jornada e conversão</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {filtered.length} registros
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <FilterBar
          turmaFilter={turmaFilter}
          statusResposta={statusResposta}
          statusCRT={statusCRT}
          search={search}
          onTurmaChange={setTurmaFilter}
          onStatusRespostaChange={setStatusResposta}
          onStatusCRTChange={setStatusCRT}
          onSearchChange={setSearch}
          onClear={clearFilters}
        />

        {/* KPIs */}
        <KPICards {...stats} />

        {/* Funnel + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <FunnelChart total={stats.total} respondentes={stats.respondentes} crt={stats.crt} />
          </div>
          <div className="lg:col-span-2">
            <InsightsPanel people={filtered} />
          </div>
        </div>

        {/* Turma Comparison */}
        <TurmaComparison people={filtered} />

        {/* Responses + CRT Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponseDistribution people={filtered} />
          <RespondentesVsCRT people={filtered} />
        </div>

        {/* Detail Table */}
        <DetailTable people={filtered} />
      </main>
    </div>
  );
};

export default Index;
