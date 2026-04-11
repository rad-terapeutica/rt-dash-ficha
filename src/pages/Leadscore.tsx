import { useMemo } from "react";
import {
  computeSignals,
  computeScores,
  getLeadscoreKPIs,
  getBuyerProfiles,
} from "@/data/leadscoreProcessor";
import type { Person } from "@/data/dataProcessor";
import LeadscoreKPICards from "@/components/leadscore/LeadscoreKPIs";
import SignalRanking from "@/components/leadscore/SignalRanking";
import BuyerProfile from "@/components/leadscore/BuyerProfile";
import { Database, FlaskConical, BookOpen } from "lucide-react";

interface LeadscoreProps {
  people: Person[];
}

/* ─── Methodology Cards ─── */

function MethodologyCards({
  respondentes,
  compradores,
  naoCompradores,
}: {
  respondentes: number;
  compradores: number;
  naoCompradores: number;
}) {
  const cards = [
    {
      icon: Database,
      color: "hsl(210 100% 62%)",
      title: "Base analisada",
      body: (
        <>
          <p>
            Comparamos as respostas de{" "}
            <span className="text-foreground font-semibold">
              {compradores.toLocaleString("pt-BR")} compradores
            </span>{" "}
            da Comu RT com{" "}
            <span className="text-foreground font-semibold">
              {naoCompradores.toLocaleString("pt-BR")} não compradores
            </span>
            , dentro de um universo de{" "}
            <span className="text-foreground font-semibold">
              {respondentes.toLocaleString("pt-BR")} respondentes
            </span>{" "}
            identificados na base da turma.
          </p>
          <p className="mt-2">
            A análise usa apenas leads que preencheram a ficha de interesse e
            estão na base do Desafio.
          </p>
        </>
      ),
    },
    {
      icon: FlaskConical,
      color: "hsl(165 70% 46%)",
      title: "Como calculamos",
      body: (
        <>
          <p>
            Cada resposta da ficha foi comparada entre quem comprou e quem não
            comprou. Se uma resposta aparece com mais força entre compradores,
            ela ganha <span className="text-[hsl(165,70%,46%)] font-semibold">peso positivo</span>.
            Se aparece menos, ganha{" "}
            <span className="text-destructive font-semibold">peso negativo</span>.
          </p>
          <p className="mt-2">
            O critério é o <span className="text-foreground font-semibold">lift</span>: a diferença
            relativa entre a frequência da resposta nos dois grupos. Quanto
            maior o lift, mais forte o sinal.
          </p>
        </>
      ),
    },
    {
      icon: BookOpen,
      color: "hsl(38 95% 55%)",
      title: "Como interpretar",
      body: (
        <>
          <p>
            O score representa{" "}
            <span className="text-foreground font-semibold">propensão observada</span>,
            não garantia de compra. Quanto maior o score, mais o perfil do lead
            se parece com o perfil de quem já comprou a Comu RT.
          </p>
          <p className="mt-2">
            Use os sinais para entender quais respostas indicam maior
            afinidade com a compra — e quais sugerem menor engajamento.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-xl border border-border/40 bg-[hsl(225,20%,7%)] p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {card.title}
              </h3>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {card.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main ─── */

const Leadscore = ({ people }: LeadscoreProps) => {
  const signals = useMemo(() => computeSignals(people), [people]);
  const scores = useMemo(() => computeScores(people, signals), [people, signals]);
  const kpis = useMemo(() => getLeadscoreKPIs(people, scores), [people, scores]);
  const profiles = useMemo(() => getBuyerProfiles(people), [people]);

  return (
    <div className="space-y-6">
      <LeadscoreKPICards data={kpis} />

      <MethodologyCards
        respondentes={kpis.respondentes}
        compradores={kpis.compradores}
        naoCompradores={kpis.naoCompradores}
      />

      <SignalRanking signals={signals} />

      <BuyerProfile profiles={profiles} />
    </div>
  );
};

export default Leadscore;
