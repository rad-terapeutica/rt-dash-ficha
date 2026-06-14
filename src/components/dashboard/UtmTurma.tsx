import { Database, Radio } from "lucide-react";
import type { UtmCampo } from "@/services/utmTurma";
import { UTM_LABEL } from "@/services/utmTurma";

interface UtmTurmaProps {
  campos: UtmCampo[];
  turmaFilter: string;
}

// Bloco enxuto de UTMs da turma selecionada — valor dominante por campo (banco).
const UtmTurma = ({ campos, turmaFilter }: UtmTurmaProps) => {
  const escopo = turmaFilter === "all" ? "todas as turmas" : turmaFilter.replace("Desafio - ", "");
  const temDados = campos.some((c) => c.totalCampo > 0);

  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-2 mb-1">
        <Radio className="w-4 h-4 text-primary/80" />
        <h3 className="section-title">Origem da Turma (UTM)</h3>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-full">
          <Database className="w-3 h-3" /> banco
        </span>
      </div>
      <p className="section-subtitle mb-5">Principais parâmetros de origem dos leads — {escopo}</p>

      {!temDados ? (
        <div className="flex items-center justify-center py-8 text-center">
          <p className="text-xs text-muted-foreground/60">Sem dados de UTM para este escopo.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {campos.map((c) => {
            const top = c.top[0];
            const outros = Math.max(0, c.valoresDistintos - 1);
            return (
              <div
                key={c.campo}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-[hsl(225,20%,7%)] px-3 py-2.5"
              >
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20 flex-shrink-0">
                  {UTM_LABEL[c.campo] ?? c.campo}
                </span>

                {top ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate" title={top.valor}>
                        {top.valor}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono font-semibold text-primary">
                          {top.share.toFixed(0)}%
                        </span>
                        {outros > 0 && (
                          <span className="text-[10px] text-muted-foreground/60">+{outros} outros</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[hsl(225,15%,12%)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-700"
                        style={{ width: `${Math.max(3, top.share)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/50">—</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UtmTurma;
