import type { SheetData, LeadRow, SurveyRow } from "@/services/googleSheets";

// ---- Types ----

export interface Person {
  id: string;
  nome: string;
  email: string;
  turma: string;
  turmaTag: string;
  crtTag: string | null;
  respondeuPesquisa: boolean;
  virouCRT: boolean;
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
  compraAprovada: number;
}

// ---- CRT tag → turma mapping ----
// CRT20_MAR_2026_ALUNO_DESAFIO_23/02/26 → Desafio - 23/02/26

function crtTagToTurma(crtTag: string): string | null {
  const match = crtTag.match(/ALUNO_DESAFIO_(\d{2}\/\d{2}\/\d{2})$/);
  if (match) return `Desafio - ${match[1]}`;
  return null;
}

// ---- Processing ----

export function processData(data: SheetData) {
  // Build sets by email
  const surveyByEmail = new Map<string, SurveyRow>();
  for (const s of data.survey) {
    if (s.email) surveyByEmail.set(s.email, s);
  }

  // CRT emails grouped by turma
  const crtByEmail = new Map<string, string>(); // email → crtTag
  const crtEmailsByTurma = new Map<string, Set<string>>();
  for (const c of data.crt) {
    if (c.email) {
      crtByEmail.set(c.email, c.tag);
      const turma = crtTagToTurma(c.tag);
      if (turma) {
        if (!crtEmailsByTurma.has(turma)) crtEmailsByTurma.set(turma, new Set());
        crtEmailsByTurma.get(turma)!.add(c.email);
      }
    }
  }

  // Build people from turmas
  const people: Person[] = [];
  let id = 0;
  for (const t of data.turmas) {
    if (!t.email) continue;
    const survey = surveyByEmail.get(t.email) || null;
    const crtTag = crtByEmail.get(t.email) || null;
    // For CRT, check if the CRT tag corresponds to THIS turma
    const crtTurma = crtTag ? crtTagToTurma(crtTag) : null;
    const virouCRT = crtTag != null; // person has any CRT tag

    people.push({
      id: String(++id),
      nome: t.nome,
      email: t.email,
      turma: t.tag,
      turmaTag: t.tag,
      crtTag,
      respondeuPesquisa: survey != null,
      virouCRT,
      survey,
    });
  }

  return { people, compraAprovadaCount: data.compraAprovada.length };
}

// ---- Stats ----

export function getGlobalStats(people: Person[], compraAprovadaCount: number): GlobalStats {
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
    compraAprovada: compraAprovadaCount,
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

// Area breakdown (boolean columns)
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
