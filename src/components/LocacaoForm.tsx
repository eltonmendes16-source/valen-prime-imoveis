"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { CIDADES } from "@/lib/emp";
import { getSupabase } from "@/lib/supabase";
import { validarTelefone } from "@/lib/telefone";
import { resumoInteresse } from "@/lib/comportamento";

type Modo = "proprietario" | "inquilino";
const TIPOS = ["Apartamento", "Casa", "Studio / kitnet", "Sala comercial", "Terreno", "Outro"];

/** Dois caminhos: proprietário que quer alugar o imóvel e pessoa que procura imóvel para alugar. */
export function LocacaoForm({ id = "locacao" }: { id?: string }) {
  const [modo, setModo] = useState<Modo>("proprietario");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const dono = modo === "proprietario";

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("site_url")) return;
    const tel = validarTelefone(String(f.get("telefone") || ""));
    if (!tel.valido) { setErro(`Confira o telefone: ${tel.motivo}. Use DDD + número, ex.: (11) 90000-0000.`); return; }
    setErro(""); setSalvando(true);
    const v = (k: string) => String(f.get(k) || "").trim();
    const partes = dono
      ? [`Tipo: ${v("tipo")}`, v("cidade") && `Cidade: ${v("cidade")}`, v("bairro") && `Bairro: ${v("bairro")}`, v("quartos") && `Dormitórios: ${v("quartos")}`, v("area") && `Área: ${v("area")} m²`,
         v("aluguel") && `Aluguel pretendido: R$ ${v("aluguel")}`, v("situacao") && `Situação: ${v("situacao")}`, v("mobiliado") && `Mobiliado: ${v("mobiliado")}`, v("obs") && `Obs.: ${v("obs")}`]
      : [v("tipo") && `Procura: ${v("tipo")}`, v("cidade") && `Cidade: ${v("cidade")}`, v("quartos") && `Dormitórios: ${v("quartos")}`, v("aluguel") && `Até R$ ${v("aluguel")}/mês`, v("obs") && `Obs.: ${v("obs")}`];
    const detalhes = `${dono ? "LOCAÇÃO — PROPRIETÁRIO" : "LOCAÇÃO — INQUILINO"}: ${partes.filter(Boolean).join(" | ")}`.slice(0, 1500);
    const sb = getSupabase();
    if (sb) {
      try {
        sb.from("clientes").insert({
          nome: v("nome"),
          celular: tel.tipo === "celular" ? tel.digitos : null,
          telefone: tel.tipo === "fixo" ? tel.digitos : null,
          hotfone: tel.tipo === "fixo" ? "telefone" : "celular",
          telefone_valido: true, origem: "site", pagina_origem: window.location.pathname,
          empreendimento_interesse: dono ? "Locação (proprietário)" : "Locação (inquilino)",
          comportamento: resumoInteresse(), mensagem_site: detalhes,
          consentimento: true, consentimento_em: new Date().toISOString(),
          consentimento_texto: "Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site (Política de privacidade).",
        }).then(() => undefined, () => undefined);
      } catch { /* segue para o WhatsApp */ }
    }
    setSalvando(false);
    const msg = [`Olá, ${SITE.consultor}! ${dono ? "Quero alugar o meu imóvel" : "Estou procurando um imóvel para alugar"} (pelo site da ${SITE.nome}).`, `Nome: ${v("nome")}`, `Telefone: ${v("telefone")}`, ...partes.filter(Boolean)].join("\n");
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  const abas = (m: Modo, texto: string) => (
    <button type="button" role="tab" aria-selected={modo === m} onClick={() => { setModo(m); setEnviado(false); }}
      className={`flex-1 rounded px-3 py-2 text-sm font-medium ${modo === m ? "bg-ink text-white" : "bg-white text-charcoal border border-ink/15"}`}>{texto}</button>
  );
  return (
    <form onSubmit={enviar} id={id} className="rounded-md border border-ink/10 bg-sand p-6 sm:p-8">
      <h3 className="font-serif text-2xl font-semibold text-charcoal">{dono ? "Quero alugar o meu imóvel" : "Quero alugar um imóvel"}</h3>
      <div role="tablist" aria-label="Tipo de pedido" className="mt-4 flex gap-2">{abas("proprietario", "Sou proprietário")}{abas("inquilino", "Procuro para alugar")}</div>
      <input type="text" name="site_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2" key={modo}>
        <div><label className="label" htmlFor={`${id}-nome`}>Nome</label><input id={`${id}-nome`} name="nome" required className="field" autoComplete="name" /></div>
        <div><label className="label" htmlFor={`${id}-tel`}>Telefone / WhatsApp</label><input id={`${id}-tel`} name="telefone" required inputMode="tel" className="field" placeholder="(11) 90000-0000" autoComplete="tel" /></div>
        <div><label className="label" htmlFor={`${id}-tipo`}>{dono ? "Tipo do imóvel" : "O que procura"}</label><select id={`${id}-tipo`} name="tipo" className="field">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="label" htmlFor={`${id}-cid`}>Cidade</label><select id={`${id}-cid`} name="cidade" className="field"><option value="">Selecione</option>{CIDADES.map((c) => <option key={c}>{c}</option>)}<option>Outra</option></select></div>
        {dono && <div><label className="label" htmlFor={`${id}-bai`}>Bairro</label><input id={`${id}-bai`} name="bairro" className="field" /></div>}
        <div><label className="label" htmlFor={`${id}-q`}>Dormitórios</label><select id={`${id}-q`} name="quartos" className="field"><option value="">—</option><option>Studio</option><option>1</option><option>2</option><option>3</option><option>4 ou mais</option></select></div>
        {dono && <div><label className="label" htmlFor={`${id}-ar`}>Área (m²)</label><input id={`${id}-ar`} name="area" inputMode="numeric" className="field" /></div>}
        <div><label className="label" htmlFor={`${id}-al`}>{dono ? "Aluguel que você espera (R$/mês)" : "Aluguel máximo (R$/mês)"}</label><input id={`${id}-al`} name="aluguel" inputMode="numeric" className="field" placeholder="Ex.: 3500" /></div>
        {dono && <div><label className="label" htmlFor={`${id}-sit`}>Situação atual</label><select id={`${id}-sit`} name="situacao" className="field"><option>Vago</option><option>Ocupado, contrato termina em breve</option><option>Em construção / entrega próxima</option></select></div>}
        {dono && <div><label className="label" htmlFor={`${id}-mob`}>Mobiliado?</label><select id={`${id}-mob`} name="mobiliado" className="field"><option>Não</option><option>Sim</option><option>Semimobiliado</option></select></div>}
        <div className="sm:col-span-2"><label className="label" htmlFor={`${id}-obs`}>Observações (opcional)</label><textarea id={`${id}-obs`} name="obs" rows={3} className="field" placeholder={dono ? "Condomínio, vagas, diferenciais…" : "Prazo, vagas, aceita pets…"} /></div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-xs text-muted"><input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" /><span>Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site (<a href="/privacidade" className="underline">Política de privacidade</a>).</span></label>
      {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
      <button className="btn btn-gold mt-5 w-full disabled:opacity-60" disabled={salvando}><Send size={16} /> Enviar pelo WhatsApp</button>
      {enviado && <p className="mt-3 text-sm text-charcoal/80" role="status">Pedido registrado. Se o WhatsApp não abriu, <a className="underline" href={whatsappLink()} target="_blank" rel="noopener noreferrer">toque aqui</a>.</p>}
    </form>
  );
}
