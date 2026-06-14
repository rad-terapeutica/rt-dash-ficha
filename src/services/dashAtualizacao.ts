import { supabase } from "./supabaseClient";

// Última atualização REAL do banco (não a hora do cliente).
// Fonte: view public.vw_dash_atualizacao = greatest(max(created_at)) das 3 raw tables.

export interface DashAtualizacao {
  ultima: Date | null;
  ac: Date | null;
  ficha: Date | null;
  comprador: Date | null;
}

const toDate = (v: string | null): Date | null => (v ? new Date(v) : null);

export async function fetchDashAtualizacao(): Promise<DashAtualizacao> {
  const { data, error } = await supabase
    .from("vw_dash_atualizacao")
    .select("ultima_atualizacao, ac_ultima, ficha_ultima, comprador_ultima")
    .single();

  if (error) throw new Error(`vw_dash_atualizacao: ${error.message}`);

  return {
    ultima: toDate(data?.ultima_atualizacao ?? null),
    ac: toDate(data?.ac_ultima ?? null),
    ficha: toDate(data?.ficha_ultima ?? null),
    comprador: toDate(data?.comprador_ultima ?? null),
  };
}
