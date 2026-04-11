import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  getSurveyDistribution,
  getAreaDistribution,
  type Person,
} from "@/data/dataProcessor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COLORS = [
  "hsl(165 70% 46%)",
  "hsl(210 100% 62%)",
  "hsl(280 60% 58%)",
  "hsl(38 95% 55%)",
  "hsl(0 72% 55%)",
  "hsl(190 80% 50%)",
  "hsl(330 65% 55%)",
];

interface ProfileGridProps {
  people: Person[];
}

interface BlockConfig {
  key: string;
  title: string;
  desc: string;
  getData: (
    people: Person[]
  ) => { value: string; total: number; crt: number }[];
}

const blocks: BlockConfig[] = [
  {
    key: "dispostoinvestir",
    title: "Disposição para Investir",
    desc: "Interesse em investir R$ 3.995 na Comu RT",
    getData: (p) => getSurveyDistribution(p, "dispostoinvestir"),
  },
  {
    key: "quantoInvestiu",
    title: "Quanto Já Investiu",
    desc: "Valor investido anteriormente em terapias",
    getData: (p) => getSurveyDistribution(p, "quantoInvestiu"),
  },
  {
    key: "areas",
    title: "Áreas de Tratamento",
    desc: "Áreas da vida que deseja tratar com Radiestesia",
    getData: (p) => getAreaDistribution(p),
  },
  {
    key: "tentouOutraTerapia",
    title: "Experiência com Terapias",
    desc: "Se já tentou tratar com outra terapia holística",
    getData: (p) => getSurveyDistribution(p, "tentouOutraTerapia"),
  },
  {
    key: "interesseTratarOutros",
    title: "Interesse em Tratar Outros",
    desc: "Intenção de aplicar Radiestesia em outras pessoas",
    getData: (p) => getSurveyDistribution(p, "interesseTratarOutros"),
  },
];

const ProfileGrid = ({ people }: ProfileGridProps) => {
  const [onlyRT, setOnlyRT] = useState(false);
  const filtered = onlyRT
    ? people.filter((p) => p.virouCRT)
    : people.filter((p) => p.respondeuPesquisa);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Mapa de Perfil
          </h2>
          <p className="text-sm text-muted-foreground">
            Recortes analíticos das respostas da ficha de interesse
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
            Somente Comu RT
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {blocks.map((block) => (
          <ProfileBlock key={block.key} block={block} people={filtered} />
        ))}
      </div>
    </div>
  );
};

function ProfileBlock({
  block,
  people,
}: {
  block: BlockConfig;
  people: Person[];
}) {
  const data = block.getData(people);
  const total = data.reduce((s, d) => s + d.total, 0);
  const sliced = data.slice(0, 7);
  const maxVal = sliced.length > 0 ? sliced[0].total : 1;

  return (
    <div className="dashboard-card">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">
        {block.title}
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-5">{block.desc}</p>

      <div className="grid grid-cols-[160px_1fr] gap-6 items-start">
        {/* Donut */}
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
              >
                {sliced.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking with bars */}
        <div className="space-y-3 pt-1">
          {sliced.map((d, i) => {
            const pct = total > 0 ? (d.total / total) * 100 : 0;
            const barWidth = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            const color = COLORS[i % COLORS.length];

            return (
              <div key={d.value}>
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

export default ProfileGrid;
