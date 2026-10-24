"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { brl, fmtDia, hojeISO } from "@/lib/contratos";
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

type AlertaContrato = { chave: string; contratoId: string; titulo: string; detalhe: string; data: string; vencido: boolean };

export function Hoje({ versao, abrir, abrirContrato }: { versao: number; abrir: (id: string, classificar?: boolean) => void; abrirContrato: (id: string) => void }) {
  const [alertas, setAlertas] = useState<AlertaContrato[]>([]);
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

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    const limite = hojeISO(3);
    type Emb = { status: string; empreendimento: string | null; clientes: { nome: string } | null };
    Promise.all([
      sb.from("contrato_itens").select("id,nome,prazo,contrato_id,contratos(status,empreendimento,clientes(nome))").is("concluido_em", null).not("prazo", "is", null).lte("prazo", limite).limit(300),
      sb.from("contrato_parcelas").select("id,descricao,vencimento,valor,contrato_id,contratos(status,empreendimento,clientes(nome))").is("pago_em", null).lte("vencimento", limite).limit(300),
    ]).then(([a, b]) => {
      if (!vivo) return;
      const hoje = hojeISO();
      const lista: AlertaContrato[] = [];
      ((a.data || []) as unknown as { id: string; nome: string; prazo: string; contrato_id: string; contratos: Emb | null }[]).forEach((i) => {
        if (i.contratos?.status !== "em_andamento") return;
        lista.push({ chave: `i${i.id}`, contratoId: i.contrato_id, titulo: `${i.nome}`, detalhe: `${i.contratos.clientes?.nome ?? "Cliente"} · ${i.contratos.empreendimento ?? "contrato"}`, data: i.prazo, vencido: i.prazo < hoje });
      });
      ((b.data || []) as unknown as { id: string; descricao: string; vencimento: string; valor: number; contrato_id: string; contratos: Emb | null }[]).forEach((p) => {
        if (p.contratos?.status !== "em_andamento") return;
        lista.push({ chave: `p${p.id}`, contratoId: p.contrato_id, titulo: `${p.descricao} (${brl(Number(p.valor))})`, detalhe: `${p.contratos.clientes?.nome ?? "Cliente"} · ${p.contratos.empreendimento ?? "contrato"}`, data: p.vencimento, vencido: p.vencimento < hoje });
      });
      setAlertas(lista.sort((x, y) => x.data.localeCompare(y.data)));
    });
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
      {alertas.length > 0 && (
        <section aria-label="Contratos: prazos e parcelas">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Contratos: prazos e parcelas <span className="font-normal text-muted">({alertas.length})</span></h2>
          <div className="space-y-2">
            {alertas.map((a) => (
              <button key={a.chave} onClick={() => abrirContrato(a.contratoId)} className={`flex w-full flex-wrap items-center gap-3 rounded-lg border border-l-4 border-ink/10 bg-white p-3 text-left shadow-sm ${a.vencido ? "border-l-red-600" : "border-l-violet-400"}`}>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-ink">{a.titulo}</p><p className="truncate text-xs text-muted">{a.detalhe}</p></div>
                <p className={`text-xs font-medium ${a.vencido ? "text-red-700" : "text-ink"}`}>{a.vencido ? "Venceu em " : "Vence em "}{fmtDia(a.data)}</p>
              </button>
            ))}
          </div>
        </section>
      )}
      <Bloco titulo="Sem próximo passo" cor="bg-amber-500" itens={semPasso} abrir={abrir} vazio="Todos os clientes têm um próximo passo." />
    </div>
  );
}
