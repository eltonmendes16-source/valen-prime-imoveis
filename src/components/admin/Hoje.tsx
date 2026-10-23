"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { diasDeAtraso, hojeFim, type Cliente } from "@/lib/crm";
import { Aviso, Vazio, corAtraso } from "./ui";
import { LinhaCliente } from "./LinhaCliente";

function Bloco({ titulo, cor, itens, abrir, vazio, atraso = false }: {
  titulo: string; cor: string; itens: Cliente[]; abrir: (id: string, c?: boolean) => void; vazio: string; atraso?: boolean;
}) {
  return (
    <section aria-label={titulo}>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><span className={`h-2.5 w-2.5 rounded-full ${cor}`} />{titulo} <span className="font-normal text-muted">({itens.length})</span></h2>
      {itens.length === 0 ? <p className="rounded-lg bg-white/60 px-4 py-3 text-sm text-muted">{vazio}</p> : (
        <div className="space-y-2">{itens.map((c) => <LinhaCliente key={c.id} c={c} abrir={abrir} destaque={atraso && c.proximo_contato ? corAtraso(diasDeAtraso(c.proximo_contato)) : ""} />)}</div>
      )}
    </section>
  );
}

export function Hoje({ versao, abrir }: { versao: number; abrir: (id: string, classificar?: boolean) => void }) {
  const [lista, setLista] = useState<Cliente[] | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    sb.from("clientes").select("*")
      .not("base", "in", "(nao_interessados,bloqueados,arquivados,corrigir_dados)")
      .order("proximo_contato", { ascending: true, nullsFirst: false }).limit(1000)
      .then(({ data, error }) => { if (!vivo) return; if (error) setErro(error.message); else setLista((data as Cliente[]) || []); });
    return () => { vivo = false; };
  }, [versao]);

  if (erro) return <Aviso tipo="erro">Não consegui carregar: {erro}</Aviso>;
  if (!lista) return <p className="text-sm text-muted">Carregando…</p>;

  const inicioHoje = new Date(); inicioHoje.setHours(0, 0, 0, 0);
  const fim = hojeFim();
  const atrasados = lista.filter((c) => c.proximo_contato && new Date(c.proximo_contato) < inicioHoje);
  const hoje = lista.filter((c) => c.proximo_contato && new Date(c.proximo_contato) >= inicioHoje && new Date(c.proximo_contato) <= fim);
  const novos = lista.filter((c) => c.base === "novos" && !c.proximo_contato);
  const semPasso = lista.filter((c) => c.base !== "novos" && c.base !== "frios" && !c.proximo_contato);

  const resumo = [
    { n: novos.length, t: "Novos para contatar", c: "text-sky-800" },
    { n: hoje.length, t: "Para hoje", c: "text-emerald-800" },
    { n: atrasados.length, t: "Em atraso", c: "text-red-700" },
    { n: semPasso.length, t: "Sem próximo passo", c: "text-amber-800" },
  ];

  if (lista.length === 0) {
    return <Vazio>Nenhum cliente ainda. Cadastre o primeiro em “Novo cliente”, importe uma planilha ou aguarde os contatos do site.</Vazio>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {resumo.map((r) => (
          <div key={r.t} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
            <p className={`font-serif text-3xl font-semibold ${r.c}`}>{r.n}</p>
            <p className="mt-1 text-xs text-muted">{r.t}</p>
          </div>
        ))}
      </div>
      <Bloco titulo="Novos contatos do site e cadastros" cor="bg-sky-500" itens={novos} abrir={abrir} vazio="Nenhum contato novo aguardando." />
      <Bloco titulo="Retornos de hoje" cor="bg-emerald-500" itens={hoje} abrir={abrir} vazio="Nada agendado para hoje." />
      <Bloco titulo="Em atraso" cor="bg-red-500" itens={atrasados} abrir={abrir} vazio="Nenhum retorno atrasado." atraso />
      <Bloco titulo="Sem próximo passo" cor="bg-amber-500" itens={semPasso} abrir={abrir} vazio="Todos os clientes têm um próximo passo." />
    </div>
  );
}
