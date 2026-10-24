"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { EMPS } from "@/lib/emp";

export function DepoimentoForm() {
  const [estado, setEstado] = useState<"" | "enviando" | "ok" | "erro">("");
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("site_url")) return;
    const sb = getSupabase(); if (!sb) { setEstado("erro"); return; }
    setEstado("enviando");
    const { error } = await sb.from("depoimentos").insert({
      nome_exibicao: String(f.get("nome")).trim(), texto: String(f.get("texto")).trim(),
      empreendimento: String(f.get("emp") || "") || null, contato: String(f.get("contato") || "").trim() || null,
      origem: "cliente", consentimento: true,
    });
    setEstado(error ? "erro" : "ok");
  }
  if (estado === "ok") return <p role="status" className="rounded border border-gold/40 bg-gold/10 p-6 text-ink">Obrigado! Recebi o seu depoimento. Ele só será publicado depois da minha conferência, e você pode pedir a remoção a qualquer momento.</p>;
  return (
    <form onSubmit={enviar} className="rounded-md border border-ink/10 bg-paper2 p-6 sm:p-8">
      <input type="text" name="site_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label-light" htmlFor="dp-nome">Como quer ser identificado(a)</label><input id="dp-nome" name="nome" required minLength={2} maxLength={60} className="field-light" placeholder="Ex.: Maria S." /><p className="mt-1 text-[11px] text-mutedink">Sugestão: primeiro nome e inicial do sobrenome.</p></div>
        <div><label className="label-light" htmlFor="dp-emp">Empreendimento (opcional)</label><select id="dp-emp" name="emp" className="field-light" defaultValue=""><option value="">Prefiro não indicar</option>{EMPS.map((e) => <option key={e.id}>{e.nome}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label-light" htmlFor="dp-tx">Seu depoimento</label><textarea id="dp-tx" name="texto" required minLength={20} maxLength={600} rows={5} className="field-light" placeholder="Conte como foi o atendimento e o que fez diferença para você." /></div>
        <div className="sm:col-span-2"><label className="label-light" htmlFor="dp-ct">WhatsApp ou e-mail (opcional)</label><input id="dp-ct" name="contato" maxLength={160} className="field-light" /><p className="mt-1 text-[11px] text-mutedink">Não aparece no site. Serve só para eu confirmar que foi você.</p></div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-xs text-mutedink">
        <input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" />
        <span>Autorizo a publicação deste texto e do nome indicado acima no site da Valen Prime Imóveis, e sei que posso pedir a remoção a qualquer momento, conforme a <a href="/privacidade" className="underline hover:text-golddark">Política de privacidade</a>.</span>
      </label>
      {estado === "erro" && <p role="alert" className="mt-3 text-sm text-red-700">Não foi possível enviar agora. Tente de novo em instantes.</p>}
      <button type="submit" disabled={estado === "enviando"} className="btn btn-gold mt-5 disabled:opacity-60"><Send size={16} /> {estado === "enviando" ? "Enviando…" : "Enviar depoimento"}</button>
    </form>
  );
}
