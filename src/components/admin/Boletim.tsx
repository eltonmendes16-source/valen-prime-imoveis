"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { fmtData } from "@/lib/crm";

type I = { id: string; email: string; nome: string | null; ativo: boolean; criado_em: string; descadastrado_em: string | null };

export function Boletim() {
  const [l, setL] = useState<I[] | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from("inscritos_boletim").select("id,email,nome,ativo,criado_em,descadastrado_em").order("criado_em", { ascending: false }).limit(2000)
      .then(({ data, error }) => { if (error) setErro(error.message); else setL(data as I[]); });
  }, []);
  const ativos = (l || []).filter((x) => x.ativo);
  function baixar() {
    const linhas = [["email", "nome", "inscrito_em"], ...ativos.map((x) => [x.email, x.nome || "", x.criado_em.slice(0, 10)])];
    const csv = linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "inscritos-boletim.csv"; a.click(); URL.revokeObjectURL(a.href);
  }
  return (
    <section className="mt-6 rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-ink">Inscritos no boletim</h2>
      <p className="text-xs text-muted">Pessoas que se inscreveram sozinhas no site e aceitaram receber e-mails. O envio do boletim será ligado depois que o domínio próprio estiver verificado.</p>
      {erro && <p className="mt-2 text-sm text-red-700">{erro}</p>}
      {!l && !erro && <p className="mt-2 text-sm text-muted">Carregando…</p>}
      {l && (
        <>
          <p className="mt-3 text-sm"><b className="text-2xl text-ink">{ativos.length}</b> ativo(s) · {l.length - ativos.length} cancelado(s)</p>
          {ativos.length > 0 && <>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">{ativos.slice(0, 50).map((x) => <li key={x.id} className="flex justify-between gap-3"><span className="truncate">{x.nome ? `${x.nome} · ` : ""}{x.email}</span><span className="shrink-0 text-xs text-muted">{fmtData(x.criado_em)}</span></li>)}</ul>
            <button className="btn btn-line mt-3" onClick={baixar}>Baixar lista de ativos (CSV)</button>
          </>}
        </>
      )}
    </section>
  );
}
