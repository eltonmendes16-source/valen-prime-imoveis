"use client";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { EMPS } from "@/lib/emp";
import { REDES, limparCampanha } from "@/lib/origem";

const DESTINOS = [
  { rotulo: "Página inicial", caminho: "/" }, { rotulo: "Todos os imóveis", caminho: "/imoveis" }, { rotulo: "Agendar / falar (links da bio)", caminho: "/links" },
  { rotulo: "Avaliação e consultoria", caminho: "/avaliacao-e-consultoria" }, { rotulo: "Locação", caminho: "/ambientes/locacao" }, { rotulo: "Simulador", caminho: "/simulador" },
  { rotulo: "Boletim por e-mail", caminho: "/boletim" }, { rotulo: "Aluguel ou compra?", caminho: "/aluguel-ou-comprar" },
  ...EMPS.map((e) => ({ rotulo: `Empreendimento: ${e.nome}`, caminho: `/empreendimentos/${e.id}` })),
];
const FONTES = REDES.filter((r) => r.id !== "direto" && r.id !== "outros");

/** Monta links com origem e campanha (UTM) para colar na bio ou nas postagens. */
export function GeradorLinks() {
  const [destino, setDestino] = useState("/links");
  const [rede, setRede] = useState("instagram");
  const [campanha, setCampanha] = useState("");
  const [copiado, setCopiado] = useState(false);
  const link = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const camp = limparCampanha(campanha);
    return `${base}${destino}?utm_source=${rede}&utm_medium=social${camp ? `&utm_campaign=${camp}` : ""}`;
  }, [destino, rede, campanha]);
  async function copiar() { try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* ignora */ } }
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm lg:col-span-2">
      <h2 className="font-serif text-lg font-semibold text-ink">Gerador de links por rede</h2>
      <p className="mb-3 text-xs text-muted">Use um link diferente em cada rede e em cada campanha. Assim o CRM mostra de onde veio cada contato.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label" htmlFor="gl-d">Página de destino</label><select id="gl-d" className="field" value={destino} onChange={(e) => setDestino(e.target.value)}>{DESTINOS.map((d) => <option key={d.caminho} value={d.caminho}>{d.rotulo}</option>)}</select></div>
        <div><label className="label" htmlFor="gl-r">Rede onde vai o link</label><select id="gl-r" className="field" value={rede} onChange={(e) => setRede(e.target.value)}>{FONTES.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}</select></div>
        <div><label className="label" htmlFor="gl-c">Campanha (opcional)</label><input id="gl-c" className="field" value={campanha} onChange={(e) => setCampanha(e.target.value)} placeholder="ex.: lancamento-murano-out" /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input readOnly className="field min-w-0 flex-1 font-mono text-xs" value={link} aria-label="Link gerado" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn-gold" onClick={copiar}><Copy size={16} /> {copiado ? "Copiado!" : "Copiar"}</button>
      </div>
    </section>
  );
}
