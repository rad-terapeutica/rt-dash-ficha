import { Users, FileCheck, TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardsProps {
  total: number;
  respondentes: number;
  crt: number;
  pctRespondentes: number;
  pctCrtRespondentes: number;
  pctCrtTotal: number;
  compraAprovada: number;
}

const kpis: Array<{ key: keyof KPICardsProps; label: string; icon: typeof Users; color: string; suffix?: string }> = [
  { key: "total", label: "Total da Turma", icon: Users, color: "hsl(var(--chart-2))" },
  { key: "respondentes", label: "Respondentes", icon: FileCheck, color: "hsl(var(--chart-3))" },
  { key: "pctRespondentes", label: "% Respondentes", icon: TrendingUp, color: "hsl(var(--primary))", suffix: "%" },
  { key: "crt", label: "Total CRT", icon: Award, color: "hsl(var(--chart-4))" },
  { key: "pctCrtRespondentes", label: "% CRT / Respond.", icon: Target, color: "hsl(var(--success))", suffix: "%" },
  { key: "pctCrtTotal", label: "% CRT / Total", icon: BarChart3, color: "hsl(var(--info))", suffix: "%" },
];

const KPICards = (props: KPICardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const value = props[kpi.key];
        const formatted = kpi.suffix ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString("pt-BR");

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="stat-value" style={{ color: kpi.color }}>{formatted}</div>
            <div className="stat-label mt-1">{kpi.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
