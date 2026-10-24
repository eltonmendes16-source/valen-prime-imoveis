"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type Atualizacao = { id: string; data: string; empreendimento: string | null; titulo: string; texto: string | null };
const br = (s: string) => s.split("-").reverse().join("/");

export function AtualizacoesLista({ filtroInicial = "" }: { filtroInicial?: string }) {
  const [lista, setLista] = useState<Atualizacao[] | null>(null);
  const [filtro, setFiltro] = useState(filtroInicial);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) { setErro(true); return; }
    sb.from("atualizacoes").select("id,data,empreendimento,titulo,texto").eq("publicado", true).order("data", { ascending: false }).order("criado_em", { ascending: false }).limit(200)
      .then(({ data, error }) => { if (error) setErro(true); else setLista(data as Atualizacao[]); });
  }, []);
  const empreendimentos = useMemo(() => Array.from(new Set((lista || []).map((a) => a.empreendimento).filter(Boolean))) as string[], [lista]);
  const vis = (lista || []).filter((a) => !filtro || a.empreendimento === filtro);
  if (erro) return <p className="rounded bg-sand p-6 text-sm text-mutedink">Não foi possível carregar as atualizações agora. Tente novamente em instantes.</p>;
  if (!lista) return <p className="text-sm text-mutedink">Carregando…</p>;
  return (
    <div>
      {empreendimentos.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por empreendimento">
          {["", ...empreendimentos].map((e) => (
            <button key={e || "todos"} onClick={() => setFiltro(e)} aria-pressed={filtro === e}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${filtro === e ? "border-ink bg-ink text-paper" : "border-ink/20 bg-white text-ink hover:border-gold"}`}>{e || "Todos"}</button>
          ))}
        </div>
      )}
      {vis.length === 0 ? <p className="rounded bg-sand p-6 text-sm text-mutedink">Nenhuma atualização registrada ainda.</p> : (
        <ol className="space-y-5 border-l-2 border-gold/50 pl-5">
          {vis.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide text-mutedink">{br(a.data)}{a.empreendimento ? ` · ${a.empreendimento}` : ""}</p>
              <h2 className="mt-0.5 font-serif text-xl font-semibold text-ink">{a.titulo}</h2>
              {a.texto && <p className="mt-1 whitespace-pre-line text-charcoal/80">{a.texto}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
