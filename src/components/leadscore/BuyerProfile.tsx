import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { ProfileComparison } from "@/data/leadscoreProcessor";

const COLORS = [
  "hsl(165 70% 46%)",
  "hsl(210 100% 62%)",
  "hsl(280 60% 58%)",
  "hsl(38 95% 55%)",
  "hsl(0 72% 55%)",
  "hsl(190 80% 50%)",
  "hsl(330 65% 55%)",
];

const BuyerProfile = ({ profiles }: { profiles: ProfileComparison[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Perfil: Compradores vs Não Compradores
          </h2>
          <p className="text-sm text-muted-foreground">
            Comparação direta das respostas entre quem comprou a Comu RT e quem não comprou
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <ProfileCard key={profile.fieldLabel} profile={profile} />
        ))}
      </div>
    </div>
  );
};

function ProfileCard({ profile }: { profile: ProfileComparison }) {
  const sliced = profile.items.slice(0, 6);
  const pieData = sliced.map((item) => ({
    name: item.value,
    value: item.pctBuyers,
  }));

  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="text-sm font-semibold text-foreground">
          {profile.fieldLabel}
        </h3>
      </div>
      <p className="text-[11px] text-muted-foreground/60 mb-5">
        Distribuição entre compradores Comu RT vs não compradores
      </p>

      <div className="flex flex-col items-center sm:grid sm:grid-cols-[140px_1fr] gap-5 sm:items-start">
        {/* Donut — buyer distribution */}
        <div className="h-[140px] w-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={62}
                innerRadius={36}
                paddingAngle={2}
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
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
                        {d.name}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {Number(d.value).toFixed(1)}%
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          dos compradores
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-[9px] text-muted-foreground/40 text-center -mt-1">
            Compradores Comu RT
          </p>
        </div>

        {/* Comparison table */}
        <div className="w-full min-w-0">
          {/* Header */}
          <div className="grid grid-cols-[1fr_50px_50px_56px] sm:grid-cols-[1fr_60px_60px_68px] items-center gap-1.5 sm:gap-2 mb-2 pb-2 border-b border-border/50">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Resposta
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">
              Comp.
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">
              N/Comp.
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">
              Lift
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-0">
            {sliced.map((item, i) => (
              <div
                key={item.value}
                className="grid grid-cols-[1fr_50px_50px_56px] sm:grid-cols-[1fr_60px_60px_68px] items-center gap-1.5 sm:gap-2 py-2 border-b border-border/20 last:border-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
                    {item.value}
                  </span>
                </div>
                <span className="text-right text-[11px] sm:text-xs font-mono font-bold text-foreground">
                  {item.pctBuyers.toFixed(1)}%
                </span>
                <span className="text-right text-[11px] sm:text-xs font-mono text-foreground/50">
                  {item.pctNonBuyers.toFixed(1)}%
                </span>
                <div className="flex items-center justify-end gap-0.5">
                  {item.lift > 5 ? (
                    <ArrowUpRight className="w-3 h-3 text-[hsl(165,70%,46%)]" />
                  ) : item.lift < -5 ? (
                    <ArrowDownRight className="w-3 h-3 text-destructive" />
                  ) : (
                    <Minus className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span
                    className={`font-mono text-[11px] sm:text-xs ${
                      item.lift > 5
                        ? "text-[hsl(165,70%,46%)]"
                        : item.lift < -5
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.lift > 0 ? "+" : ""}
                    {item.lift.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerProfile;
