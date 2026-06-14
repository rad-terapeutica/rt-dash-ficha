import { supabase } from "./supabaseClient";

// Domínio A (Lead × Pesquisa) — analítico agregado, sem PII, lido das views:
//   vw_ficha_respostas_por_dia · vw_ficha_cobertura · vw_ficha_distribuicao_por_tag
// Regra oficial: interseção raw_ac_contato × raw_ficha_resposta por email_normalizado.

export interface DiaRow {
  turmaSlug: string | null;
  turmaNome: string | null;
  dia: string; // YYYY-MM-DD
  respostas: number;
}

export interface CoberturaRow {
  turmaSlug: string | null;
  turmaNome: string | null;
  totalLeads: number;
  responderam: number;
  naoResponderam: number;
  pctResposta: number;
  respostasForaDaBase: number | null; // só no total geral
  totalRespostasFicha: number | null; // só no total geral
}

export interface DistRow {
  turmaSlug: string | null;
  turmaNome: string | null;
  campo: string;
  valor: string;
  respondentes: number;
}

export interface FichaAnalyticsData {
  respostasPorDia: DiaRow[];
  cobertura: CoberturaRow[];
  distribuicao: DistRow[];
}

function toNum(v: number | string | null): number {
  return typeof v === "number" ? v : Number(v ?? 0);
}
function toNumOrNull(v: number | string | null): number | null {
  return v === null || v === undefined ? null : toNum(v);
}

export async function fetchFichaAnalytics(): Promise<FichaAnalyticsData> {
  const [dia, cob, dist] = await Promise.all([
    supabase.from("vw_ficha_respostas_por_dia").select("turma_slug, turma_nome, dia, respostas"),
    supabase
      .from("vw_ficha_cobertura")
      .select(
        "turma_slug, turma_nome, total_leads, responderam, nao_responderam, pct_resposta, respostas_fora_da_base, total_respostas_ficha"
      ),
    supabase.from("vw_ficha_distribuicao_por_tag").select("turma_slug, turma_nome, campo, valor, respondentes"),
  ]);

  if (dia.error) throw new Error(`vw_ficha_respostas_por_dia: ${dia.error.message}`);
  if (cob.error) throw new Error(`vw_ficha_cobertura: ${cob.error.message}`);
  if (dist.error) throw new Error(`vw_ficha_distribuicao_por_tag: ${dist.error.message}`);

  return {
    respostasPorDia: (dia.data ?? []).map((r: any) => ({
      turmaSlug: r.turma_slug,
      turmaNome: r.turma_nome,
      dia: r.dia,
      respostas: toNum(r.respostas),
    })),
    cobertura: (cob.data ?? []).map((r: any) => ({
      turmaSlug: r.turma_slug,
      turmaNome: r.turma_nome,
      totalLeads: toNum(r.total_leads),
      responderam: toNum(r.responderam),
      naoResponderam: toNum(r.nao_responderam),
      pctResposta: toNum(r.pct_resposta),
      respostasForaDaBase: toNumOrNull(r.respostas_fora_da_base),
      totalRespostasFicha: toNumOrNull(r.total_respostas_ficha),
    })),
    distribuicao: (dist.data ?? []).map((r: any) => ({
      turmaSlug: r.turma_slug,
      turmaNome: r.turma_nome,
      campo: r.campo,
      valor: r.valor,
      respondentes: toNum(r.respondentes),
    })),
  };
}
