import { createClient } from "@supabase/supabase-js";

// Client read-only para a Dash. Usa apenas a anon key (nunca service_role).
// As tabelas-base (PII) seguem bloqueadas por RLS; o front só lê views agregadas.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidas no .env (com prefixo VITE_)."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
