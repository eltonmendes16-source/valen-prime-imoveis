"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { CIDADES } from "@/lib/emp";
import { getSupabase } from "@/lib/supabase";
import { validarTelefone } from "@/lib/telefone";
import { resumoInteresse } from "@/lib/comportamento";
import { origemParaLead } from "@/lib/origem";

const INTERESSES = [
  "Comprar um lançamento", "Alto padrão", "Médio padrão", "Compactos / Minha Casa Minha Vida", "Locação",
  "Documentação e regularização", "Financiamento", "Avaliação de imóvel", "Consultoria para investidor ou incorporador", "Parceria (construtora, incorporadora ou corretor)",
];

// O formulário salva o contato no CRM (Supabase) e abre o WhatsApp do consultor com os dados preenchidos.
// Se o CRM estiver fora do ar, o WhatsApp abre do mesmo jeito: o cliente nunca fica sem resposta.
export function LeadForm({ titulo = "Agende uma conversa", subtitulo, interesseInicial, empreendimento, mensagemInicial, claro = false, id = "contato" }: {
  mensagemInicial?: string; titulo?: string; subtitulo?: string; interesseInicial?: string; empreendimento?: string; claro?: boolean; id?: string;
}) {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const campo = claro ? "field-light" : "field";
  const rotulo = claro ? "label-light" : "label";
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("site_url")) return; // campo-armadilha para robôs
    const tel = validarTelefone(String(f.get("telefone") || ""));
    if (!tel.valido) { setErro(`Confira o telefone: ${tel.motivo}. Use DDD + número, ex.: (11) 90000-0000.`); return; }
    setErro(""); setSalvando(true);
    const sb = getSupabase();
    if (sb) {
      // Sem "await": o WhatsApp precisa abrir no mesmo clique, senão o navegador bloqueia a janela.
      try {
        const detalhes = [`Interesse: ${f.get("interesse")}`, f.get("cidade") ? `Cidade: ${f.get("cidade")}` : "", f.get("mensagem") ? `Mensagem: ${f.get("mensagem")}` : ""].filter(Boolean).join(" | ");
        sb.from("clientes").insert({
          nome: String(f.get("nome") || "").trim(),
          celular: tel.tipo === "celular" ? tel.digitos : null,
          telefone: tel.tipo === "fixo" ? tel.digitos : null,
          hotfone: tel.tipo === "fixo" ? "telefone" : "celular",
          telefone_valido: true,
          origem: "site", pagina_origem: window.location.pathname,
          empreendimento_interesse: empreendimento || null,
          comportamento: resumoInteresse(), ...origemParaLead(),
          mensagem_site: detalhes.slice(0, 1500),
          consentimento: true, consentimento_em: new Date().toISOString(),
          consentimento_texto: "Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site (Política de privacidade).",
        }).then(() => undefined, () => undefined);
      } catch { /* segue para o WhatsApp mesmo assim */ }
    }
    setSalvando(false);
    const linhas = [
      `Olá, ${SITE.consultor}! Vim pelo site da ${SITE.nome}.`,
      empreendimento ? `Empreendimento de interesse: ${empreendimento}` : "",
      `Nome: ${f.get("nome")}`, `Telefone: ${f.get("telefone")}`,
      `Interesse: ${f.get("interesse")}`, f.get("cidade") ? `Cidade: ${f.get("cidade")}` : "",
      f.get("mensagem") ? `Mensagem: ${f.get("mensagem")}` : "",
    ].filter(Boolean);
    window.open(whatsappLink(linhas.join("\n")), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }
  return (
    <form onSubmit={enviar} id={id} className={`rounded-md border p-6 sm:p-8 ${claro ? "border-ink/10 bg-paper2" : "border-ink/10 bg-sand"}`}>
      <h3 className={`font-serif text-2xl font-semibold ${claro ? "text-ink" : "text-charcoal"}`}>{titulo}</h3>
      {subtitulo && <p className={`mt-2 text-sm ${claro ? "text-mutedink" : "text-muted"}`}>{subtitulo}</p>}
      <input type="text" name="site_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><label className={rotulo} htmlFor={`${id}-nome`}>Nome</label><input id={`${id}-nome`} name="nome" required className={campo} placeholder="Seu nome" autoComplete="name" /></div>
        <div><label className={rotulo} htmlFor={`${id}-tel`}>Telefone / WhatsApp</label><input id={`${id}-tel`} name="telefone" required inputMode="tel" className={campo} placeholder="(11) 90000-0000" autoComplete="tel" /></div>
        <div><label className={rotulo} htmlFor={`${id}-int`}>Interesse</label>
          <select id={`${id}-int`} name="interesse" className={campo} defaultValue={interesseInicial || INTERESSES[0]}>{INTERESSES.map((i) => <option key={i}>{i}</option>)}</select></div>
        <div><label className={rotulo} htmlFor={`${id}-cid`}>Cidade de interesse</label>
          <select id={`${id}-cid`} name="cidade" className={campo} defaultValue=""><option value="">Qualquer</option>{CIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="sm:col-span-2"><label className={rotulo} htmlFor={`${id}-msg`}>Mensagem (opcional)</label><textarea key={mensagemInicial} defaultValue={mensagemInicial} id={`${id}-msg`} name="mensagem" rows={3} className={campo} placeholder="Conte o que você procura: metragem, faixa de valor, prazo…" /></div>
      </div>
      <label className={`mt-4 flex items-start gap-2 text-xs ${claro ? "text-mutedink" : "text-muted"}`}>
        <input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" />
        <span>Concordo em ser contatado e com o uso dos meus dados para este atendimento, incluindo o resumo das páginas que visitei neste site, conforme a <a href="/privacidade" className="underline hover:text-golddark">Política de privacidade</a>.</span>
      </label>
      {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
      <button type="submit" disabled={salvando} className="btn btn-gold mt-5 w-full sm:w-auto disabled:opacity-60"><Send size={16} /> {salvando ? "Enviando…" : "Enviar pelo WhatsApp"}</button>
      {enviado && <p role="status" className="mt-3 text-sm text-golddark">Abrimos o WhatsApp com a sua mensagem. Se não abriu, fale direto no {SITE.telefone}.</p>}
    </form>
  );
}
