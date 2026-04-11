import { useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  getSurveyDistribution,
  getAreaDistribution,
  type Person,
} from "@/data/dataProcessor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { CrossFilter } from "@/pages/Index";

const COLORS = [
  "hsl(165 70% 46%)",
  "hsl(210 100% 62%)",
  "hsl(280 60% 58%)",
  "hsl(38 95% 55%)",
  "hsl(0 72% 55%)",
  "hsl(190 80% 50%)",
  "hsl(330 65% 55%)",
];

type SurveyFieldKey =
  | "areasMain"
  | "tentouOutraTerapia"
  | "quantoInvestiu"
  | "interesseTratarOutros"
  | "dispostoinvestir";

interface ThemePairsProps {
  people: Person[];
  crossFilter: CrossFilter | null;
  onCrossFilter: (filter: CrossFilter | null) => void;
}

interface ThemeConfig {
  key: SurveyFieldKey | "areas";
  surveyKey: SurveyFieldKey;
  title: string;
  profileDesc: string;
  isArea?: boolean;
}

const themes: ThemeConfig[] = [
  {
    key: "dispostoinvestir",
    surveyKey: "dispostoinvestir",
    title: "Disposição para Investir",
    profileDesc: "Interesse em investir R$ 3.995 na Comu RT",
  },
  {
    key: "quantoInvestiu",
    surveyKey: "quantoInvestiu",
    title: "Quanto Já Investiu",
    profileDesc: "Valor investido anteriormente em terapias",
  },
  {
    key: "areas",
    surveyKey: "areasMain",
    title: "Áreas de Tratamento",
    profileDesc: "Áreas da vida que deseja tratar com Radiestesia",
    isArea: true,
  },
  {
    key: "tentouOutraTerapia",
    surveyKey: "tentouOutraTerapia",
    title: "Experiência com Terapias",
    profileDesc: "Se já tentou tratar com outra terapia holística",
  },
  {
    key: "interesseTratarOutros",
    surveyKey: "interesseTratarOutros",
    title: "Interesse em Tratar Outros",
    profileDesc: "Intenção de aplicar Radiestesia em outras pessoas",
  },
];

const ThemePairs = ({ people, crossFilter, onCrossFilter }: ThemePairsProps) => {
  const [onlyRT, setOnlyRT] = useState(false);
  const profileFiltered = onlyRT
    ? people.filter((p) => p.virouCRT)
    : people.filter((p) => p.respondeuPesquisa);
  const respondentes = people.filter((p) => p.respondeuPesquisa);
  const rtPeople = people.filter((p) => p.virouCRT);

  const handleSliceClick = useCallback(
    (theme: ThemeConfig, value: string) => {
      onCrossFilter({
        themeTitle: theme.title,
        themeKey: theme.key,
        value,
      });
    },
    [onCrossFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Mapa de Perfil e Comparativo
          </h2>
          <p className="text-sm text-muted-foreground">
            Distribuição das respostas e comparação entre Pesquisa e Comu RT,
            organizadas por tema
            <span className="ml-2 text-muted-foreground/50">
              — clique em uma categoria para filtrar a dashboard
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
          <Switch
            id="rt-global"
            checked={onlyRT}
            onCheckedChange={setOnlyRT}
          />
          <Label
            htmlFor="rt-global"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Perfil: somente Comu RT
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        {themes.map((theme) => (
          <div key={theme.key} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProfileCard
              theme={theme}
              people={profileFiltered}
              crossFilter={crossFilter}
              onSliceClick={(value) => handleSliceClick(theme, value)}
            />
            <CompareCard
              theme={theme}
              respondentes={respondentes}
              rtPeople={rtPeople}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Profile Card (donut + bars) ─── */

function ProfileCard({
  theme,
  people,
  crossFilter,
  onSliceClick,
}: {
  theme: ThemeConfig;
  people: Person[];
  crossFilter: CrossFilter | null;
  onSliceClick: (value: string) => void;
}) {
  const data = theme.isArea
    ? getAreaDistribution(people)
    : getSurveyDistribution(people, theme.surveyKey);
  const total = data.reduce((s, d) => s + d.total, 0);
  const sliced = data.slice(0, 7);
  const maxVal = sliced.length > 0 ? sliced[0].total : 1;

  const isThisThemeActive = crossFilter?.themeKey === theme.key;
  const activeValue = isThisThemeActive ? crossFilter.value : null;

  return (
    <div
      className={`dashboard-card transition-all duration-300 ${
        isThisThemeActive
          ? "ring-1 ring-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="text-sm font-semibold text-foreground">
          {theme.title}
        </h3>
        <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider bg-primary/8 px-1.5 py-0.5 rounded">
          Distribuição
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/60 mb-5">
        {theme.profileDesc}
      </p>

      <div className="grid grid-cols-[160px_1fr] gap-6 items-start">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sliced}
                dataKey="total"
                nameKey="value"
                cx="50%"
                cy="50%"
                outerRadius={72}
                innerRadius={42}
                paddingAngle={2}
                strokeWidth={0}
                style={{ cursor: "pointer" }}
                onClick={(_, index) => {
                  if (sliced[index]) onSliceClick(sliced[index].value);
                }}
              >
                {sliced.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={activeValue && activeValue !== entry.value ? 0.25 : 1}
                    stroke={activeValue === entry.value ? "hsl(var(--primary))" : "none"}
                    strokeWidth={activeValue === entry.value ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,18%)] rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-xs text-muted-foreground mb-0.5 max-w-[180px]">
                        {d.value}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {d.total.toLocaleString("pt-BR")}{" "}
                        <span className="text-muted-foreground font-normal">
                          (
                          {total > 0
                            ? ((d.total / total) * 100).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Clique para filtrar
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 pt-1">
          {sliced.map((d, i) => {
            const pct = total > 0 ? (d.total / total) * 100 : 0;
            const barWidth = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            const color = COLORS[i % COLORS.length];
            const isActive = activeValue === d.value;
            const isDimmed = activeValue && !isActive;

            return (
              <div
                key={d.value}
                className={`cursor-pointer rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-muted/40"
                } ${isDimmed ? "opacity-35" : ""}`}
                onClick={() => onSliceClick(d.value)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-foreground truncate">
                      {d.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {d.total.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[hsl(225,15%,12%)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Compare Card (Pesquisa vs Comu RT) ─── */

function CompareCard({
  theme,
  respondentes,
  rtPeople,
}: {
  theme: ThemeConfig;
  respondentes: Person[];
  rtPeople: Person[];
}) {
  const allDist = getSurveyDistribution(respondentes, theme.surveyKey);
  const rtDist = getSurveyDistribution(rtPeople, theme.surveyKey);
  const totalAll = allDist.reduce((s, d) => s + d.total, 0);
  const totalRt = rtDist.reduce((s, d) => s + d.total, 0);

  const merged = allDist.map((a) => {
    const c = rtDist.find((d) => d.value === a.value);
    const pctAll = totalAll > 0 ? (a.total / totalAll) * 100 : 0;
    const pctRt = totalRt > 0 && c ? (c.total / totalRt) * 100 : 0;
    const lift = pctAll > 0 ? ((pctRt - pctAll) / pctAll) * 100 : 0;
    return { value: a.value, pctAll, pctRt, lift };
  });

  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="text-sm font-semibold text-foreground">
          {theme.title}
        </h3>
        <span className="text-[10px] font-medium text-[hsl(38,95%,55%)]/80 uppercase tracking-wider bg-[hsl(38,95%,55%)]/8 px-1.5 py-0.5 rounded">
          Comparativo
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/60 mb-5">
        Pesquisa vs Comu RT — variação de perfil
      </p>

      {/* Header */}
      <div className="grid grid-cols-[1fr_60px_60px_68px] items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Categoria</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Pesquisa</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Comu RT</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Variação</span>
      </div>

      {/* Rows */}
      <div className="space-y-0">
        {merged.slice(0, 5).map((m) => (
          <div
            key={m.value}
            className="grid grid-cols-[1fr_60px_60px_68px] items-center gap-2 py-2.5 border-b border-border/20 last:border-0"
          >
            <span className="text-xs text-muted-foreground truncate">
              {m.value}
            </span>
            <span className="text-right text-xs font-mono text-foreground/60">
              {m.pctAll.toFixed(1)}%
            </span>
            <span className="text-right text-xs font-mono font-bold text-foreground">
              {m.pctRt.toFixed(1)}%
            </span>
            <div className="flex items-center justify-end gap-1">
              {m.lift > 5 ? (
                <ArrowUpRight className="w-3 h-3 text-success" />
              ) : m.lift < -5 ? (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
              <span
                className={`font-mono text-xs ${
                  m.lift > 5
                    ? "text-success"
                    : m.lift < -5
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {m.lift > 0 ? "+" : ""}
                {m.lift.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThemePairs;
