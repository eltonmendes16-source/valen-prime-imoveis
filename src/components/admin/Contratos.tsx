"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { STATUS_CONTRATO, atrasado, brl, fmtDia, hojeISO, type Contrato, type Item, type Parcela } from "@/lib/contratos";
import { Aviso, Chip, Vazio } from "./ui";

type Linha = Contrato & { clientes: { nome: string } | null };

export function Contratos({ versao, abrirContrato }: { versao: number; abrirContrato: (id: string) => void }) {
  const [cs, setCs] = useState<Linha[] | null>(null);
  const [itens, setItens] = useState<Pick<Item, "contrato_id" | "tipo" | "prazo" | "concluido_em">[]>([]);
  const [parc, setParc] = useState<Pick<Parcela, "contrato_id" | "vencimento" | "valor" | "pago_em">[]>([]);
  const [filtro, setFiltro] = useState("em_andamento");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    Promise.all([
      sb.from("contratos").select("*, clientes(nome)").order("atualizado_em", { ascending: false }).limit(1000),
      sb.from("contrato_itens").select("contrato_id,tipo,prazo,concluido_em").limit(10000),
      sb.from("contrato_parcelas").select("contrato_id,vencimento,valor,pago_em").limit(10000),
    ]).then(([a, b, p]) => {
      if (!vivo) return;
      const e = a.error || b.error || p.error; if (e) { setErro(e.message); return; }
      setCs(a.data as unknown as Linha[]); setItens(b.data as typeof itens); setParc(p.data as typeof parc);
    });
    return () => { vivo = false; };
  }, [versao]);

  const resumo = useMemo(() => {
    const m = new Map<string, { etapas: number; feitas: number; docsPend: number; atrasos: number; parcAtraso: number; aberto: number }>();
    const get = (id: string) => { if (!m.has(id)) m.set(id, { etapas: 0, feitas: 0, docsPend: 0, atrasos: 0, parcAtraso: 0, aberto: 0 }); return m.get(id)!; };
    itens.forEach((i) => {
      const r = get(i.contrato_id);
      if (i.tipo === "etapa") { r.etapas++; if (i.concluido_em) r.feitas++; }
      else if (!i.concluido_em) r.docsPend++;
      if (atrasado(i.prazo, i.concluido_em)) r.atrasos++;
    });
    parc.forEach((p) => { const r = get(p.contrato_id); if (!p.pago_em) { r.aberto += Number(p.valor); if (p.vencimento < hojeISO()) r.parcAtraso++; } });
    return m;
  }, [itens, parc]);

  if (erro) return <Aviso tipo="erro">{erro}</Aviso>;
  if (!cs) return <p className="text-sm text-muted">Carregando…</p>;
  const lista = cs.filter((c) => !filtro || c.status === filtro);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Contratos</h1>
        <p className="text-sm text-muted">Acompanhe etapas, documentos e parcelas até a entrega das chaves. Para criar um, abra a ficha do cliente e clique em “Criar contrato”.</p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por situação">
        <button onClick={() => setFiltro("")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filtro === "" ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-ink/15"}`}>Todos ({cs.length})</button>
        {STATUS_CONTRATO.map((s) => (
          <button key={s.id} onClick={() => setFiltro(s.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filtro === s.id ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-ink/15"}`}>{s.nome} ({cs.filter((c) => c.status === s.id).length})</button>
        ))}
      </div>
      {lista.length === 0 ? <Vazio>{cs.length === 0 ? "Nenhum contrato ainda. Abra a ficha de um cliente em proposta ou contrato e clique em “Criar contrato”." : "Nenhum contrato nesta situação."}</Vazio> : (
        <div className="space-y-2">
          {lista.map((c) => {
            const r = resumo.get(c.id) || { etapas: 0, feitas: 0, docsPend: 0, atrasos: 0, parcAtraso: 0, aberto: 0 };
            const st = STATUS_CONTRATO.find((s) => s.id === c.status)!;
            const alerta = r.atrasos > 0 || r.parcAtraso > 0;
            return (
              <button key={c.id} onClick={() => abrirContrato(c.id)} className={`block w-full rounded-lg border border-l-4 border-ink/10 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 ${alerta && c.status === "em_andamento" ? "border-l-red-600" : "border-l-gold"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-semibold text-ink">{c.clientes?.nome ?? "Cliente"} <span className="font-normal text-muted">· {[c.empreendimento, c.unidade].filter(Boolean).join(" · ") || "sem empreendimento"}</span></p>
                  <Chip className={st.cor}>{st.nome}</Chip>
                  {r.atrasos > 0 && <Chip className="bg-red-100 text-red-800">{r.atrasos} prazo{r.atrasos > 1 ? "s" : ""} vencido{r.atrasos > 1 ? "s" : ""}</Chip>}
                  {r.parcAtraso > 0 && <Chip className="bg-red-100 text-red-800">{r.parcAtraso} parcela{r.parcAtraso > 1 ? "s" : ""} vencida{r.parcAtraso > 1 ? "s" : ""}</Chip>}
                </div>
                <div className="mt-2 grid gap-2 text-xs text-muted sm:grid-cols-4">
                  <div><p>Valor</p><p className="font-medium text-ink">{brl(c.valor)}</p></div>
                  <div><p>Etapas</p><div className="mt-1 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-gold" style={{ width: r.etapas ? `${(r.feitas / r.etapas) * 100}%` : "0%" }} /></div><p className="mt-0.5">{r.feitas} de {r.etapas}</p></div>
                  <div><p>Documentos pendentes</p><p className="font-medium text-ink">{r.docsPend}</p></div>
                  <div><p>Parcelas em aberto</p><p className="font-medium text-ink">{brl(r.aberto)}</p></div>
                </div>
                <p className="mt-1 text-[11px] text-muted">Atualizado em {fmtDia(c.atualizado_em.slice(0, 10))}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
