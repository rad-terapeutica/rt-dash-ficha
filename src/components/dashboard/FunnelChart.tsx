import { motion } from "framer-motion";
import { ArrowDown, Users, FileCheck, Award } from "lucide-react";

interface FunnelChartProps {
  total: number;
  respondentes: number;
  crt: number;
}

const FunnelChart = ({ total, respondentes, crt }: FunnelChartProps) => {
  const stages = [
    { label: "Turma do Desafio", value: total, icon: Users, color: "hsl(var(--chart-2))", pct: 100 },
    { label: "Respondeu Pesquisa", value: respondentes, icon: FileCheck, color: "hsl(var(--chart-3))", pct: total > 0 ? (respondentes / total) * 100 : 0 },
    { label: "Virou CRT", value: crt, icon: Award, color: "hsl(var(--chart-4))", pct: total > 0 ? (crt / total) * 100 : 0 },
  ];

  const drops = [
    { from: total, to: respondentes },
    { from: respondentes, to: crt },
  ];

  return (
    <div className="dashboard-card">
      <h3 className="section-title mb-1">Funil da Jornada</h3>
      <p className="section-subtitle mb-6">Turma → Pesquisa → CRT</p>

      <div className="flex flex-col items-center gap-2">
        {stages.map((stage, i) => {
          const widthPct = Math.max(30, stage.pct);
          const Icon = stage.icon;

          return (
            <div key={stage.label} className="w-full flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="rounded-xl py-4 px-6 flex items-center justify-between transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: `${stage.color}`,
                  minWidth: "280px",
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                  <span className="font-semibold text-primary-foreground text-sm">{stage.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary-foreground text-lg">{stage.value.toLocaleString("pt-BR")}</span>
                  <span className="text-primary-foreground/70 text-sm font-medium">{stage.pct.toFixed(1)}%</span>
                </div>
              </motion.div>

              {i < drops.length && (
                <div className="flex items-center gap-2 py-1 text-muted-foreground">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {drops[i].from > 0 ? `-${(((drops[i].from - drops[i].to) / drops[i].from) * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelChart;
