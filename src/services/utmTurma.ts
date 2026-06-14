import { supabase } from "./supabaseClient";

// UTMs por turma (banco): top valores de cada UTM, agregado de raw_ac_contato.
// Sem PII — só contagens. Fonte: view public.vw_utm_por_tag (top-6 por campo).

export interface UtmValor {
  valor: string;
  leads: number;
  share: number; // % sobre o total de leads do campo
}
export interface UtmCampo {
  campo: string;
  totalCampo: number;
  valoresDistintos: number;
  top: UtmValor[]; // ordenado desc
}

interface ViewRow {
  turmaSlug: string | null;
  turmaNome: string | null;
  utmCampo: string;
  valor: string;
  leads: number;
  totalCampo: number;
  valoresDistintos: number;
  rank: number;
}

const n = (v: number | string | null): number => (typeof v === "number" ? v : Number(v ?? 0));

// Ordem oficial de exibição dos campos UTM.
export const UTM_ORDEM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
export const UTM_LABEL: Record<string, string> = {
  utm_source: "Source",
  utm_medium: "Medium",
  utm_campaign: "Campaign",
  utm_content: "Content",
  utm_term: "Term",
};

export async function fetchUtmTurma(): Promise<ViewRow[]> {
  const { data, error } = await supabase
    .from("vw_utm_por_tag")
    .select("turma_slug, turma_nome, utm_campo, valor, leads, total_campo, valores_distintos, rank");
  if (error) throw new Error(`vw_utm_por_tag: ${error.message}`);
  return (data ?? []).map((r: any) => ({
    turmaSlug: r.turma_slug,
    turmaNome: r.turma_nome,
    utmCampo: r.utm_campo,
    valor: r.valor,
    leads: n(r.leads),
    totalCampo: n(r.total_campo),
    valoresDistintos: n(r.valores_distintos),
    rank: n(r.rank),
  }));
}

// Monta os campos UTM do escopo (turma selecionada ou total geral quando turmaNome = null).
export function buildUtmScope(rows: ViewRow[], turmaNome: string | null): UtmCampo[] {
  const inScope = rows.filter((r) => (turmaNome === null ? r.turmaSlug === null : r.turmaNome === turmaNome));
  return UTM_ORDEM.map((campo) => {
    const linhas = inScope.filter((r) => r.utmCampo === campo).sort((a, b) => a.rank - b.rank);
    const totalCampo = linhas[0]?.totalCampo ?? 0;
    const valoresDistintos = linhas[0]?.valoresDistintos ?? 0;
    return {
      campo,
      totalCampo,
      valoresDistintos,
      top: linhas.map((l) => ({
        valor: l.valor,
        leads: l.leads,
        share: totalCampo > 0 ? (l.leads / totalCampo) * 100 : 0,
      })),
    };
  });
}
