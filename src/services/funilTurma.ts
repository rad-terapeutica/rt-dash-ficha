import { supabase } from "./supabaseClient";

// Funil oficial por turma (banco): leads → responderam → compraram.
// Fonte: view public.vw_funil_turma.
// Regra: base = raw_ac_contato; respondeu = email ∈ raw_ficha_resposta;
// comprou = (email, turma_slug) ∈ raw_comprador. Total geral = pessoas únicas.

export interface FunilTag {
  turmaSlug: string;
  turmaNome: string;
  totalLeads: number;
  responderamPesquisa: number;
  compraramComuRt: number;
  responderamECompraram: number;
  conversaoPesquisaPct: number;
  conversaoCompraPct: number;
  conversaoRespondeuParaCompraPct: number;
  pctCompradoresQueResponderam: number;
}

export interface FunilGlobal {
  compraramComuRt: number;
  responderamECompraram: number;
  conversaoCompraPct: number;
  conversaoRespondeuParaCompraPct: number;
  pctCompradoresQueResponderam: number;
}

export interface FunilTurmaData {
  porTag: FunilTag[];
  global: FunilGlobal;
}

interface ViewRow {
  turma_slug: string | null;
  turma_nome: string | null;
  total_leads: number | string;
  responderam_pesquisa: number | string;
  compraram_comu_rt: number | string;
  responderam_e_compraram: number | string;
  conversao_pesquisa_pct: number | string;
  conversao_compra_pct: number | string;
  conversao_respondeu_para_compra_pct: number | string | null;
  pct_compradores_que_responderam: number | string | null;
}

const n = (v: number | string | null): number => (typeof v === "number" ? v : Number(v ?? 0));

export async function fetchFunilTurma(): Promise<FunilTurmaData> {
  const { data, error } = await supabase
    .from("vw_funil_turma")
    .select(
      "turma_slug, turma_nome, total_leads, responderam_pesquisa, compraram_comu_rt, responderam_e_compraram, conversao_pesquisa_pct, conversao_compra_pct, conversao_respondeu_para_compra_pct, pct_compradores_que_responderam"
    );

  if (error) throw new Error(`vw_funil_turma: ${error.message}`);

  const rows = (data ?? []) as ViewRow[];
  const totalRow = rows.find((r) => r.turma_slug === null);

  const porTag: FunilTag[] = rows
    .filter((r) => r.turma_slug !== null)
    .map((r) => ({
      turmaSlug: r.turma_slug as string,
      turmaNome: r.turma_nome as string,
      totalLeads: n(r.total_leads),
      responderamPesquisa: n(r.responderam_pesquisa),
      compraramComuRt: n(r.compraram_comu_rt),
      responderamECompraram: n(r.responderam_e_compraram),
      conversaoPesquisaPct: n(r.conversao_pesquisa_pct),
      conversaoCompraPct: n(r.conversao_compra_pct),
      conversaoRespondeuParaCompraPct: n(r.conversao_respondeu_para_compra_pct),
      pctCompradoresQueResponderam: n(r.pct_compradores_que_responderam),
    }))
    .sort((a, b) => b.totalLeads - a.totalLeads);

  const global: FunilGlobal = totalRow
    ? {
        compraramComuRt: n(totalRow.compraram_comu_rt),
        responderamECompraram: n(totalRow.responderam_e_compraram),
        conversaoCompraPct: n(totalRow.conversao_compra_pct),
        conversaoRespondeuParaCompraPct: n(totalRow.conversao_respondeu_para_compra_pct),
        pctCompradoresQueResponderam: n(totalRow.pct_compradores_que_responderam),
      }
    : {
        compraramComuRt: 0,
        responderamECompraram: 0,
        conversaoCompraPct: 0,
        conversaoRespondeuParaCompraPct: 0,
        pctCompradoresQueResponderam: 0,
      };

  return { porTag, global };
}
