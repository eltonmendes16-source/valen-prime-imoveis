"use client";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSupabase } from "@/lib/supabase";
import { nomeRede } from "@/lib/origem";

type R = { total: number; por_dia: { dia: string; v: number }[]; paginas: { caminho: string; v: number }[]; origens: { origem: string; v: number }[]; aparelhos: { aparelho: string; v: number }[] };

export function VisitasSite() {
  const [dias, setDias] = useState(30);
  const [r, setR] = useState<R | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    setR(null); setErro("");
    sb.rpc("resumo_visitas", { p_dias: dias }).then(({ data, error }) => { if (!vivo) return; if (error) setErro(error.message); else setR(data as R); });
    return () => { vivo = false; };
  }, [dias]);
  const pct = (v: number) => (r && r.total ? `${Math.round((v / r.total) * 100)}%` : "");
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="font-serif text-lg font-semibold text-ink">Visitas ao site</h2><p className="text-xs text-muted">Contagem sem cookies e sem identificar ninguém. Não conta quem recusou o registro no aviso de privacidade.</p></div>
        <select className="field !w-auto" value={dias} onChange={(e) => setDias(Number(e.target.value))} aria-label="Período">
          <option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option>
        </select>
      </div>
      {erro && <p className="mt-3 text-sm text-red-700">{erro}</p>}
      {!r && !erro && <p className="mt-3 text-sm text-muted">Carregando…</p>}
      {r && (r.total === 0
        ? <p className="mt-3 rounded-md bg-sand px-3 py-6 text-center text-sm text-muted">Ainda sem visitas registradas neste período.</p>
        : (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <p className="text-sm text-charcoal"><b className="text-2xl text-ink">{r.total}</b> visualizações de página</p>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <AreaChart data={r.por_dia.map((d) => ({ dia: d.dia.slice(8, 10) + "/" + d.dia.slice(5, 7), v: d.v }))} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000012" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval="preserveStartEnd" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Area type="monotone" dataKey="v" name="Visitas" stroke="#8A672A" fill="#C19A5B55" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div><h3 className="mb-1 text-sm font-semibold text-ink">Páginas mais vistas</h3>
              <ul className="space-y-1 text-sm">{r.paginas.map((p) => <li key={p.caminho} className="flex justify-between gap-3"><span className="truncate text-charcoal">{p.caminho}</span><b>{p.v}</b></li>)}</ul></div>
            <div><h3 className="mb-1 text-sm font-semibold text-ink">De onde vêm</h3>
              <ul className="space-y-1 text-sm">{r.origens.map((o) => <li key={o.origem} className="flex justify-between gap-3"><span className="text-charcoal">{nomeRede(o.origem)}</span><span><b>{o.v}</b> <span className="text-muted">({pct(o.v)})</span></span></li>)}</ul>
              <h3 className="mb-1 mt-4 text-sm font-semibold text-ink">Aparelho</h3>
              <ul className="space-y-1 text-sm">{r.aparelhos.map((a) => <li key={a.aparelho} className="flex justify-between gap-3"><span className="text-charcoal">{a.aparelho === "celular" ? "Celular" : "Computador"}</span><span><b>{a.v}</b> <span className="text-muted">({pct(a.v)})</span></span></li>)}</ul></div>
          </div>
        ))}
    </section>
  );
}
