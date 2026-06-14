import { supabase } from "./supabaseClient";

// Perfil por comprador (banco): distribuição dos campos da ficha quebrada por
// comprou × não comprou. Fonte: view public.vw_ficha_distribuicao_por_comprador.
// Sem PII — só contagens agregadas por (turma, campo, valor).

export interface DistCompradorRow {
  turmaSlug: string | null;
  turmaNome: string | null;
  campo: string;
  valor: string;
  respondentes: number;
  respondentesCompradores: number;
  respondentesNaoCompradores: number;
}

export interface PerfilItem {
  valor: string;
  respondentes: number;
  compradores: number;
  naoCompradores: number;
}

export interface PerfilScope {
  porCampo: Map<string, PerfilItem[]>;
  totalRespondentes: number; // respondentes no escopo (= responderam)
  totalCompradores: number; // respondentes que compraram (= responderam_e_compraram)
}

export const TEXT_FIELDS = ["dispostoinvestir", "quantoInvestiu", "tentouOutraTerapia", "interesseTratarOutros"];
export const AREA_FIELDS = [
  "area_prosperidade",
  "area_saude",
  "area_ambiente",
  "area_relacionamento",
  "area_procrastinacao",
  "area_saude_emocional",
];
export const AREA_LABEL: Record<string, string> = {
  area_prosperidade: "Prosperidade",
  area_saude: "Saúde",
  area_ambiente: "Ambiente",
  area_relacionamento: "Relacionamento",
  area_procrastinacao: "Procrastinação",
  area_saude_emocional: "Saúde Emocional",
};

const n = (v: number | string | null): number => (typeof v === "number" ? v : Number(v ?? 0));

export async function fetchDistribuicaoComprador(): Promise<DistCompradorRow[]> {
  const { data, error } = await supabase
    .from("vw_ficha_distribuicao_por_comprador")
    .select("turma_slug, turma_nome, campo, valor, respondentes, respondentes_compradores, respondentes_nao_compradores");
  if (error) throw new Error(`vw_ficha_distribuicao_por_comprador: ${error.message}`);
  return (data ?? []).map((r: any) => ({
    turmaSlug: r.turma_slug,
    turmaNome: r.turma_nome,
    campo: r.campo,
    valor: r.valor,
    respondentes: n(r.respondentes),
    respondentesCompradores: n(r.respondentes_compradores),
    respondentesNaoCompradores: n(r.respondentes_nao_compradores),
  }));
}

// Monta o escopo (turma selecionada ou total geral quando turmaNome = null).
export function buildPerfilScope(rows: DistCompradorRow[], turmaNome: string | null): PerfilScope {
  const inScope = rows.filter((r) => (turmaNome === null ? r.turmaSlug === null : r.turmaNome === turmaNome));
  const porCampo = new Map<string, PerfilItem[]>();
  for (const r of inScope) {
    if (!porCampo.has(r.campo)) porCampo.set(r.campo, []);
    porCampo.get(r.campo)!.push({
      valor: r.valor,
      respondentes: r.respondentes,
      compradores: r.respondentesCompradores,
      naoCompradores: r.respondentesNaoCompradores,
    });
  }
  // totais do escopo a partir de um campo de escolha única (todo respondente tem 1 valor)
  const ref = porCampo.get("dispostoinvestir") ?? [];
  const totalRespondentes = ref.reduce((s, i) => s + i.respondentes, 0);
  const totalCompradores = ref.reduce((s, i) => s + i.compradores, 0);
  return { porCampo, totalRespondentes, totalCompradores };
}

// CompareCard: % entre respondentes vs % entre compradores + lift, por valor do campo.
export interface CompareItem {
  value: string;
  pctAll: number;
  pctRt: number;
  lift: number;
}
export function compareCardData(scope: PerfilScope, surveyKey: string): CompareItem[] {
  const items = scope.porCampo.get(surveyKey) ?? [];
  const totalAll = items.reduce((s, i) => s + i.respondentes, 0);
  const totalRt = items.reduce((s, i) => s + i.compradores, 0);
  return items.map((i) => {
    const pctAll = totalAll > 0 ? (i.respondentes / totalAll) * 100 : 0;
    const pctRt = totalRt > 0 ? (i.compradores / totalRt) * 100 : 0;
    const lift = pctAll > 0 ? ((pctRt - pctAll) / pctAll) * 100 : 0;
    return { value: i.value ?? i.valor, pctAll, pctRt, lift };
  });
}

// ProfileCard (toggle "somente Comu RT"): distribuição entre compradores.
export interface DistItem {
  value: string;
  total: number;
}
export function profileBuyerDist(scope: PerfilScope, theme: { surveyKey: string; isArea?: boolean }): DistItem[] {
  if (theme.isArea) {
    // áreas: total = compradores que marcaram "Sim" em cada área
    return AREA_FIELDS.map((campo) => {
      const sim = (scope.porCampo.get(campo) ?? []).find((i) => i.valor === "Sim");
      return { value: AREA_LABEL[campo], total: sim ? sim.compradores : 0 };
    }).sort((a, b) => b.total - a.total);
  }
  return (scope.porCampo.get(theme.surveyKey) ?? [])
    .map((i) => ({ value: i.valor, total: i.compradores }))
    .sort((a, b) => b.total - a.total);
}
