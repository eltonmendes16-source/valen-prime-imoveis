"use client";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { BASES, ETAPAS, ORIGENS, TEMPERATURAS, type Cliente } from "@/lib/crm";
import { Aviso, Vazio } from "./ui";
import { LinhaCliente } from "./LinhaCliente";

const INTELIGENTES = [
  { id: "quentes_parados", nome: "Quentes sem contato há +3 dias" },
  { id: "material_sem_retorno", nome: "Pediram material, retorno vencido" },
  { id: "nao_atendem", nome: "Não atendem (2+ tentativas)" },
  { id: "visita_sem_proposta", nome: "Visita agendada, sem proposta" },
  { id: "novos_parados", nome: "Novos há +1 dia sem contato" },
  { id: "incompletos", nome: "Dados incompletos" },
];
const ATIVAS = "(nao_interessados,bloqueados,arquivados)";
const atras = (dias: number) => new Date(Date.now() - dias * 86400000).toISOString();

export function Clientes({ versao, abrir }: { versao: number; abrir: (id: string, classificar?: boolean) => void }) {
  const [busca, setBusca] = useState("");
  const [q, setQ] = useState("");
  const [base, setBase] = useState("");
  const [mais, setMais] = useState(false);
  const [temp, setTemp] = useState("");
  const [origem, setOrigem] = useState("");
  const [etapa, setEtapa] = useState("");
  const [smart, setSmart] = useState("");
  const [lista, setLista] = useState<Cliente[] | null>(null);
  const [contagem, setContagem] = useState<Record<string, number>>({});
  const [erro, setErro] = useState("");

  useEffect(() => { const t = setTimeout(() => setQ(busca), 300); return () => clearTimeout(t); }, [busca]);

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from("clientes").select("base").limit(10000).then(({ data }) => {
      const m: Record<string, number> = {};
      (data || []).forEach((r: { base: string }) => { m[r.base] = (m[r.base] || 0) + 1; });
      setContagem(m);
    });
  }, [versao]);

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    let consulta = sb.from("clientes").select("*").order("atualizado_em", { ascending: false }).limit(150);
    if (base) consulta = consulta.eq("base", base);
    if (temp) consulta = consulta.eq("temperatura", temp);
    if (origem) consulta = consulta.eq("origem", origem);
    if (etapa) consulta = consulta.eq("etapa", etapa);
    if (smart === "quentes_parados") consulta = consulta.eq("temperatura", "quente").lt("atualizado_em", atras(3)).not("base", "in", ATIVAS);
    if (smart === "material_sem_retorno") consulta = consulta.eq("base", "interessados").eq("etapa", "interessado").lt("proximo_contato", new Date().toISOString());
    if (smart === "nao_atendem") consulta = consulta.gte("tentativas_sem_resposta", 2).not("base", "in", ATIVAS);
    if (smart === "visita_sem_proposta") consulta = consulta.eq("etapa", "visita_agendada");
    if (smart === "novos_parados") consulta = consulta.eq("base", "novos").lt("criado_em", atras(1));
    if (smart === "incompletos") consulta = consulta.or("email.is.null,endereco.is.null,telefone.is.null,celular.is.null");
    const termo = q.trim().replace(/[,()%*]/g, " ");
    if (termo) {
      const digitos = termo.replace(/\D/g, "");
      const partes = [`nome.ilike.%${termo}%`, `email.ilike.%${termo}%`, `empreendimento_interesse.ilike.%${termo}%`];
      if (digitos.length >= 4) partes.push(`celular.ilike.%${digitos}%`, `telefone.ilike.%${digitos}%`);
      consulta = consulta.or(partes.join(","));
    }
    consulta.then(({ data, error }) => { if (!vivo) return; if (error) setErro(error.message); else { setErro(""); setLista((data as Cliente[]) || []); } });
    return () => { vivo = false; };
  }, [q, base, temp, origem, etapa, smart, versao]);

  const total = Object.values(contagem).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field !pl-9" placeholder="Buscar por nome, telefone, e-mail ou empreendimento" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar clientes" />
        </div>
        <button className="btn btn-line !py-2.5" onClick={() => setMais((m) => !m)} aria-expanded={mais}><SlidersHorizontal size={15} /> Mais filtros</button>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por base">
        <button onClick={() => setBase("")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${base === "" ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-ink/15 hover:bg-gold/10"}`}>Todos ({total})</button>
        {BASES.map((b) => (
          <button key={b.id} onClick={() => setBase(b.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${base === b.id ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-ink/15 hover:bg-gold/10"}`}>
            {b.nome} ({contagem[b.id] || 0})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtros inteligentes">
        <span className="mr-1 text-xs font-medium text-muted">Filtros inteligentes:</span>
        {INTELIGENTES.map((f) => (
          <button key={f.id} onClick={() => setSmart(smart === f.id ? "" : f.id)} aria-pressed={smart === f.id}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${smart === f.id ? "bg-gold text-ink" : "bg-goldsoft/40 text-ink hover:bg-goldsoft/70"}`}>{f.nome}</button>
        ))}
      </div>

      {mais && (
        <div className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 sm:grid-cols-3">
          <label><span className="label">Temperatura</span><select className="field" value={temp} onChange={(e) => setTemp(e.target.value)}><option value="">Todas</option>{TEMPERATURAS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
          <label><span className="label">Etapa do funil</span><select className="field" value={etapa} onChange={(e) => setEtapa(e.target.value)}><option value="">Todas</option>{ETAPAS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
          <label><span className="label">Origem</span><select className="field" value={origem} onChange={(e) => setOrigem(e.target.value)}><option value="">Todas</option>{ORIGENS.map((t) => <option key={t}>{t}</option>)}</select></label>
        </div>
      )}

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {!lista ? <p className="text-sm text-muted">Carregando…</p> : lista.length === 0 ? (
        <Vazio>{total === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado com esses filtros."}</Vazio>
      ) : (
        <div className="space-y-2">
          {lista.map((c) => <LinhaCliente key={c.id} c={c} abrir={abrir} />)}
          {lista.length === 150 && <p className="text-center text-xs text-muted">Mostrando os 150 mais recentes. Use a busca para refinar.</p>}
        </div>
      )}
    </div>
  );
}
