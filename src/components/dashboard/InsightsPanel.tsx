import { Lightbulb, TrendingUp, Target, BarChart3, Users } from "lucide-react";
import { getTurmaStats, getSurveyDistribution, type Person } from "@/data/dataProcessor";
import { motion } from "framer-motion";

interface InsightsPanelProps {
  people: Person[];
}

const InsightsPanel = ({ people }: InsightsPanelProps) => {
  const stats = getTurmaStats(people);
  const crtPeople = people.filter(p => p.virouCRT);

  if (stats.length === 0) {
    return (
      <div className="dashboard-card h-full">
        <h3 className="section-title mb-1">Leituras Rápidas</h3>
        <p className="section-subtitle">Dados insuficientes para gerar insights</p>
      </div>
    );
  }

  const bestRespTurma = stats.reduce((best, s) => s.pctResp > best.pctResp ? s : best, stats[0]);
  const bestCrtTurma = stats.reduce((best, s) => s.pctCrt > best.pctCrt ? s : best, stats[0]);
  const avgResp = stats.reduce((s, t) => s + t.pctResp, 0) / stats.length;

  const topInvestimento = getSurveyDistribution(crtPeople, "quantoInvestiu")[0];
  const topInteresse = getSurveyDistribution(crtPeople, "interesseTratarOutros")[0];

  const insights = [
    {
      icon: TrendingUp,
      color: "hsl(var(--chart-2))",
      title: "Maior adesão à pesquisa",
      text: `Turma ${bestRespTurma.turma.replace("Desafio - ", "")} com ${bestRespTurma.pctResp.toFixed(1)}% de preenchimento`,
    },
    {
      icon: Target,
      color: "hsl(var(--chart-4))",
      title: "Melhor conversão para Comu RT",
      text: `Turma ${bestCrtTurma.turma.replace("Desafio - ", "")} com ${bestCrtTurma.pctCrt.toFixed(1)}% de avanço`,
    },
    {
      icon: BarChart3,
      color: "hsl(var(--chart-3))",
      title: "Adesão média entre turmas",
      text: `${avgResp.toFixed(1)}% dos contatos responderam a ficha de interesse`,
    },
    {
      icon: Users,
      color: "hsl(var(--success))",
      title: "Investimento predominante na Comu RT",
      text: topInvestimento ? `"${topInvestimento.value}" — ${((topInvestimento.total / crtPeople.length) * 100).toFixed(0)}% dos membros` : "Dados insuficientes",
    },
    {
      icon: Lightbulb,
      color: "hsl(var(--primary))",
      title: "Interesse em tratar outras pessoas",
      text: topInteresse ? `"${topInteresse.value}" — ${((topInteresse.total / crtPeople.length) * 100).toFixed(0)}% dos membros da Comu RT` : "Dados insuficientes",
    },
  ];

  return (
    <div className="dashboard-card h-full">
      <h3 className="section-title mb-1">Leituras Rápidas</h3>
      <p className="section-subtitle mb-6">Destaques sobre adesão, conversão e comportamento da turma</p>

      <div className="grid gap-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
            >
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${insight.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: insight.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold">{insight.title}</div>
                <div className="text-sm text-muted-foreground">{insight.text}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
