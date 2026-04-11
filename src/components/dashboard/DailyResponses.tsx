import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDailyResponses, type Person } from "@/data/dataProcessor";
import { CalendarDays, TrendingUp, Trophy, Hash, Filter, FileSpreadsheet, UserCheck, AlertTriangle } from "lucide-react";

interface DailyResponsesProps {
  people: Person[];
  turmaFilter: string;
  rawSurveyCount: number;
  identifiedCount: number;
}

const CoverageBar = ({ rawSurveyCount, identifiedCount }: { rawSurveyCount: number; identifiedCount: number }) => {
  const gap = rawSurveyCount - identifiedCount;
  const gapPct = rawSurveyCount > 0 ? (gap / rawSurveyCount) * 100 : 0;

  return (
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

        {/* Gap */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[hsl(38,95%,55%)]" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Fora da Base
            </span>
          </div>
          <div className="text-xl font-extrabold tracking-tight text-[hsl(38,95%,55%)]">
            {gap.toLocaleString("pt-BR")}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground/60">
            {gapPct.toFixed(1)}%
          </div>
        </div>
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
        Respostas da ficha cujo email não consta na base da turma ficam fora do recorte da dashboard
      </p>
    </div>
  );
};

const DailyResponses = ({ people, turmaFilter, rawSurveyCount, identifiedCount }: DailyResponsesProps) => {
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

        <CoverageBar rawSurveyCount={rawSurveyCount} identifiedCount={identifiedCount} />

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

      <CoverageBar rawSurveyCount={rawSurveyCount} identifiedCount={identifiedCount} />

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
