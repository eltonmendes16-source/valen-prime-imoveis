"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { CIDADES } from "@/lib/emp";
import { getSupabase } from "@/lib/supabase";
import { validarTelefone } from "@/lib/telefone";
import { resumoInteresse } from "@/lib/comportamento";
import { origemParaLead } from "@/lib/origem";

// Chatbot de triagem com perguntas fixas (sem IA e sem custo): entende o perfil, salva o lead no CRM e libera o WhatsApp.
type Passo = { id: string; pergunta: string; opcoes?: string[]; texto?: "nome" | "telefone" };
const PASSOS: Passo[] = [
  { id: "objetivo", pergunta: `Olá! Sou o assistente da ${SITE.nome}. Em 1 minuto entendo o que você procura e o ${SITE.consultor} retorna pelo WhatsApp. Qual é o seu objetivo?`, opcoes: ["Morar", "Investir", "Alugar", "Só conhecer os lançamentos"] },
  { id: "regiao", pergunta: "Em qual região você procura?", opcoes: [...CIDADES, "Outra ou indiferente"] },
  { id: "dormitorios", pergunta: "Quantos dormitórios?", opcoes: ["1 dormitório", "2 dormitórios", "3 ou mais", "Ainda não sei"] },
  { id: "faixa", pergunta: "Qual a faixa de valor que você tem em mente?", opcoes: ["Até R$ 400 mil", "R$ 400 a 800 mil", "R$ 800 mil a 1,5 milhão", "Acima de R$ 1,5 milhão", "Prefiro conversar"] },
  { id: "pagamento", pergunta: "Como pretende pagar?", opcoes: ["Financiamento", "À vista", "FGTS + financiamento", "Ainda não sei"] },
  { id: "prazo", pergunta: "Para quando você pretende decidir?", opcoes: ["Imediato", "3 a 6 meses", "Mais de 6 meses", "Só pesquisando"] },
  { id: "nome", pergunta: "Perfeito! Como posso te chamar?", texto: "nome" },
  { id: "telefone", pergunta: "Qual o seu WhatsApp, com DDD?", texto: "telefone" },
];

type Msg = { de: "bot" | "voce"; texto: string };

export function ChatTriagem() {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);
  const [resp, setResp] = useState<Record<string, string>>({});
  const [msgs, setMsgs] = useState<Msg[]>([{ de: "bot", texto: PASSOS[0].pergunta }]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [fim, setFim] = useState<"consentimento" | "enviado" | null>(null);
  const fundo = useRef<HTMLDivElement>(null);

  useEffect(() => { fundo.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, fim]);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  function avancar(valor: string, id: string) {
    const novo = { ...resp, [id]: valor };
    setResp(novo);
    const proximo = passo + 1;
    const mensagens: Msg[] = [...msgs, { de: "voce", texto: valor }];
    if (proximo < PASSOS.length) { mensagens.push({ de: "bot", texto: PASSOS[proximo].pergunta }); setPasso(proximo); }
    else { mensagens.push({ de: "bot", texto: `Obrigado, ${novo.nome.split(" ")[0]}! Para eu poder te retornar, preciso da sua autorização para usar seus dados neste atendimento.` }); setFim("consentimento"); }
    setMsgs(mensagens); setTexto(""); setErro("");
  }

  function enviarTexto(e: React.FormEvent) {
    e.preventDefault();
    const p = PASSOS[passo];
    const v = texto.trim();
    if (p.texto === "nome") { if (v.length < 2) { setErro("Digite seu nome."); return; } avancar(v, p.id); }
    else if (p.texto === "telefone") {
      const t = validarTelefone(v);
      if (!t.valido) { setErro(`Confira o número: ${t.motivo}. Exemplo: (11) 90000-0000.`); return; }
      avancar(v, p.id);
    }
  }

  function confirmar() {
    const tel = validarTelefone(resp.telefone || "");
    const sb = getSupabase();
    if (sb && tel.valido) {
      const resumo = `Objetivo: ${resp.objetivo} | Região: ${resp.regiao} | Dormitórios: ${resp.dormitorios} | Faixa: ${resp.faixa} | Pagamento: ${resp.pagamento} | Prazo: ${resp.prazo}`;
      try {
        sb.from("clientes").insert({
          nome: resp.nome.trim(),
          celular: tel.tipo === "celular" ? tel.digitos : null, telefone: tel.tipo === "fixo" ? tel.digitos : null,
          hotfone: tel.tipo === "fixo" ? "telefone" : "celular", telefone_valido: true,
          origem: "chatbot", pagina_origem: window.location.pathname,
          cidade: CIDADES.includes(resp.regiao) ? resp.regiao : null,
          dormitorios: resp.dormitorios === "Ainda não sei" ? null : resp.dormitorios,
          faixa_valor: resp.faixa === "Prefiro conversar" ? null : resp.faixa,
          forma_pagamento: resp.pagamento === "Ainda não sei" ? null : resp.pagamento,
          prazo: resp.prazo, mensagem_site: resumo.slice(0, 1500), comportamento: resumoInteresse(), ...origemParaLead(),
          consentimento: true, consentimento_em: new Date().toISOString(),
          consentimento_texto: "Autorizo o uso dos meus dados, incluindo o resumo das páginas que visitei, para este atendimento (Política de privacidade) — consentimento dado no chatbot do site.",
        }).then(() => undefined, () => undefined);
      } catch { /* o WhatsApp continua disponível */ }
    }
    setMsgs((m) => [...m, { de: "voce", texto: "Autorizo" }, { de: "bot", texto: `Pronto! Recebi suas respostas e o ${SITE.consultor} vai falar com você em breve. Se preferir agilizar, é só chamar pelo WhatsApp.` }]);
    setFim("enviado");
  }

  const mensagemWhats = `Olá, ${SITE.consultor}! Sou ${resp.nome} e conversei com o assistente do site. Objetivo: ${resp.objetivo}. Região: ${resp.regiao}. ${resp.dormitorios}. Faixa: ${resp.faixa}. Pagamento: ${resp.pagamento}. Prazo: ${resp.prazo}.`;
  const atual = PASSOS[passo];

  return (
    <>
      <button onClick={() => setAberto((a) => !a)} aria-expanded={aberto} aria-label={aberto ? "Fechar assistente" : "Abrir assistente"}
        className="fixed bottom-24 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper shadow-2xl transition hover:scale-105">
        {aberto ? <X size={18} /> : <Bot size={18} />}<span className="hidden sm:inline">{aberto ? "Fechar" : "Assistente"}</span>
      </button>
      {aberto && (
        <div role="dialog" aria-label="Assistente da Valen Prime Imóveis" className="fixed bottom-40 right-5 z-40 flex h-[min(520px,calc(100vh-11rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-ink/10 bg-snow shadow-2xl">
          <div className="flex items-center gap-2 border-b border-ink/10 bg-ink px-4 py-3 text-paper">
            <Bot size={18} /><div><p className="text-sm font-semibold leading-none">Assistente {SITE.marca}</p><p className="mt-1 text-[11px] opacity-70">Respostas rápidas, sem compromisso</p></div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.de === "voce" ? "justify-end" : ""}`}>
                <p className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.de === "voce" ? "bg-gold text-ink" : "bg-white text-ink ring-1 ring-ink/10"}`}>{m.texto}</p>
              </div>
            ))}
            {!fim && atual.opcoes && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {atual.opcoes.map((o) => <button key={o} onClick={() => avancar(o, atual.id)} className="rounded-full border border-gold/70 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/15">{o}</button>)}
              </div>
            )}
            {fim === "consentimento" && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-muted">Seus dados (nome, WhatsApp, respostas e o resumo das páginas que você visitou neste site) ficam no sistema da {SITE.nome} e só são usados para este atendimento. Veja a <a href="/privacidade" className="underline">Política de privacidade</a>.</p>
                <button onClick={confirmar} className="btn btn-gold w-full !py-2.5">Autorizo e quero ser contatado</button>
              </div>
            )}
            {fim === "enviado" && <a href={whatsappLink(mensagemWhats)} target="_blank" rel="noopener noreferrer" className="btn w-full !bg-[#25D366] !py-2.5 text-ink">Falar agora pelo WhatsApp</a>}
            <div ref={fundo} />
          </div>
          {!fim && atual.texto && (
            <form onSubmit={enviarTexto} className="border-t border-ink/10 bg-white p-2">
              {erro && <p role="alert" className="px-1 pb-1 text-xs text-red-700">{erro}</p>}
              <div className="flex gap-2">
                <input className="field !py-2.5" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} inputMode={atual.texto === "telefone" ? "tel" : "text"} placeholder={atual.texto === "telefone" ? "(11) 90000-0000" : "Seu nome"} aria-label={atual.texto === "telefone" ? "Seu WhatsApp" : "Seu nome"} autoComplete={atual.texto === "telefone" ? "tel" : "name"} />
                <button className="btn btn-gold !px-3" aria-label="Enviar"><Send size={16} /></button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
