import type { SheetData, SurveyRow } from "@/services/googleSheets";

// ---- Types ----

export interface Person {
  id: string;
  nome: string;
  email: string;
  turma: string;
  turmaTag: string;
  crtTag: string | null;
  respondeuPesquisa: boolean;
  virouCRT: boolean; // only true if respondeuPesquisa AND in CRT list
  survey: SurveyRow | null;
}

export interface TurmaStats {
  turma: string;
  total: number;
  respondentes: number;
  crt: number;
  pctResp: number;
  pctCrt: number;
  pctCrtResp: number;
}

export interface GlobalStats {
  total: number;
  respondentes: number;
  crt: number;
  pctRespondentes: number;
  pctCrtRespondentes: number;
  pctCrtTotal: number;
}

// ---- Processing ----
// 
// LOGIC (definitive):
// 1. Base = desafio_turma (all leads by turma)
// 2. Cross desafio_turma × pesquisa by email → respondeuPesquisa
// 3. Among respondents, cross with Desafio_crt by email → virouCRT
// 4. desafio_compra_aprvada is COMPLETELY IGNORED

export function processData(data: SheetData) {
  // Build survey lookup by email
  const surveyByEmail = new Map<string, SurveyRow>();
  for (const s of data.survey) {
    if (s.email) surveyByEmail.set(s.email, s);
  }

  // Build CRT email set
  const crtEmails = new Map<string, string>(); // email → crtTag
  for (const c of data.crt) {
    if (c.email) crtEmails.set(c.email, c.tag);
  }

  // Build people from desafio_turma ONLY
  const people: Person[] = [];
  let id = 0;
  for (const t of data.turmas) {
    if (!t.email) continue;

    // Step 2: Did this person respond to the survey?
    const survey = surveyByEmail.get(t.email) || null;
    const respondeuPesquisa = survey != null;

    // Step 3: ONLY if they responded, check if they're in CRT
    const crtTag = respondeuPesquisa ? (crtEmails.get(t.email) || null) : null;
    const virouCRT = crtTag != null;

    people.push({
      id: String(++id),
      nome: t.nome,
      email: t.email,
      turma: t.tag,
      turmaTag: t.tag,
      crtTag,
      respondeuPesquisa,
      virouCRT,
      survey,
    });
  }

  return { people };
}

// ---- Stats ----

export function getGlobalStats(people: Person[]): GlobalStats {
  const total = people.length;
  const respondentes = people.filter(p => p.respondeuPesquisa).length;
  const crt = people.filter(p => p.virouCRT).length;
  return {
    total,
    respondentes,
    crt,
    pctRespondentes: total > 0 ? (respondentes / total) * 100 : 0,
    pctCrtRespondentes: respondentes > 0 ? (crt / respondentes) * 100 : 0,
    pctCrtTotal: total > 0 ? (crt / total) * 100 : 0,
  };
}

export function getTurmaStats(people: Person[]): TurmaStats[] {
  const map = new Map<string, { total: number; respondentes: number; crt: number }>();
  for (const p of people) {
    if (!map.has(p.turma)) map.set(p.turma, { total: 0, respondentes: 0, crt: 0 });
    const s = map.get(p.turma)!;
    s.total++;
    if (p.respondeuPesquisa) s.respondentes++;
    if (p.virouCRT) s.crt++;
  }
  return Array.from(map.entries())
    .map(([turma, s]) => ({
      turma,
      ...s,
      pctResp: s.total > 0 ? (s.respondentes / s.total) * 100 : 0,
      pctCrt: s.total > 0 ? (s.crt / s.total) * 100 : 0,
      pctCrtResp: s.respondentes > 0 ? (s.crt / s.respondentes) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getTurmaList(people: Person[]): string[] {
  return [...new Set(people.map(p => p.turma))].sort();
}

// Survey field distributions
type SurveyFieldKey = "areasMain" | "tentouOutraTerapia" | "quantoInvestiu" | "interesseTratarOutros" | "dispostoinvestir";

const surveyFieldLabels: Record<SurveyFieldKey, string> = {
  areasMain: "Áreas de Tratamento",
  tentouOutraTerapia: "Tentou outra terapia?",
  quantoInvestiu: "Quanto já investiu?",
  interesseTratarOutros: "Interesse em tratar outros?",
  dispostoinvestir: "Disposto(a) a investir R$3.995?",
};

export function getSurveyFields(): { key: SurveyFieldKey; label: string }[] {
  return Object.entries(surveyFieldLabels).map(([key, label]) => ({ key: key as SurveyFieldKey, label }));
}

export function getSurveyDistribution(people: Person[], field: SurveyFieldKey) {
  const dist = new Map<string, { total: number; crt: number }>();
  for (const p of people) {
    if (!p.survey) continue;
    const val = p.survey[field] || "(vazio)";
    if (!dist.has(val)) dist.set(val, { total: 0, crt: 0 });
    const d = dist.get(val)!;
    d.total++;
    if (p.virouCRT) d.crt++;
  }
  return Array.from(dist.entries())
    .map(([value, stats]) => ({ value, ...stats }))
    .sort((a, b) => b.total - a.total);
}

export function getAreaDistribution(people: Person[]) {
  const areas = [
    { key: "areaProsperdade" as const, label: "Prosperidade" },
    { key: "areaSaude" as const, label: "Saúde" },
    { key: "areaAmbiente" as const, label: "Ambiente" },
    { key: "areaRelacionamento" as const, label: "Relacionamento" },
    { key: "areaProcrastinacao" as const, label: "Procrastinação" },
    { key: "areaSaudeEmocional" as const, label: "Saúde Emocional" },
  ];

  return areas.map(a => {
    const total = people.filter(p => p.survey?.[a.key]).length;
    const crt = people.filter(p => p.survey?.[a.key] && p.virouCRT).length;
    return { value: a.label, total, crt };
  }).sort((a, b) => b.total - a.total);
}
