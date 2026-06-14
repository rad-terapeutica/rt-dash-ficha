import { useMemo } from "react";
import type { PerfilScope } from "@/services/distribuicaoComprador";
import { computeLeadscoreBanco } from "@/data/leadscoreBanco";
import LeadscoreKPICards from "@/components/leadscore/LeadscoreKPIs";
import SignalRanking from "@/components/leadscore/SignalRanking";
import BuyerProfile from "@/components/leadscore/BuyerProfile";
import { Database, FlaskConical, BookOpen, ShoppingCart } from "lucide-react";

interface LeadscoreProps {
  perfilComprador: PerfilScope | null;
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
            Esta análise usa apenas os leads que preencheram a ficha de
            interesse. Dentro desse universo de{" "}
            <span className="text-foreground font-semibold">
              {respondentes.toLocaleString("pt-BR")} respondentes
            </span>
            , comparamos{" "}
            <span className="text-foreground font-semibold">
              {compradores.toLocaleString("pt-BR")} que compraram a Comu RT
            </span>{" "}
            com{" "}
            <span className="text-foreground font-semibold">
              {naoCompradores.toLocaleString("pt-BR")} que não compraram
            </span>
            .
          </p>
          <p className="mt-2">
            Os números aqui refletem o subconjunto analisável (com pesquisa),
            não o total de compradores da turma.
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

const Leadscore = ({ perfilComprador }: LeadscoreProps) => {
  const { signals, profiles, kpis } = useMemo(
    () =>
      perfilComprador
        ? computeLeadscoreBanco(perfilComprador)
        : { signals: [], profiles: [], kpis: { respondentes: 0, compradores: 0, naoCompradores: 0, taxaConversao: 0, scoreMedia: 0 } },
    [perfilComprador]
  );
  const semCompradores = !perfilComprador || perfilComprador.totalCompradores === 0;

  return (
    <div className="space-y-6">
      <LeadscoreKPICards data={kpis} />

      <MethodologyCards
        respondentes={kpis.respondentes}
        compradores={kpis.compradores}
        naoCompradores={kpis.naoCompradores}
      />

      {semCompradores ? (
        <div className="dashboard-card flex items-center gap-3 py-8 justify-center text-center">
          <ShoppingCart className="w-5 h-5 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground/70 max-w-md">
            Sem compradores nesta turma ainda — o ranking de sinais e o perfil comprador × não-comprador
            aparecem assim que houver compras registradas para a turma selecionada.
          </p>
        </div>
      ) : (
        <>
          <SignalRanking signals={signals} />
          <BuyerProfile profiles={profiles} />
        </>
      )}
    </div>
  );
};

export default Leadscore;
