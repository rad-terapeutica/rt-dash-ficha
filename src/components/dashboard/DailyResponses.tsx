import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDailyResponses, type Person, type UnmatchedSurvey } from "@/data/dataProcessor";
import { CalendarDays, TrendingUp, Trophy, Hash, Filter, FileSpreadsheet, UserCheck, AlertTriangle, Search, X, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyResponsesProps {
  people: Person[];
  turmaFilter: string;
  rawSurveyCount: number;
  identifiedCount: number;
  unmatchedSurveys: UnmatchedSurvey[];
}

/* ─── Audit Modal ─── */

function AuditModal({
  open,
  onClose,
  unmatchedSurveys,
}: {
  open: boolean;
  onClose: () => void;
  unmatchedSurveys: UnmatchedSurvey[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return unmatchedSurveys;
    const q = search.trim().toLowerCase();
    return unmatchedSurveys.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        s.nome.toLowerCase().includes(q) ||
        s.submittedAt.includes(q)
    );
  }, [unmatchedSurveys, search]);

  // Group by date for display
  const grouped = useMemo(() => {
    const map = new Map<string, UnmatchedSurvey[]>();
    for (const s of filtered) {
      const datePart = s.submittedAt.split(" ")[0] || "(sem data)";
      if (!map.has(datePart)) map.set(datePart, []);
      map.get(datePart)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-[hsl(225,20%,6%)] border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-4 h-4 text-[hsl(38,95%,55%)]" />
            Auditoria — Respostas Fora da Base
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {unmatchedSurveys.length} respostas da ficha cujo email não foi encontrado na base da turma.
            Estes registros não entram no recorte da dashboard.
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por email, nome ou data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-border bg-[hsl(225,20%,8%)] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-[10px] text-muted-foreground/50 mt-1">
          Exibindo {filtered.length} de {unmatchedSurveys.length} registros
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-4 pr-1">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <div className="sticky top-0 z-10 flex items-center gap-2 py-1.5 px-2 rounded-md bg-[hsl(225,20%,9%)] border border-border/40 mb-2">
                <CalendarDays className="w-3 h-3 text-[hsl(38,95%,55%)]" />
                <span className="text-[11px] font-semibold text-foreground/80 font-mono">
                  {date}
                </span>
                <span className="text-[10px] text-muted-foreground/60 ml-auto">
                  {items.length} {items.length === 1 ? "registro" : "registros"}
                </span>
              </div>
              <div className="space-y-1">
                {items.map((s, i) => (
                  <div
                    key={`${s.email}-${i}`}
                    className="grid grid-cols-[1fr_auto] gap-3 items-center px-3 py-2 rounded-lg bg-[hsl(225,20%,7%)] border border-border/20 hover:border-border/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[hsl(38,95%,55%)]/80 truncate">
                        {s.email}
                      </p>
                      {s.nome && (
                        <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                          {s.nome}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/40 whitespace-nowrap">
                      {s.submittedAt.split(" ")[1] || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground/50">
              Nenhum registro encontrado para "{search}"
            </div>
          )}
        </div>

        <div className="pt-3 mt-2 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed">
            A dashboard exibe o recorte identificado na base da turma.
            Respostas fora da base permanecem auditáveis neste painel.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Coverage Bar ─── */

const CoverageBar = ({
  rawSurveyCount,
  identifiedCount,
  unmatchedSurveys,
}: {
  rawSurveyCount: number;
  identifiedCount: number;
  unmatchedSurveys: UnmatchedSurvey[];
}) => {
  const [auditOpen, setAuditOpen] = useState(false);
  const gap = rawSurveyCount - identifiedCount;
  const gapPct = rawSurveyCount > 0 ? (gap / rawSurveyCount) * 100 : 0;

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-[hsl(225,20%,7%)] p-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {/* Total na Ficha */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-foreground/50" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Total na Ficha
              </span>
            </div>
            <div className="text-xl font-extrabold tracking-tight text-foreground">
              {rawSurveyCount.toLocaleString("pt-BR")}
            </div>
          </div>

          {/* Identificados na Base */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[hsl(165,70%,46%)]" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Identificados
              </span>
            </div>
            <div className="text-xl font-extrabold tracking-tight text-[hsl(165,70%,46%)]">
              {identifiedCount.toLocaleString("pt-BR")}
            </div>
          </div>

          {/* Gap — clicável */}
          <button
            onClick={() => setAuditOpen(true)}
            className="text-center group cursor-pointer rounded-lg p-1 -m-1 transition-all hover:bg-[hsl(38,95%,55%/0.06)] hover:ring-1 hover:ring-[hsl(38,95%,55%/0.2)]"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[hsl(38,95%,55%)]" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Fora da Base
              </span>
            </div>
            <div className="text-xl font-extrabold tracking-tight text-[hsl(38,95%,55%)]">
              {gap.toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground/60">
                {gapPct.toFixed(1)}%
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40 group-hover:text-[hsl(38,95%,55%)] transition-colors" />
            </div>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-[hsl(225,15%,12%)] rounded-full overflow-hidden flex">
          <div
            className="h-full rounded-l-full transition-all duration-700"
            style={{
              width: `${rawSurveyCount > 0 ? (identifiedCount / rawSurveyCount) * 100 : 0}%`,
              backgroundColor: "hsl(165 70% 46%)",
            }}
          />
          <div
            className="h-full rounded-r-full transition-all duration-700"
            style={{
              width: `${gapPct}%`,
              backgroundColor: "hsl(38 95% 55% / 0.5)",
            }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-2 text-center leading-relaxed">
          A dashboard exibe o recorte identificado na base da turma · Clique em <span className="text-[hsl(38,95%,55%)]/60">Fora da Base</span> para auditar
        </p>
      </div>

      <AuditModal
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        unmatchedSurveys={unmatchedSurveys}
      />
    </>
  );
};

/* ─── Main Component ─── */

const DailyResponses = ({ people, turmaFilter, rawSurveyCount, identifiedCount, unmatchedSurveys }: DailyResponsesProps) => {
  const { daily, total, bestDay, avgPerDay } = useMemo(
    () => getDailyResponses(people),
    [people]
  );

  const chartData = useMemo(
    () =>
      daily.map((d) => ({
        label: d.date.substring(0, 5),
        full: d.date,
        count: d.count,
      })),
    [daily]
  );

  const isTurmaSelected = turmaFilter !== "all";
  const turmaLabel = isTurmaSelected
    ? turmaFilter.replace("Desafio - ", "")
    : null;

  if (!isTurmaSelected) {
    return (
      <div className="dashboard-card">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-[hsl(210_100%_62%/0.12)]">
            <CalendarDays className="w-5 h-5 text-[hsl(210,100%,62%)]" />
          </div>
          <div>
            <h3 className="section-title">Respostas por Dia</h3>
            <p className="section-subtitle">
              Selecione uma turma para visualizar o ritmo diário de respostas
            </p>
          </div>
        </div>

        <CoverageBar rawSurveyCount={rawSurveyCount} identifiedCount={identifiedCount} unmatchedSurveys={unmatchedSurveys} />

        <div className="flex items-center justify-center gap-4 py-6">
          <div className="p-3 rounded-xl bg-[hsl(210,100%,62%/0.06)] border border-[hsl(210,100%,62%/0.1)]">
            <CalendarDays className="w-6 h-6 text-[hsl(210,100%,62%/0.4)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/70">
              Nenhuma turma selecionada
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escolha uma turma no filtro para ver a evolução diária das respostas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(210_100%_62%/0.12)]">
            <CalendarDays className="w-5 h-5 text-[hsl(210,100%,62%)]" />
          </div>
          <div>
            <h3 className="section-title">Respostas por Dia</h3>
            <p className="section-subtitle">
              Ritmo diário de preenchimento da ficha de interesse na turma selecionada
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(210,100%,62%/0.25)] bg-[hsl(210,100%,62%/0.08)]">
          <Filter className="w-3.5 h-3.5 text-[hsl(210,100%,62%)]" />
          <span className="text-xs font-semibold text-[hsl(210,100%,62%)]">
            {turmaLabel}
          </span>
        </div>
      </div>

      <CoverageBar rawSurveyCount={rawSurveyCount} identifiedCount={identifiedCount} unmatchedSurveys={unmatchedSurveys} />

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-[hsl(225,20%,8%)] px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-[hsl(210,100%,62%)]" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Respostas da turma
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[hsl(210,100%,62%)]">
            {total.toLocaleString("pt-BR")}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-[hsl(225,20%,8%)] px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy className="w-3.5 h-3.5 text-[hsl(38,95%,55%)]" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Melhor dia
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[hsl(38,95%,55%)]">
            {bestDay ? bestDay.count.toLocaleString("pt-BR") : "—"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
            {bestDay ? bestDay.date : ""}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-[hsl(225,20%,8%)] px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[hsl(165,70%,46%)]" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Media/dia
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[hsl(165,70%,46%)]">
            {avgPerDay.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Chart */}
      {daily.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma resposta encontrada para esta turma.
          </p>
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(210 100% 62%)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(210 100% 62%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(225 15% 15%)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(225 15% 15%)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,18%)] rounded-lg px-3.5 py-2.5 shadow-xl">
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        {d.full}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {Number(d.count).toLocaleString("pt-BR")}{" "}
                        <span className="text-muted-foreground font-normal">
                          respostas
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(210 100% 62%)"
                strokeWidth={2}
                fill="url(#dailyGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(210 100% 62%)",
                  stroke: "hsl(225 20% 9%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DailyResponses;
