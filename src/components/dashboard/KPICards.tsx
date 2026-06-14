import { Users, FileCheck, TrendingUp, Award, Target, Database } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardsProps {
  total: number;
  respondentes: number;
  crt: number;
  crtComPesquisa: number;
  pctRespondentes: number;
  pctCrtRespondentes: number;
  pctCrtTotal: number;
  crtFromBanco?: boolean; // COMU RT vindo de raw_comprador (banco)
}

const kpis: Array<{
  key: keyof KPICardsProps;
  label: string;
  desc: string;
  icon: typeof Users;
  color: string;
  suffix?: string;
}> = [
  {
    key: "total",
    label: "Total da Turma",
    desc: "Contatos identificados nesta turma do Desafio",
    icon: Users,
    color: "hsl(var(--chart-2))",
  },
  {
    key: "respondentes",
    label: "Respostas da Pesquisa",
    desc: "Contatos que preencheram a ficha de interesse",
    icon: FileCheck,
    color: "hsl(var(--chart-3))",
  },
  {
    key: "pctRespondentes",
    label: "Adesão à Pesquisa",
    desc: "Percentual da turma que respondeu a ficha",
    icon: TrendingUp,
    color: "hsl(var(--primary))",
    suffix: "%",
  },
  {
    key: "crt",
    label: "Na Comu RT",
    desc: "Compradores da COMU RT (raw_comprador) desta turma",
    icon: Award,
    color: "hsl(var(--chart-4))",
  },
  {
    key: "pctCrtRespondentes",
    label: "Conversão para Comu RT",
    desc: "Percentual dos respondentes que compraram a Comu RT",
    icon: Target,
    color: "hsl(var(--success))",
    suffix: "%",
  },
];

const KPICards = (props: KPICardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const value = props[kpi.key];
        const formatted = kpi.suffix
          ? `${Number(value).toFixed(1)}%`
          : Number(value).toLocaleString("pt-BR");

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className={`kpi-card ${i === kpis.length - 1 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${kpi.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="stat-value" style={{ color: kpi.color }}>
              {formatted}
            </div>
            {kpi.key === "crt" && (
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {props.crtComPesquisa.toLocaleString("pt-BR")} com pesquisa
              </div>
            )}
            <div className="stat-label mt-1 flex items-center gap-1.5">
              {kpi.label}
              {kpi.key === "crt" && props.crtFromBanco && (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-[hsl(var(--chart-4))]/90 bg-[hsl(var(--chart-4))]/10 px-1.5 py-0.5 rounded">
                  <Database className="w-2.5 h-2.5" /> banco
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight">
              {kpi.desc}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
