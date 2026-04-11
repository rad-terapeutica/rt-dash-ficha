import { ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import type { Signal } from "@/data/leadscoreProcessor";

const SignalRanking = ({ signals }: { signals: Signal[] }) => {
  // Show top signals sorted by absolute lift, include both positive and negative
  const positive = signals.filter((s) => s.lift > 5).sort((a, b) => b.lift - a.lift);
  const negative = signals.filter((s) => s.lift < -5).sort((a, b) => a.lift - b.lift);

  const maxAbsLift = Math.max(
    ...signals.map((s) => Math.abs(s.lift)),
    1
  );

  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-[hsl(38_95%_55%/0.12)]">
          <Zap className="w-5 h-5 text-[hsl(38,95%,55%)]" />
        </div>
        <div>
          <h3 className="section-title">Ranking de Sinais</h3>
          <p className="section-subtitle">
            Respostas da ficha que mais se associam — positiva ou negativamente — à compra da Comu RT.
            Score empírico baseado na correlação observada na base.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        {/* Positive signals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-4 h-4 text-[hsl(165,70%,46%)]" />
            <span className="text-xs font-semibold text-[hsl(165,70%,46%)] uppercase tracking-wider">
              Sinais que aumentam propensão
            </span>
          </div>
          <div className="space-y-1">
            {positive.slice(0, 10).map((s) => (
              <SignalRow key={`${s.field}-${s.value}`} signal={s} maxAbsLift={maxAbsLift} />
            ))}
            {positive.length === 0 && (
              <p className="text-xs text-muted-foreground/40 py-4 text-center">
                Nenhum sinal positivo significativo
              </p>
            )}
          </div>
        </div>

        {/* Negative signals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Sinais que reduzem propensão
            </span>
          </div>
          <div className="space-y-1">
            {negative.slice(0, 10).map((s) => (
              <SignalRow key={`${s.field}-${s.value}`} signal={s} maxAbsLift={maxAbsLift} />
            ))}
            {negative.length === 0 && (
              <p className="text-xs text-muted-foreground/40 py-4 text-center">
                Nenhum sinal negativo significativo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function SignalRow({ signal: s, maxAbsLift }: { signal: Signal; maxAbsLift: number }) {
  const isPositive = s.lift > 0;
  const barWidth = Math.min((Math.abs(s.lift) / maxAbsLift) * 100, 100);
  const color = isPositive ? "hsl(165 70% 46%)" : "hsl(0 72% 55%)";

  return (
    <div className="rounded-lg px-3 py-2.5 bg-[hsl(225,20%,7%)] border border-border/20 hover:border-border/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            {s.fieldLabel}
          </span>
          <p className="text-xs font-medium text-foreground truncate mt-0.5">
            {s.value}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span
            className="text-sm font-bold font-mono"
            style={{ color }}
          >
            {s.lift > 0 ? "+" : ""}{s.lift.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-[hsl(225,15%,12%)] rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}30`,
          }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/50">
        <span>
          Compradores: <span className="text-foreground/70">{s.pctBuyers.toFixed(1)}%</span>
        </span>
        <span>
          Não compradores: <span className="text-foreground/70">{s.pctNonBuyers.toFixed(1)}%</span>
        </span>
      </div>
    </div>
  );
}

export default SignalRanking;
