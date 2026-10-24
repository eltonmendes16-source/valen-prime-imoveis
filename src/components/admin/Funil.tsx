"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { DIAS_PROXIMO_ETAPA, ETAPAS, MOTIVOS_PERDA, etapaNome, fmtData } from "@/lib/crm";
import { Aviso, Chip, ChipTemp } from "./ui";

type C = { id: string; nome: string; etapa: string; temperatura: string; empreendimento_interesse: string | null; proximo_contato: string | null; base: string; melhor_horario: string | null; mensagem_site: string | null; pontuacao_site: number };
const LIMITE = 40;

export function Funil({ versao, abrir, onChanged }: { versao: number; abrir: (id: string) => void; onChanged: () => void }) {
  const [cs, setCs] = useState<C[] | null>(null);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);
  const [verTodos, setVerTodos] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    const sb = getSupabase(); if (!sb) return;
    const { data, error } = await sb.from("clientes").select("id,nome,etapa,temperatura,empreendimento_interesse,proximo_contato,base,melhor_horario,mensagem_site,pontuacao_site").neq("base", "bloqueados").order("atualizado_em", { ascending: false }).limit(5000);
    if (error) { setErro(error.message); return; }
    setCs(data as C[]);
  }, []);
  useEffect(() => { carregar(); }, [carregar, versao]);

  const [perda, setPerda] = useState<{ id: string; nome: string } | null>(null);
  const [motivo, setMotivo] = useState(MOTIVOS_PERDA[0]);

  function mover(id: string, etapa: string) {
    const atual = cs?.find((c) => c.id === id);
    if (!atual || atual.etapa === etapa) return;
    if (etapa === "perdido") { setMotivo(MOTIVOS_PERDA[0]); setPerda({ id, nome: atual.nome }); return; }
    aplicarMovimento(id, etapa);
  }

  async function aplicarMovimento(id: string, etapa: string, motivoPerda?: string) {
    const sb = getSupabase(); if (!sb || !cs) return;
    const atual = cs.find((c) => c.id === id);
    if (!atual) return;
    setErro("");
    const antes = cs;
    const up: Record<string, unknown> = { etapa };
    // sugere o próximo contato só se não houver um futuro já marcado
    const dias = DIAS_PROXIMO_ETAPA[etapa];
    const futuro = atual.proximo_contato && new Date(atual.proximo_contato) > new Date();
    let sugerido = "";
    if (dias === null) { up.proximo_contato = null; }
    else if (dias !== undefined && !futuro) {
      const d = new Date(); d.setDate(d.getDate() + dias); d.setHours(10, 0, 0, 0);
      up.proximo_contato = d.toISOString(); sugerido = d.toISOString();
    }
    if (etapa === "perdido") { up.motivo_perda = motivoPerda; up.temperatura = "frio"; }
    if (etapa === "fechado") up.temperatura = "quente";
    setCs(cs.map((c) => (c.id === id ? { ...c, ...up } as C : c)));
    const { error } = await sb.from("clientes").update(up).eq("id", id);
    if (error) { setCs(antes); setErro(`Não consegui mover: ${error.message}`); return; }
    const nota = `Etapa alterada para ${etapaNome(etapa)} (funil)` + (motivoPerda ? `. Motivo: ${motivoPerda}` : "") + (sugerido ? `. Próximo contato sugerido: ${fmtData(sugerido)}` : "");
    await sb.from("interacoes").insert({ cliente_id: id, tipo: "sistema", resultado: null, nota });
    onChanged();
  }

  if (!cs) return erro ? <Aviso tipo="erro">{erro}</Aviso> : <p className="text-sm text-muted">Carregando funil…</p>;

  return (
    <div>
      <div className="mb-3">
        <h1 className="font-serif text-2xl font-semibold text-ink">Funil de vendas</h1>
        <p className="text-sm text-muted">Arraste o cartão para outra coluna ou use a lista “Mover para” no cartão (celular). A mudança fica registrada no histórico do cliente.</p>
      </div>
      {erro && <div className="mb-3"><Aviso tipo="erro">{erro}</Aviso></div>}
      {perda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label="Motivo da perda">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <p className="font-serif text-lg font-semibold text-ink">Mover {perda.nome} para Perdido</p>
            <label className="mt-3 block"><span className="label">Qual o motivo?</span>
              <select className="field" value={motivo} onChange={(e) => setMotivo(e.target.value)}>{MOTIVOS_PERDA.map((m) => <option key={m}>{m}</option>)}</select>
            </label>
            <p className="mt-2 text-xs text-muted">O motivo aparece no painel e ajuda a ver por que se perde cliente.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-line" onClick={() => setPerda(null)}>Cancelar</button>
              <button className="btn btn-gold" onClick={() => { const p = perda; setPerda(null); aplicarMovimento(p.id, "perdido", motivo); }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ETAPAS.map((e) => {
          const lista = cs.filter((c) => c.etapa === e.id);
          const mostrar = verTodos[e.id] ? lista : lista.slice(0, LIMITE);
          return (
            <section key={e.id}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }}
              onDragLeave={() => setSobre((s) => (s === e.id ? null : s))}
              onDrop={(ev) => { ev.preventDefault(); setSobre(null); const id = ev.dataTransfer.getData("text/plain") || arrastando; if (id) mover(id, e.id); setArrastando(null); }}
              className={`w-64 shrink-0 rounded-lg border p-2 transition ${sobre === e.id ? "border-gold bg-gold/10" : "border-ink/10 bg-sand"}`}
              aria-label={`Coluna ${e.nome}`}>
              <h2 className="mb-2 flex items-center justify-between px-1 text-sm font-semibold text-ink">{e.nome}<span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{lista.length}</span></h2>
              <div className="space-y-2">
                {mostrar.map((c) => (
                  <article key={c.id} draggable onDragStart={(ev) => { ev.dataTransfer.setData("text/plain", c.id); setArrastando(c.id); }} onDragEnd={() => setArrastando(null)}
                    className={`cursor-grab rounded-md border border-ink/10 bg-white p-2.5 shadow-sm ${arrastando === c.id ? "opacity-50" : ""}`}>
                    <button onClick={() => abrir(c.id)} className="block w-full text-left">
                      <p className="truncate text-sm font-semibold text-ink">{c.nome}</p>
                      <p className="truncate text-xs text-muted">{c.empreendimento_interesse || "Sem empreendimento"}</p>
                    </button>
                    {c.pontuacao_site > 0 && <p className="mt-1 text-[11px] text-muted">Interesse no site: <b className="text-ink">{c.pontuacao_site}</b>/100</p>}
                    {c.mensagem_site?.startsWith("LOCAÇÃO — PROPRIETÁRIO") && <Chip className="mt-1.5 bg-sky-100 text-sky-900">Proprietário (locação)</Chip>}
                    {c.mensagem_site?.startsWith("LOCAÇÃO — INQUILINO") && <Chip className="mt-1.5 bg-sky-100 text-sky-900">Inquilino (locação)</Chip>}
                    {c.mensagem_site?.startsWith("PEDIDO DE VISITA") && <Chip className="mt-1.5 bg-gold/25 text-ink">Visita: {c.melhor_horario || "a confirmar"}</Chip>}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <ChipTemp t={c.temperatura} />
                      <span className={`text-[11px] ${c.proximo_contato && new Date(c.proximo_contato) < new Date() && c.etapa !== "fechado" && c.etapa !== "perdido" ? "font-semibold text-red-700" : "text-muted"}`}>{c.proximo_contato ? `${new Date(c.proximo_contato) < new Date() && c.etapa !== "fechado" && c.etapa !== "perdido" ? "Atrasado: " : "Contato "}${fmtData(c.proximo_contato)}` : "Sem retorno"}</span>
                    </div>
                    <label className="mt-2 block text-[11px] text-muted">Mover para
                      <select className="field mt-0.5 !py-1 text-xs" value={c.etapa} onChange={(ev) => mover(c.id, ev.target.value)}>
                        {ETAPAS.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                      </select>
                    </label>
                  </article>
                ))}
                {lista.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted">Nenhum cliente</p>}
                {lista.length > LIMITE && !verTodos[e.id] && <button className="w-full text-center text-xs font-medium text-ink underline" onClick={() => setVerTodos({ ...verTodos, [e.id]: true })}>Ver os {lista.length} clientes</button>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
