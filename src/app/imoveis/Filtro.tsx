"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmpCard } from "@/components/EmpCard";
import { EMPS, CIDADES } from "@/lib/emp";

export function Filtro() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [seg, setSeg] = useState(sp.get("segmento") || "");
  const [cidade, setCidade] = useState(sp.get("cidade") || "");
  const [quartos, setQuartos] = useState("");
  const [area, setArea] = useState("");
  const [ordem, setOrdem] = useState("nome");
  const lista = useMemo(() => {
    let l = EMPS.filter((e) => {
      if (q && !`${e.nome} ${e.bairro ?? ""} ${e.incorporadora ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (seg && e.segmento !== seg) return false;
      if (cidade && e.cidade !== cidade) return false;
      if (quartos && !e.quartos.includes(quartos)) return false;
      if (area === "ate60" && e.areaMin > 60) return false;
      if (area === "60a100" && (e.areaMax < 60 || e.areaMin > 100)) return false;
      if (area === "100mais" && e.areaMax < 100) return false;
      return true;
    });
    l = [...l].sort((a, b) => ordem === "preco" ? (a.precoAPartir ?? 9e12) - (b.precoAPartir ?? 9e12) : ordem === "area" ? a.areaMin - b.areaMin : a.nome.localeCompare(b.nome));
    return l;
  }, [q, seg, cidade, quartos, area, ordem]);
  return (
    <>
      <div className="mb-10 grid gap-3 rounded-md border border-ink/10 bg-sand p-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2"><label className="label" htmlFor="f-q">Busca</label><input id="f-q" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, bairro ou incorporadora" /></div>
        <div><label className="label" htmlFor="f-s">Ambiente</label><select id="f-s" className="field" value={seg} onChange={(e) => setSeg(e.target.value)}><option value="">Todos</option><option value="alto-padrao">Alto padrão</option><option value="medio">Médio padrão</option><option value="economico">Compactos e MCMV</option></select></div>
        <div><label className="label" htmlFor="f-c">Cidade</label><select id="f-c" className="field" value={cidade} onChange={(e) => setCidade(e.target.value)}><option value="">Todas</option>{CIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="f-d">Dormitórios</label><select id="f-d" className="field" value={quartos} onChange={(e) => setQuartos(e.target.value)}><option value="">Todos</option>{["1", "2", "3", "4"].map((n) => <option key={n}>{n}</option>)}</select></div>
        <div><label className="label" htmlFor="f-a">Metragem</label><select id="f-a" className="field" value={area} onChange={(e) => setArea(e.target.value)}><option value="">Todas</option><option value="ate60">Até 60 m²</option><option value="60a100">60 a 100 m²</option><option value="100mais">Acima de 100 m²</option></select></div>
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" aria-live="polite">{lista.length} empreendimento(s)</p>
        <div className="flex items-center gap-2"><label className="label !mb-0" htmlFor="f-o">Ordenar</label><select id="f-o" className="field !w-auto" value={ordem} onChange={(e) => setOrdem(e.target.value)}><option value="nome">Nome</option><option value="preco">Menor preço</option><option value="area">Menor metragem</option></select></div>
      </div>
      {lista.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{lista.map((e) => <EmpCard key={e.id} emp={e} />)}</div>
        : <p className="rounded border border-ink/10 p-8 text-center text-muted">Nenhum empreendimento com esses filtros. Fale comigo: posso ter opções que ainda não estão no site.</p>}
    </>
  );
}
