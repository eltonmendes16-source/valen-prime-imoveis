"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { CIDADES } from "@/lib/emp";

const INTERESSES = [
  "Comprar um lançamento", "Alto padrão", "Médio padrão", "Compactos / Minha Casa Minha Vida", "Locação",
  "Documentação e regularização", "Financiamento", "Avaliação de imóvel", "Parceria (construtora, incorporadora ou corretor)",
];

// Sem servidor: o formulário monta a mensagem e abre o WhatsApp do consultor com os dados preenchidos.
export function LeadForm({ titulo = "Agende uma conversa", subtitulo, interesseInicial, empreendimento, claro = false, id = "contato" }: {
  titulo?: string; subtitulo?: string; interesseInicial?: string; empreendimento?: string; claro?: boolean; id?: string;
}) {
  const [enviado, setEnviado] = useState(false);
  const campo = claro ? "field-light" : "field";
  const rotulo = claro ? "label-light" : "label";
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><label className={rotulo} htmlFor={`${id}-nome`}>Nome</label><input id={`${id}-nome`} name="nome" required className={campo} placeholder="Seu nome" autoComplete="name" /></div>
        <div><label className={rotulo} htmlFor={`${id}-tel`}>Telefone / WhatsApp</label><input id={`${id}-tel`} name="telefone" required inputMode="tel" className={campo} placeholder="(11) 90000-0000" autoComplete="tel" /></div>
        <div><label className={rotulo} htmlFor={`${id}-int`}>Interesse</label>
          <select id={`${id}-int`} name="interesse" className={campo} defaultValue={interesseInicial || INTERESSES[0]}>{INTERESSES.map((i) => <option key={i}>{i}</option>)}</select></div>
        <div><label className={rotulo} htmlFor={`${id}-cid`}>Cidade de interesse</label>
          <select id={`${id}-cid`} name="cidade" className={campo} defaultValue=""><option value="">Qualquer</option>{CIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="sm:col-span-2"><label className={rotulo} htmlFor={`${id}-msg`}>Mensagem (opcional)</label><textarea id={`${id}-msg`} name="mensagem" rows={3} className={campo} placeholder="Conte o que você procura: metragem, faixa de valor, prazo…" /></div>
      </div>
      <label className={`mt-4 flex items-start gap-2 text-xs ${claro ? "text-mutedink" : "text-muted"}`}>
        <input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" />
        <span>Concordo em ser contatado e com o uso dos meus dados para este atendimento, conforme a <a href="/privacidade" className="underline hover:text-golddark">Política de privacidade</a>.</span>
      </label>
      <button type="submit" className="btn btn-gold mt-5 w-full sm:w-auto"><Send size={16} /> Enviar pelo WhatsApp</button>
      {enviado && <p role="status" className="mt-3 text-sm text-golddark">Abrimos o WhatsApp com a sua mensagem. Se não abriu, fale direto no {SITE.telefone}.</p>}
    </form>
  );
}
