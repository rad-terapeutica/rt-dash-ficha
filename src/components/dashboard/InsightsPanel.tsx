import { Lightbulb, TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import type { KpiPorTag } from "@/services/kpiPesquisa";
import type { FunilTag } from "@/services/funilTurma";
import type { PerfilScope } from "@/services/distribuicaoComprador";
import { computeLeadscoreBanco } from "@/data/leadscoreBanco";
import { motion } from "framer-motion";

interface InsightsPanelProps {
  kpiPorTag: KpiPorTag[]; // banco — adesão por turma (oficial)
  funilPorTag: FunilTag[]; // banco — conversão de compra por turma (oficial)
  perfilComprador: PerfilScope | null; // banco — perfil por comprador (escopo selecionado)
}

const InsightsPanel = ({ kpiPorTag, funilPorTag, perfilComprador }: InsightsPanelProps) => {
  if (kpiPorTag.length === 0) {
    return (
      <div className="dashboard-card h-full">
        <h3 className="section-title mb-1">Leituras Rápidas</h3>
        <p className="section-subtitle">Dados insuficientes para gerar insights</p>
      </div>
    );
  }

  // Adesão à pesquisa: oficial do banco (vw_pesquisa_por_tag)
  const adesaoBest = kpiPorTag.reduce((b, s) => (s.conversaoPesquisaPct > b.conversaoPesquisaPct ? s : b));
  const adesaoAvg = kpiPorTag.reduce((s, t) => s + t.conversaoPesquisaPct, 0) / kpiPorTag.length;

  // Melhor conversão para COMU RT: oficial do banco (vw_funil_turma)
  const compraBest = funilPorTag.length
    ? funilPorTag.reduce((b, s) => (s.conversaoCompraPct > b.conversaoCompraPct ? s : b))
    : null;

  // Sinais de compra: oficial do banco (vw_ficha_distribuicao_por_comprador)
  const semCompradores = !perfilComprador || perfilComprador.totalCompradores === 0;
  const signals = perfilComprador ? computeLeadscoreBanco(perfilComprador).signals : [];
  const strongest = (field: string) =>
    signals.filter((s) => s.field === field && s.lift > 0).sort((a, b) => b.lift - a.lift)[0] ?? null;
  const investSignal = strongest("quantoInvestiu");
  const dispostoSignal = strongest("dispostoinvestir");

  const sinalTexto = (sig: { value: string; lift: number } | null) =>
    semCompradores
      ? "Sem compradores nesta turma ainda"
      : sig
      ? `"${sig.value}" aparece +${sig.lift.toFixed(0)}% a mais entre compradores Comu RT`
      : "Sem sinal significativo";

  const insights = [
    {
      icon: TrendingUp,
      color: "hsl(var(--chart-2))",
      title: "Maior adesão à pesquisa",
      text: `Turma ${adesaoBest.turmaNome.replace("Desafio - ", "")} com ${adesaoBest.conversaoPesquisaPct.toFixed(1)}% de preenchimento`,
    },
    {
      icon: Target,
      color: "hsl(var(--chart-4))",
      title: "Melhor conversão para Comu RT",
      text: compraBest
        ? `Turma ${compraBest.turmaNome.replace("Desafio - ", "")} com ${compraBest.conversaoCompraPct.toFixed(1)}% de compra`
        : "Dados insuficientes",
    },
    {
      icon: BarChart3,
      color: "hsl(var(--chart-3))",
      title: "Adesão média entre turmas",
      text: `${adesaoAvg.toFixed(1)}% dos leads responderam a ficha de interesse`,
    },
    {
      icon: Zap,
      color: "hsl(var(--success))",
      title: "Sinal mais forte — investimento",
      text: sinalTexto(investSignal),
    },
    {
      icon: Lightbulb,
      color: "hsl(var(--primary))",
      title: "Sinal mais forte — disposição",
      text: sinalTexto(dispostoSignal),
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
