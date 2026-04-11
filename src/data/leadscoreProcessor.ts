import type { Person } from "./dataProcessor";

// ---- Types ----

export interface Signal {
  field: string;
  fieldLabel: string;
  value: string;
  pctBuyers: number;
  pctNonBuyers: number;
  lift: number;         // relative lift %
  buyerCount: number;
  nonBuyerCount: number;
}

export interface LeadscoreKPIs {
  respondentes: number;
  compradores: number;
  naoCompradores: number;
  taxaConversao: number;
  scoreMedia: number;
}

export interface PersonScore {
  person: Person;
  score: number;
  signals: { fieldLabel: string; value: string; weight: number }[];
}

// ---- Field definitions ----

interface FieldDef {
  key: string;
  label: string;
  getValue: (p: Person) => string | null;
}

const SURVEY_FIELDS: FieldDef[] = [
  {
    key: "dispostoinvestir",
    label: "Disposição para Investir",
    getValue: (p) => p.survey?.dispostoinvestir || null,
  },
  {
    key: "quantoInvestiu",
    label: "Quanto Já Investiu",
    getValue: (p) => p.survey?.quantoInvestiu || null,
  },
  {
    key: "tentouOutraTerapia",
    label: "Experiência com Terapias",
    getValue: (p) => p.survey?.tentouOutraTerapia || null,
  },
  {
    key: "interesseTratarOutros",
    label: "Interesse em Tratar Outros",
    getValue: (p) => p.survey?.interesseTratarOutros || null,
  },
];

const AREA_FIELDS: FieldDef[] = [
  { key: "areaProsperdade", label: "Área: Prosperidade", getValue: (p) => p.survey?.areaProsperdade ? "Sim" : "Não" },
  { key: "areaSaude", label: "Área: Saúde", getValue: (p) => p.survey?.areaSaude ? "Sim" : "Não" },
  { key: "areaAmbiente", label: "Área: Ambiente", getValue: (p) => p.survey?.areaAmbiente ? "Sim" : "Não" },
  { key: "areaRelacionamento", label: "Área: Relacionamento", getValue: (p) => p.survey?.areaRelacionamento ? "Sim" : "Não" },
  { key: "areaProcrastinacao", label: "Área: Procrastinação", getValue: (p) => p.survey?.areaProcrastinacao ? "Sim" : "Não" },
  { key: "areaSaudeEmocional", label: "Área: Saúde Emocional", getValue: (p) => p.survey?.areaSaudeEmocional ? "Sim" : "Não" },
];

const ALL_FIELDS = [...SURVEY_FIELDS, ...AREA_FIELDS];

// ---- Signal computation ----

export function computeSignals(people: Person[]): Signal[] {
  const buyers = people.filter((p) => p.virouCRT);
  const nonBuyers = people.filter((p) => p.respondeuPesquisa && !p.virouCRT);
  const totalBuyers = buyers.length;
  const totalNonBuyers = nonBuyers.length;

  if (totalBuyers === 0 || totalNonBuyers === 0) return [];

  const signals: Signal[] = [];

  for (const field of ALL_FIELDS) {
    // Count per value for buyers
    const buyerDist = new Map<string, number>();
    for (const p of buyers) {
      const v = field.getValue(p);
      if (v) buyerDist.set(v, (buyerDist.get(v) || 0) + 1);
    }

    // Count per value for non-buyers
    const nonBuyerDist = new Map<string, number>();
    for (const p of nonBuyers) {
      const v = field.getValue(p);
      if (v) nonBuyerDist.set(v, (nonBuyerDist.get(v) || 0) + 1);
    }

    // Merge all values
    const allValues = new Set([...buyerDist.keys(), ...nonBuyerDist.keys()]);

    for (const value of allValues) {
      const bc = buyerDist.get(value) || 0;
      const nc = nonBuyerDist.get(value) || 0;
      const pctB = (bc / totalBuyers) * 100;
      const pctN = (nc / totalNonBuyers) * 100;
      const lift = pctN > 0 ? ((pctB - pctN) / pctN) * 100 : pctB > 0 ? 100 : 0;

      signals.push({
        field: field.key,
        fieldLabel: field.label,
        value,
        pctBuyers: pctB,
        pctNonBuyers: pctN,
        lift,
        buyerCount: bc,
        nonBuyerCount: nc,
      });
    }
  }

  return signals.sort((a, b) => Math.abs(b.lift) - Math.abs(a.lift));
}

// ---- Score computation ----

// Weights are derived from lift values of each signal.
// We normalize to a 0-100 scale.

export function computeScores(people: Person[], signals: Signal[]): PersonScore[] {
  // Build weight map: field+value → lift
  const weightMap = new Map<string, { lift: number; fieldLabel: string }>();
  for (const s of signals) {
    weightMap.set(`${s.field}::${s.value}`, { lift: s.lift, fieldLabel: s.fieldLabel });
  }

  // Compute theoretical min/max to normalize
  // For each field, find min and max possible lift
  const fieldMinMax = new Map<string, { min: number; max: number }>();
  for (const s of signals) {
    const existing = fieldMinMax.get(s.field);
    if (!existing) {
      fieldMinMax.set(s.field, { min: s.lift, max: s.lift });
    } else {
      existing.min = Math.min(existing.min, s.lift);
      existing.max = Math.max(existing.max, s.lift);
    }
  }

  let theoreticalMin = 0;
  let theoreticalMax = 0;
  for (const { min, max } of fieldMinMax.values()) {
    theoreticalMin += min;
    theoreticalMax += max;
  }

  const range = theoreticalMax - theoreticalMin;

  const respondentes = people.filter((p) => p.respondeuPesquisa);

  return respondentes.map((person) => {
    let rawScore = 0;
    const personSignals: PersonScore["signals"] = [];

    for (const field of ALL_FIELDS) {
      const v = field.getValue(person);
      if (!v) continue;
      const key = `${field.key}::${v}`;
      const w = weightMap.get(key);
      if (w) {
        rawScore += w.lift;
        personSignals.push({ fieldLabel: w.fieldLabel, value: v, weight: w.lift });
      }
    }

    // Normalize to 0-100
    const score = range > 0 ? Math.round(((rawScore - theoreticalMin) / range) * 100) : 50;

    return { person, score: Math.max(0, Math.min(100, score)), signals: personSignals };
  });
}

// ---- KPIs ----

export function getLeadscoreKPIs(people: Person[], scores: PersonScore[]): LeadscoreKPIs {
  const respondentes = people.filter((p) => p.respondeuPesquisa).length;
  const compradores = people.filter((p) => p.virouCRT).length;
  const naoCompradores = respondentes - compradores;
  const taxaConversao = respondentes > 0 ? (compradores / respondentes) * 100 : 0;
  const scoreMedia = scores.length > 0
    ? scores.reduce((s, p) => s + p.score, 0) / scores.length
    : 0;

  return { respondentes, compradores, naoCompradores, taxaConversao, scoreMedia };
}

// ---- Buyer profile distributions ----

export interface ProfileComparison {
  fieldLabel: string;
  items: {
    value: string;
    pctBuyers: number;
    pctNonBuyers: number;
    lift: number;
  }[];
}

export function getBuyerProfiles(people: Person[]): ProfileComparison[] {
  const buyers = people.filter((p) => p.virouCRT);
  const nonBuyers = people.filter((p) => p.respondeuPesquisa && !p.virouCRT);

  return SURVEY_FIELDS.map((field) => {
    const bDist = new Map<string, number>();
    const nDist = new Map<string, number>();

    for (const p of buyers) {
      const v = field.getValue(p);
      if (v) bDist.set(v, (bDist.get(v) || 0) + 1);
    }
    for (const p of nonBuyers) {
      const v = field.getValue(p);
      if (v) nDist.set(v, (nDist.get(v) || 0) + 1);
    }

    const allValues = [...new Set([...bDist.keys(), ...nDist.keys()])];
    const items = allValues.map((value) => {
      const bc = bDist.get(value) || 0;
      const nc = nDist.get(value) || 0;
      const pctB = buyers.length > 0 ? (bc / buyers.length) * 100 : 0;
      const pctN = nonBuyers.length > 0 ? (nc / nonBuyers.length) * 100 : 0;
      const lift = pctN > 0 ? ((pctB - pctN) / pctN) * 100 : 0;
      return { value, pctBuyers: pctB, pctNonBuyers: pctN, lift };
    }).sort((a, b) => b.pctBuyers - a.pctBuyers);

    return { fieldLabel: field.label, items };
  });
}
