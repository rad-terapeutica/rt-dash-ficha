import { supabase } from "./supabaseClient";

// KPI oficial da Ficha de Interesse, vindo da view public.vw_pesquisa_por_tag.
// Regra de negócio: interseção de email por tag (raw_ac_contato ∩ raw_ficha_resposta).
// NÃO usa janela, C1–C5 nem enriquecimento de turma na ficha.

export interface KpiPorTag {
  turmaSlug: string;
  turmaNome: string;
  totalLeads: number;
  responderamPesquisa: number;
  conversaoPesquisaPct: number;
}

export interface KpiGlobal {
  totalLeads: number;
  responderamPesquisa: number;
  conversaoPesquisaPct: number;
}

export interface KpiPesquisaData {
  porTag: KpiPorTag[]; // uma linha por turma
  global: KpiGlobal; // linha de total geral (distinct, sem somar multi-turma)
}

interface ViewRow {
  turma_slug: string | null;
  turma_nome: string | null;
  total_leads: number | string;
  responderam_pesquisa: number | string;
  conversao_pesquisa_pct: number | string;
}

function toNum(v: number | string | null): number {
  return typeof v === "number" ? v : Number(v ?? 0);
}

export async function fetchKpiPesquisa(): Promise<KpiPesquisaData> {
  const { data, error } = await supabase
    .from("vw_pesquisa_por_tag")
    .select("turma_slug, turma_nome, total_leads, responderam_pesquisa, conversao_pesquisa_pct");

  if (error) throw new Error(`Falha ao ler vw_pesquisa_por_tag: ${error.message}`);

  const rows = (data ?? []) as ViewRow[];

  // A linha de TOTAL GERAL tem turma_slug NULL (grouping sets na view).
  const totalRow = rows.find((r) => r.turma_slug === null);

  const porTag: KpiPorTag[] = rows
    .filter((r) => r.turma_slug !== null)
    .map((r) => ({
      turmaSlug: r.turma_slug as string,
      turmaNome: r.turma_nome as string,
      totalLeads: toNum(r.total_leads),
      responderamPesquisa: toNum(r.responderam_pesquisa),
      conversaoPesquisaPct: toNum(r.conversao_pesquisa_pct),
    }))
    .sort((a, b) => b.totalLeads - a.totalLeads);

  const global: KpiGlobal = totalRow
    ? {
        totalLeads: toNum(totalRow.total_leads),
        responderamPesquisa: toNum(totalRow.responderam_pesquisa),
        conversaoPesquisaPct: toNum(totalRow.conversao_pesquisa_pct),
      }
    : { totalLeads: 0, responderamPesquisa: 0, conversaoPesquisaPct: 0 };

  return { porTag, global };
}
