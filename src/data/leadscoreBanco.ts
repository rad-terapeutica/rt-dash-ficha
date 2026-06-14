import type { PerfilScope } from "@/services/distribuicaoComprador";
import { TEXT_FIELDS, AREA_FIELDS, AREA_LABEL } from "@/services/distribuicaoComprador";
import type { Signal, ProfileComparison, LeadscoreKPIs } from "@/data/leadscoreProcessor";

// Leadscore a partir do banco (agregado, sem PII, sem dados por pessoa).
// Sinais, perfis e KPIs derivam da vw_ficha_distribuicao_por_comprador.
// O "Score Médio" é a média ponderada da propensão observada (derivável dos agregados).

const FIELD_LABEL: Record<string, string> = {
  dispostoinvestir: "Disposição para Investir",
  quantoInvestiu: "Quanto Já Investiu",
  tentouOutraTerapia: "Experiência com Terapias",
  interesseTratarOutros: "Interesse em Tratar Outros",
  area_prosperidade: "Área: Prosperidade",
  area_saude: "Área: Saúde",
  area_ambiente: "Área: Ambiente",
  area_relacionamento: "Área: Relacionamento",
  area_procrastinacao: "Área: Procrastinação",
  area_saude_emocional: "Área: Saúde Emocional",
};

const ALL_FIELDS = [...TEXT_FIELDS, ...AREA_FIELDS];

function liftOf(pctBuyers: number, pctNonBuyers: number): number {
  return pctNonBuyers > 0 ? ((pctBuyers - pctNonBuyers) / pctNonBuyers) * 100 : pctBuyers > 0 ? 100 : 0;
}

export interface LeadscoreBancoResult {
  signals: Signal[];
  profiles: ProfileComparison[];
  kpis: LeadscoreKPIs;
}

export function computeLeadscoreBanco(scope: PerfilScope): LeadscoreBancoResult {
  const totalBuyers = scope.totalCompradores;
  const totalNonBuyers = scope.totalRespondentes - scope.totalCompradores;

  const signals: Signal[] = [];
  for (const field of ALL_FIELDS) {
    const items = scope.porCampo.get(field) ?? [];
    for (const it of items) {
      const pctB = totalBuyers > 0 ? (it.compradores / totalBuyers) * 100 : 0;
      const pctN = totalNonBuyers > 0 ? (it.naoCompradores / totalNonBuyers) * 100 : 0;
      signals.push({
        field,
        fieldLabel: FIELD_LABEL[field] ?? field,
        value: it.valor,
        pctBuyers: pctB,
        pctNonBuyers: pctN,
        lift: liftOf(pctB, pctN),
        buyerCount: it.compradores,
        nonBuyerCount: it.naoCompradores,
      });
    }
  }
  signals.sort((a, b) => Math.abs(b.lift) - Math.abs(a.lift));

  // Perfil comprador × não-comprador (só campos de texto, como o leadscore atual)
  const profiles: ProfileComparison[] = TEXT_FIELDS.map((field) => {
    const items = scope.porCampo.get(field) ?? [];
    return {
      fieldLabel: FIELD_LABEL[field] ?? field,
      items: items
        .map((it) => {
          const pctB = totalBuyers > 0 ? (it.compradores / totalBuyers) * 100 : 0;
          const pctN = totalNonBuyers > 0 ? (it.naoCompradores / totalNonBuyers) * 100 : 0;
          return { value: it.valor, pctBuyers: pctB, pctNonBuyers: pctN, lift: liftOf(pctB, pctN) };
        })
        .sort((a, b) => b.pctBuyers - a.pctBuyers),
    };
  });

  // Score Médio: média ponderada da propensão (derivada dos agregados).
  // avg(rawScore) = Σ_campo Σ_valor (respondentes/total) * lift(valor); normaliza por [Σ min, Σ max].
  const liftByFieldValue = new Map<string, number>();
  for (const s of signals) liftByFieldValue.set(`${s.field}::${s.value}`, s.lift);

  let tMin = 0;
  let tMax = 0;
  let avgRaw = 0;
  for (const field of ALL_FIELDS) {
    const items = scope.porCampo.get(field) ?? [];
    if (items.length === 0) continue;
    let fMin = Infinity;
    let fMax = -Infinity;
    for (const it of items) {
      const lift = liftByFieldValue.get(`${field}::${it.valor}`) ?? 0;
      fMin = Math.min(fMin, lift);
      fMax = Math.max(fMax, lift);
      if (scope.totalRespondentes > 0) {
        avgRaw += (it.respondentes / scope.totalRespondentes) * lift;
      }
    }
    tMin += fMin;
    tMax += fMax;
  }
  const range = tMax - tMin;
  const scoreMedia = range > 0 ? Math.max(0, Math.min(100, ((avgRaw - tMin) / range) * 100)) : 50;

  const kpis: LeadscoreKPIs = {
    respondentes: scope.totalRespondentes,
    compradores: scope.totalCompradores,
    naoCompradores: totalNonBuyers,
    taxaConversao: scope.totalRespondentes > 0 ? (scope.totalCompradores / scope.totalRespondentes) * 100 : 0,
    scoreMedia,
  };

  return { signals, profiles, kpis };
}
