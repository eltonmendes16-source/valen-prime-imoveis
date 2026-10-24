"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { ETAPAS, etapaNome, fmtData } from "@/lib/crm";
import { Aviso, Chip, ChipTemp } from "./ui";

type C = { id: string; nome: string; etapa: string; temperatura: string; empreendimento_interesse: string | null; proximo_contato: string | null; base: string; melhor_horario: string | null; mensagem_site: string | null };
const LIMITE = 40;

export function Funil({ versao, abrir, onChanged }: { versao: number; abrir: (id: string) => void; onChanged: () => void }) {
  const [cs, setCs] = useState<C[] | null>(null);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);
  const [verTodos, setVerTodos] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    const sb = getSupabase(); if (!sb) return;
    const { data, error } = await sb.from("clientes").select("id,nome,etapa,temperatura,empreendimento_interesse,proximo_contato,base,melhor_horario,mensagem_site").neq("base", "bloqueados").order("atualizado_em", { ascending: false }).limit(5000);
    if (error) { setErro(error.message); return; }
    setCs(data as C[]);
  }, []);
  useEffect(() => { carregar(); }, [carregar, versao]);

  async function mover(id: string, etapa: string) {
    const sb = getSupabase(); if (!sb || !cs) return;
    const atual = cs.find((c) => c.id === id);
    if (!atual || atual.etapa === etapa) return;
    setErro("");
    const antes = cs;
    setCs(cs.map((c) => (c.id === id ? { ...c, etapa } : c)));
    const { error } = await sb.from("clientes").update({ etapa }).eq("id", id);
    if (error) { setCs(antes); setErro(`Não consegui mover: ${error.message}`); return; }
    await sb.from("interacoes").insert({ cliente_id: id, tipo: "sistema", resultado: null, nota: `Etapa alterada para ${etapaNome(etapa)} (funil)` });
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
                    {c.mensagem_site?.startsWith("PEDIDO DE VISITA") && <Chip className="mt-1.5 bg-gold/25 text-ink">Visita: {c.melhor_horario || "a confirmar"}</Chip>}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <ChipTemp t={c.temperatura} />
                      <span className="text-[11px] text-muted">{c.proximo_contato ? `Contato ${fmtData(c.proximo_contato)}` : "Sem retorno"}</span>
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
