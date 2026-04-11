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

interface LeadscoreProps {
  people: Person[];
}

const Leadscore = ({ people }: LeadscoreProps) => {
  const signals = useMemo(() => computeSignals(people), [people]);
  const scores = useMemo(() => computeScores(people, signals), [people, signals]);
  const kpis = useMemo(() => getLeadscoreKPIs(people, scores), [people, scores]);
  const profiles = useMemo(() => getBuyerProfiles(people), [people]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] text-muted-foreground/50 mt-1">
          Score de propensão baseado na correlação observada entre respostas da ficha e compra da Comu RT.
          Os pesos refletem o comportamento real da base — não são um modelo preditivo absoluto.
        </p>
      </div>

      <LeadscoreKPICards data={kpis} />

      <SignalRanking signals={signals} />

      <BuyerProfile profiles={profiles} />
    </div>
  );
};

export default Leadscore;
