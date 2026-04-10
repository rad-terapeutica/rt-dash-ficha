import { Lightbulb, TrendingUp, Target, BarChart3, Users } from "lucide-react";
import { getTurmaStats, getResponseDistribution, type Person } from "@/data/mockData";
import { motion } from "framer-motion";

interface InsightsPanelProps {
  people: Person[];
}

const InsightsPanel = ({ people }: InsightsPanelProps) => {
  const stats = getTurmaStats(people);
  const respondentes = people.filter((p) => p.respondeuPesquisa);
  const crtPeople = people.filter((p) => p.virouCRT);

  const bestRespTurma = stats.reduce((best, s) => {
    const pct = s.total > 0 ? (s.respondentes / s.total) * 100 : 0;
    const bestPct = best.total > 0 ? (best.respondentes / best.total) * 100 : 0;
    return pct > bestPct ? s : best;
  }, stats[0]);

  const bestCrtTurma = stats.reduce((best, s) => {
    const pct = s.total > 0 ? (s.crt / s.total) * 100 : 0;
    const bestPct = best.total > 0 ? (best.crt / best.total) * 100 : 0;
    return pct > bestPct ? s : best;
  }, stats[0]);

  const avgResp = stats.length > 0
    ? stats.reduce((s, t) => s + (t.total > 0 ? (t.respondentes / t.total) * 100 : 0), 0) / stats.length
    : 0;

  const topMotivoCrt = getResponseDistribution(crtPeople, "motivoPrincipal")[0];
  const topPerfilCrt = getResponseDistribution(crtPeople, "perfil")[0];

  const insights = [
    {
      icon: TrendingUp,
      color: "hsl(var(--chart-2))",
      title: "Maior taxa de resposta",
      text: `${bestRespTurma?.turma.replace("Desafio - ", "")} com ${bestRespTurma ? ((bestRespTurma.respondentes / bestRespTurma.total) * 100).toFixed(1) : 0}% de adesão à pesquisa`,
    },
    {
      icon: Target,
      color: "hsl(var(--chart-4))",
      title: "Maior conversão CRT",
      text: `${bestCrtTurma?.turma.replace("Desafio - ", "")} com ${bestCrtTurma ? ((bestCrtTurma.crt / bestCrtTurma.total) * 100).toFixed(1) : 0}% de conversão`,
    },
    {
      icon: BarChart3,
      color: "hsl(var(--chart-3))",
      title: "Taxa média de resposta",
      text: `${avgResp.toFixed(1)}% das pessoas nas turmas responderam a pesquisa`,
    },
    {
      icon: Users,
      color: "hsl(var(--success))",
      title: "Perfil CRT mais comum",
      text: topPerfilCrt ? `${topPerfilCrt.value} — presente em ${((topPerfilCrt.total / crtPeople.length) * 100).toFixed(0)}% dos CRT` : "Dados insuficientes",
    },
    {
      icon: Lightbulb,
      color: "hsl(var(--primary))",
      title: "Motivo principal dos CRT",
      text: topMotivoCrt ? `"${topMotivoCrt.value}" é o motivo mais citado entre quem virou CRT` : "Dados insuficientes",
    },
  ];

  return (
    <div className="dashboard-card">
      <h3 className="section-title mb-1">Insights Automáticos</h3>
      <p className="section-subtitle mb-6">Destaques extraídos dos dados</p>

      <div className="grid gap-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
