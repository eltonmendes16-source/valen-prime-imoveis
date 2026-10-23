import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Chaves públicas por desenho (a segurança vem das regras RLS no banco). Nunca coloque a chave "service_role" aqui.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cliente: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!url || !chave) return null;
  if (!cliente) cliente = createClient(url, chave, { auth: { persistSession: true, autoRefreshToken: true } });
  return cliente;
}
