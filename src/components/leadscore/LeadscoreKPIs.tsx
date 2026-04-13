import { Users, ShoppingCart, TrendingUp, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import type { LeadscoreKPIs as KPIData } from "@/data/leadscoreProcessor";

const LeadscoreKPICards = ({ data }: { data: KPIData }) => {
  const cards = [
    {
      label: "Respondentes Analisados",
      desc: "Leads da turma que preencheram a ficha de interesse",
      value: data.respondentes.toLocaleString("pt-BR"),
      icon: Users,
      color: "hsl(210 100% 62%)",
    },
    {
      label: "Compradores c/ Pesquisa",
      desc: "Compradores da Comu RT que também responderam a ficha",
      value: data.compradores.toLocaleString("pt-BR"),
      icon: ShoppingCart,
      color: "hsl(165 70% 46%)",
    },
    {
      label: "Conversão na Base Pesquisada",
      desc: "% dos respondentes da ficha que compraram a Comu RT",
      value: `${data.taxaConversao.toFixed(1)}%`,
      icon: TrendingUp,
      color: "hsl(var(--primary))",
    },
    {
      label: "Score Médio",
      desc: "Propensão média de compra observada entre os respondentes",
      value: data.scoreMedia.toFixed(0),
      icon: Gauge,
      color: "hsl(38 95% 55%)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="stat-value" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="stat-label mt-1">{card.label}</div>
            <div className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight">
              {card.desc}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeadscoreKPICards;
