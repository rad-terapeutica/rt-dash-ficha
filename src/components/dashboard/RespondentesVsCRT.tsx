import { getResponseDistribution, type Person } from "@/data/mockData";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface RespondentesVsCRTProps {
  people: Person[];
}

const fields = [
  { key: "motivoPrincipal" as const, label: "Motivo Principal" },
  { key: "momentoAtual" as const, label: "Momento Atual" },
  { key: "intencao" as const, label: "Intenção" },
  { key: "faixa" as const, label: "Faixa de Renda" },
  { key: "perfil" as const, label: "Perfil" },
];

const RespondentesVsCRT = ({ people }: RespondentesVsCRTProps) => {
  const respondentes = people.filter((p) => p.respondeuPesquisa);
  const crtPeople = people.filter((p) => p.virouCRT);

  return (
    <div className="dashboard-card">
      <h3 className="section-title mb-1">Respondentes vs CRT</h3>
      <p className="section-subtitle mb-6">Comparação de padrões entre quem respondeu e quem converteu</p>

      <div className="space-y-6">
        {fields.map((f) => {
          const allDist = getResponseDistribution(respondentes, f.key);
          const crtDist = getResponseDistribution(crtPeople, f.key);
          const totalAll = allDist.reduce((s, d) => s + d.total, 0);
          const totalCrt = crtDist.reduce((s, d) => s + d.total, 0);

          const merged = allDist.map((a) => {
            const c = crtDist.find((d) => d.value === a.value);
            const pctAll = totalAll > 0 ? (a.total / totalAll) * 100 : 0;
            const pctCrt = totalCrt > 0 && c ? (c.total / totalCrt) * 100 : 0;
            const lift = pctAll > 0 ? ((pctCrt - pctAll) / pctAll) * 100 : 0;
            return { value: a.value, pctAll, pctCrt, lift };
          });

          return (
            <div key={f.key}>
              <h4 className="text-sm font-semibold mb-3 text-foreground">{f.label}</h4>
              <div className="space-y-2">
                {merged.slice(0, 4).map((m) => (
                  <div key={m.value} className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{m.value}</span>
                    <span className="text-right font-mono">{m.pctAll.toFixed(1)}%</span>
                    <span className="text-right font-mono font-semibold">{m.pctCrt.toFixed(1)}%</span>
                    <div className="flex items-center justify-end gap-1">
                      {m.lift > 5 ? (
                        <ArrowUpRight className="w-3 h-3 text-success" />
                      ) : m.lift < -5 ? (
                        <ArrowDownRight className="w-3 h-3 text-destructive" />
                      ) : (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={`font-mono text-xs ${m.lift > 5 ? "text-success" : m.lift < -5 ? "text-destructive" : "text-muted-foreground"}`}>
                        {m.lift > 0 ? "+" : ""}{m.lift.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>Respondentes</span>
                <span className="font-semibold">CRT</span>
                <span>Lift</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RespondentesVsCRT;
