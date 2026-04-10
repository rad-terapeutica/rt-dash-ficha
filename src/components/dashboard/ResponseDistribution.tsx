import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getResponseDistribution, type Person } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const fields = [
  { key: "motivoPrincipal" as const, label: "Motivo Principal" },
  { key: "momentoAtual" as const, label: "Momento Atual" },
  { key: "intencao" as const, label: "Intenção" },
  { key: "faixa" as const, label: "Faixa de Renda" },
  { key: "perfil" as const, label: "Perfil" },
];

interface ResponseDistributionProps {
  people: Person[];
}

const ResponseDistribution = ({ people }: ResponseDistributionProps) => {
  const [onlyCRT, setOnlyCRT] = useState(false);

  const filtered = onlyCRT ? people.filter((p) => p.virouCRT) : people.filter((p) => p.respondeuPesquisa);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-title">Distribuição das Respostas</h3>
          <p className="section-subtitle">Análise das respostas da ficha de interesse</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="crt-filter" checked={onlyCRT} onCheckedChange={setOnlyCRT} />
          <Label htmlFor="crt-filter" className="text-sm text-muted-foreground cursor-pointer">
            Apenas CRT
          </Label>
        </div>
      </div>

      <Tabs defaultValue="motivoPrincipal">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {fields.map((f) => (
            <TabsTrigger key={f.key} value={f.key} className="text-xs">{f.label}</TabsTrigger>
          ))}
        </TabsList>

        {fields.map((f) => {
          const dist = getResponseDistribution(filtered, f.key);
          const total = dist.reduce((s, d) => s + d.total, 0);

          return (
            <TabsContent key={f.key} value={f.key}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dist}
                        dataKey="total"
                        nameKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {dist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          fontSize: "0.8rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {dist.map((d, i) => (
                    <div key={d.value} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm truncate">{d.value}</span>
                          <span className="text-sm font-mono font-medium ml-2">
                            {d.total} <span className="text-muted-foreground">({total > 0 ? ((d.total / total) * 100).toFixed(1) : 0}%)</span>
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${total > 0 ? (d.total / total) * 100 : 0}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ResponseDistribution;
