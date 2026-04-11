import { Lightbulb, TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import { getTurmaStats, getSurveyDistribution, type Person } from "@/data/dataProcessor";
import { motion } from "framer-motion";

interface InsightsPanelProps {
  people: Person[];
}

/** Compute the response with the highest lift (most over-represented among buyers) */
function getStrongestSignal(
  buyers: Person[],
  nonBuyers: Person[],
  field: "quantoInvestiu" | "interesseTratarOutros" | "dispostoinvestir" | "tentouOutraTerapia"
): { value: string; pctBuyers: number; lift: number } | null {
  const bDist = new Map<string, number>();
  const nDist = new Map<string, number>();

  for (const p of buyers) {
    const v = p.survey?.[field];
    if (v) bDist.set(v, (bDist.get(v) || 0) + 1);
  }
  for (const p of nonBuyers) {
    const v = p.survey?.[field];
    if (v) nDist.set(v, (nDist.get(v) || 0) + 1);
  }

  let best: { value: string; pctBuyers: number; lift: number } | null = null;

  for (const [value, bc] of bDist) {
    const nc = nDist.get(value) || 0;
    const pctB = (bc / buyers.length) * 100;
    const pctN = nonBuyers.length > 0 ? (nc / nonBuyers.length) * 100 : 0;
    const lift = pctN > 0 ? ((pctB - pctN) / pctN) * 100 : 0;

    if (!best || lift > best.lift) {
      best = { value, pctBuyers: pctB, lift };
    }
  }

  return best;
}

const InsightsPanel = ({ people }: InsightsPanelProps) => {
  const stats = getTurmaStats(people);
  const buyers = people.filter((p) => p.virouCRT);
  const nonBuyers = people.filter((p) => p.respondeuPesquisa && !p.virouCRT);

  if (stats.length === 0) {
    return (
      <div className="dashboard-card h-full">
        <h3 className="section-title mb-1">Leituras Rápidas</h3>
        <p className="section-subtitle">Dados insuficientes para gerar insights</p>
      </div>
    );
  }

  const bestRespTurma = stats.reduce((best, s) => (s.pctResp > best.pctResp ? s : best), stats[0]);
  const bestCrtTurma = stats.reduce((best, s) => (s.pctCrt > best.pctCrt ? s : best), stats[0]);
  const avgResp = stats.reduce((s, t) => s + t.pctResp, 0) / stats.length;

  const investSignal = getStrongestSignal(buyers, nonBuyers, "quantoInvestiu");
  const interesseSignal = getStrongestSignal(buyers, nonBuyers, "interesseTratarOutros");
  const dispostoSignal = getStrongestSignal(buyers, nonBuyers, "dispostoinvestir");

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
      icon: Zap,
      color: "hsl(var(--success))",
      title: "Sinal mais forte — investimento",
      text: investSignal
        ? `"${investSignal.value}" aparece +${investSignal.lift.toFixed(0)}% a mais entre compradores Comu RT`
        : "Dados insuficientes",
    },
    {
      icon: Lightbulb,
      color: "hsl(var(--primary))",
      title: "Sinal mais forte — disposição",
      text: dispostoSignal
        ? `"${dispostoSignal.value}" aparece +${dispostoSignal.lift.toFixed(0)}% a mais entre compradores Comu RT`
        : "Dados insuficientes",
    },
  ];

  return (
    <div className="dashboard-card h-full">
      <h3 className="section-title mb-1">Leituras Rápidas</h3>
      <p className="section-subtitle mb-6">
        Destaques de adesão, conversão e sinais de propensão à compra da Comu RT
      </p>

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
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${insight.color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: insight.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold">{insight.title}</div>
                <div className="text-sm text-muted-foreground">
                  {insight.text}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
