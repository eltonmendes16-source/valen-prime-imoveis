"use client";
import { useState } from "react";
import { Mail } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const TEXTO = "Concordo em receber o boletim da Valen Prime Imóveis por e-mail, com novidades de lançamentos e mercado. Posso cancelar quando quiser, por um link em cada e-mail.";

export function BoletimForm({ id = "boletim", titulo = "Receba o boletim por e-mail" }: { id?: string; titulo?: string }) {
  const [estado, setEstado] = useState<"" | "enviando" | "ok" | "erro">("");
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("site_url")) return;
    setEstado("enviando");
    const sb = getSupabase();
    if (!sb) { setEstado("erro"); return; }
    const { data, error } = await sb.rpc("inscrever_boletim", { p_email: String(f.get("email") || ""), p_nome: String(f.get("nome") || ""), p_texto: TEXTO });
    setEstado(!error && data ? "ok" : "erro");
  }
  if (estado === "ok") return <div className="rounded-md border border-gold/40 bg-white p-6 text-charcoal" role="status"><p className="font-serif text-xl font-semibold text-ink">Inscrição registrada!</p><p className="mt-1 text-sm">Você passará a receber o boletim. Em cada e-mail há um link para cancelar quando quiser.</p></div>;
  return (
    <form onSubmit={enviar} id={id} className="rounded-md border border-ink/10 bg-sand p-6">
      <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-charcoal"><Mail size={18} className="text-golddark" /> {titulo}</h3>
      <p className="mt-1 text-sm text-muted">Novidades de lançamentos e mercado, sem exagero. Cancele quando quiser.</p>
      <input type="text" name="site_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor={`${id}-nome`}>Nome (opcional)</label><input id={`${id}-nome`} name="nome" className="field" autoComplete="name" /></div>
        <div><label className="label" htmlFor={`${id}-email`}>E-mail</label><input id={`${id}-email`} name="email" type="email" required className="field" autoComplete="email" /></div>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-muted"><input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" /><span>{TEXTO} Veja a <a href="/privacidade" className="underline">Política de privacidade</a>.</span></label>
      {estado === "erro" && <p role="alert" className="mt-3 text-sm text-red-700">Não consegui registrar agora. Confira o e-mail e tente de novo.</p>}
      <button className="btn btn-gold mt-4 disabled:opacity-60" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Quero receber"}</button>
    </form>
  );
}
