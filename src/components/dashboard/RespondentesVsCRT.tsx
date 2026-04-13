import {
  getSurveyDistribution,
  getSurveyFields,
  type Person,
} from "@/data/dataProcessor";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface RespondentesVsCRTProps {
  people: Person[];
}

const fieldMeta: Record<string, { title: string; desc: string }> = {
  dispostoinvestir: {
    title: "Disposição para Investir",
    desc: "Pesquisa vs Comu RT",
  },
  quantoInvestiu: {
    title: "Quanto Já Investiu",
    desc: "Pesquisa vs Comu RT",
  },
  areasMain: {
    title: "Áreas de Tratamento",
    desc: "Pesquisa vs Comu RT",
  },
  tentouOutraTerapia: {
    title: "Experiência com Terapias",
    desc: "Pesquisa vs Comu RT",
  },
  interesseTratarOutros: {
    title: "Interesse em Tratar Outros",
    desc: "Pesquisa vs Comu RT",
  },
};

const RespondentesVsCRT = ({ people }: RespondentesVsCRTProps) => {
  const respondentes = people.filter((p) => p.respondeuPesquisa);
  const rtPeople = people.filter((p) => p.virouCRT && p.respondeuPesquisa);
  const fields = getSurveyFields();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Pesquisa vs Comu RT
        </h2>
        <p className="text-sm text-muted-foreground">
          Comparativo de perfil entre quem respondeu a pesquisa e quem avançou
          para a Comu RT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {fields.map((f) => {
          const meta = fieldMeta[f.key] || { title: f.label, desc: "Pesquisa vs Comu RT" };
          const allDist = getSurveyDistribution(respondentes, f.key);
          const rtDist = getSurveyDistribution(rtPeople, f.key);
          const totalAll = allDist.reduce((s, d) => s + d.total, 0);
          const totalRt = rtDist.reduce((s, d) => s + d.total, 0);

          const merged = allDist.map((a) => {
            const c = rtDist.find((d) => d.value === a.value);
            const pctAll = totalAll > 0 ? (a.total / totalAll) * 100 : 0;
            const pctRt = totalRt > 0 && c ? (c.total / totalRt) * 100 : 0;
            const lift = pctAll > 0 ? ((pctRt - pctAll) / pctAll) * 100 : 0;
            return { value: a.value, pctAll, pctRt, lift };
          });

          return (
            <div key={f.key} className="dashboard-card">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">
                {meta.title}
              </h3>
              <p className="text-[11px] text-muted-foreground/60 mb-4">
                {meta.desc}
              </p>

              {/* Header row */}
              <div className="grid grid-cols-[1fr_56px_56px_64px] items-center gap-1 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <span>Categoria</span>
                <span className="text-right">Pesquisa</span>
                <span className="text-right">Comu RT</span>
                <span className="text-right">Variação</span>
              </div>

              {/* Data rows */}
              <div className="space-y-1.5">
                {merged.slice(0, 5).map((m) => (
                  <div
                    key={m.value}
                    className="grid grid-cols-[1fr_56px_56px_64px] items-center gap-1 py-1.5 border-b border-border/30 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground truncate">
                      {m.value}
                    </span>
                    <span className="text-right text-xs font-mono text-foreground/70">
                      {m.pctAll.toFixed(1)}%
                    </span>
                    <span className="text-right text-xs font-mono font-semibold text-foreground">
                      {m.pctRt.toFixed(1)}%
                    </span>
                    <div className="flex items-center justify-end gap-1">
                      {m.lift > 5 ? (
                        <ArrowUpRight className="w-3 h-3 text-success" />
                      ) : m.lift < -5 ? (
                        <ArrowDownRight className="w-3 h-3 text-destructive" />
                      ) : (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span
                        className={`font-mono text-xs ${
                          m.lift > 5
                            ? "text-success"
                            : m.lift < -5
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {m.lift > 0 ? "+" : ""}
                        {m.lift.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RespondentesVsCRT;
