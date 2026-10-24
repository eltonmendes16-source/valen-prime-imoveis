"use client";
import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { validarTelefone } from "@/lib/telefone";
import { resumoInteresse } from "@/lib/comportamento";
import { origemParaLead } from "@/lib/origem";

const PERIODOS = ["Manhã (9h às 12h)", "Tarde (13h às 18h)", "Noite, após as 18h"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const br = (s: string) => s.split("-").reverse().join("/");

// Pedido de visita: salva o contato no CRM (com data e período preferidos) e abre o WhatsApp. O consultor confirma o horário.
export function AgendarVisita({ empreendimento, detalhe, id = "agendar-visita" }: { empreendimento: string; detalhe?: string; id?: string }) {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { min, max } = useMemo(() => { const h = new Date(); const a = new Date(h); a.setDate(h.getDate() + 1); const b = new Date(h); b.setDate(h.getDate() + 45); return { min: iso(a), max: iso(b) }; }, []);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("site_url")) return;
    const tel = validarTelefone(String(f.get("telefone") || ""));
    if (!tel.valido) { setErro(`Confira o telefone: ${tel.motivo}. Use DDD + número, ex.: (11) 90000-0000.`); return; }
    const data = String(f.get("data") || ""), periodo = String(f.get("periodo") || "");
    if (!data || data < min || data > max) { setErro("Escolha uma data a partir de amanhã, em até 45 dias."); return; }
    setErro(""); setSalvando(true);
    const quando = `${br(data)} · ${periodo}`;
    const sb = getSupabase();
    if (sb) {
      try {
        sb.from("clientes").insert({
          nome: String(f.get("nome") || "").trim(),
          celular: tel.tipo === "celular" ? tel.digitos : null,
          telefone: tel.tipo === "fixo" ? tel.digitos : null,
          hotfone: tel.tipo === "fixo" ? "telefone" : "celular",
          telefone_valido: true, origem: "site", pagina_origem: window.location.pathname,
          empreendimento_interesse: empreendimento,
          melhor_horario: quando.slice(0, 120),
          comportamento: resumoInteresse(), ...origemParaLead(),
          mensagem_site: `PEDIDO DE VISITA: ${empreendimento}${detalhe ? ` (${detalhe})` : ""} em ${quando}`.slice(0, 1500),
          consentimento: true, consentimento_em: new Date().toISOString(),
          consentimento_texto: "Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site (Política de privacidade).",
        }).then(() => undefined, () => undefined);
      } catch { /* segue para o WhatsApp */ }
    }
    setSalvando(false);
    const linhas = [
      `Olá, ${SITE.consultor}! Quero agendar uma visita pelo site da ${SITE.nome}.`,
      `Empreendimento: ${empreendimento}${detalhe ? ` (${detalhe})` : ""}`,
      `Data preferida: ${br(data)}`, `Período: ${periodo}`, `Nome: ${f.get("nome")}`, `Telefone: ${f.get("telefone")}`,
    ];
    window.open(whatsappLink(linhas.join("\n")), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  return (
    <form onSubmit={enviar} id={id} className="rounded-md border border-ink/10 bg-paper2 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink"><CalendarCheck size={22} /> Agende uma visita</h3>
      <p className="mt-2 text-sm text-mutedink">Escolha o dia e o período que preferir. O consultor confirma o horário com você pelo WhatsApp. O pedido não garante o horário até a confirmação.</p>
      <input type="text" name="site_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className="label-light" htmlFor={`${id}-nome`}>Nome</label><input id={`${id}-nome`} name="nome" required className="field-light" autoComplete="name" /></div>
        <div><label className="label-light" htmlFor={`${id}-tel`}>Telefone / WhatsApp</label><input id={`${id}-tel`} name="telefone" required inputMode="tel" className="field-light" placeholder="(11) 90000-0000" autoComplete="tel" /></div>
        <div><label className="label-light" htmlFor={`${id}-data`}>Data preferida</label><input id={`${id}-data`} name="data" type="date" required min={min} max={max} className="field-light" /></div>
        <div><label className="label-light" htmlFor={`${id}-per`}>Período</label><select id={`${id}-per`} name="periodo" className="field-light">{PERIODOS.map((p) => <option key={p}>{p}</option>)}</select></div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-xs text-mutedink">
        <input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" />
        <span>Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site, conforme a <a href="/privacidade" className="underline hover:text-golddark">Política de privacidade</a>.</span>
      </label>
      {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
      <button type="submit" disabled={salvando} className="btn btn-gold mt-5 w-full sm:w-auto disabled:opacity-60"><CalendarCheck size={16} /> {salvando ? "Enviando…" : "Pedir visita pelo WhatsApp"}</button>
      {enviado && <p role="status" className="mt-3 text-sm text-golddark">Abrimos o WhatsApp com o seu pedido. Se não abriu, fale direto no {SITE.telefone}.</p>}
    </form>
  );
}
