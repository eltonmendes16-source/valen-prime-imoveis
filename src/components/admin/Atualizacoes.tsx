"use client";
import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { EMPS } from "@/lib/emp";
import { Aviso } from "./ui";

type A = { id: string; data: string; empreendimento: string | null; titulo: string; texto: string | null; publicado: boolean };
const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const br = (s: string) => s.split("-").reverse().join("/");

export function Atualizacoes() {
  const [lista, setLista] = useState<A[] | null>(null);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const carregar = useCallback(async () => {
    const sb = getSupabase(); if (!sb) return;
    const { data, error } = await sb.from("atualizacoes").select("*").order("data", { ascending: false }).order("criado_em", { ascending: false }).limit(300);
    if (error) setErro(error.message); else setLista(data as A[]);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sb = getSupabase(); if (!sb) return;
    const f = new FormData(e.currentTarget);
    setSalvando(true); setErro(""); setOk("");
    const { error } = await sb.from("atualizacoes").insert({
      data: String(f.get("data")), empreendimento: String(f.get("emp") || "") || null,
      titulo: String(f.get("titulo")).trim(), texto: String(f.get("texto") || "").trim() || null, publicado: true,
    });
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    setOk("Atualização registrada e já aparece em /atualizacoes."); setFormKey((k) => k + 1); carregar();
  }
  async function alternar(a: A) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from("atualizacoes").update({ publicado: !a.publicado }).eq("id", a.id);
    if (error) setErro(error.message); else carregar();
  }
  async function excluir(a: A) {
    const sb = getSupabase(); if (!sb) return;
    if (!window.confirm(`Excluir "${a.titulo}"?`)) return;
    const { error } = await sb.from("atualizacoes").delete().eq("id", a.id);
    if (error) setErro(error.message); else carregar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Últimas atualizações</h1>
        <p className="text-sm text-muted">Registre aqui mudanças de tabela, preço, condição ou disponibilidade. O que estiver publicado aparece para os clientes na página /atualizacoes do site.</p>
      </div>
      <form key={formKey} onSubmit={salvar} className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-[9rem_1fr]">
        <div><label className="label" htmlFor="at-data">Data</label><input id="at-data" name="data" type="date" required defaultValue={hoje()} className="field" /></div>
        <div><label className="label" htmlFor="at-emp">Empreendimento</label>
          <select id="at-emp" name="emp" className="field" defaultValue=""><option value="">Geral (vários / site)</option>{EMPS.map((e) => <option key={e.id}>{e.nome}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="at-tit">Título</label><input id="at-tit" name="titulo" required maxLength={140} className="field" placeholder="Ex.: Nova tabela de preços publicada" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="at-tx">Detalhes (opcional)</label><textarea id="at-tx" name="texto" rows={3} maxLength={2000} className="field" placeholder="O que mudou, validade, o que confirmar com o incorporador…" /></div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={salvando} className="btn btn-gold !py-2 disabled:opacity-60">{salvando ? "Salvando…" : "Registrar atualização"}</button>
          <p className="text-xs text-muted">Não coloque dados de clientes aqui: o texto é público.</p>
        </div>
      </form>
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {ok && <Aviso tipo="ok">{ok}</Aviso>}
      <ul className="space-y-2">
        {(lista || []).map((a) => (
          <li key={a.id} className={`flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-3 shadow-sm ${a.publicado ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">{br(a.data)}{a.empreendimento ? ` · ${a.empreendimento}` : ""}{a.publicado ? "" : " · oculta"}</p>
              <p className="font-semibold text-ink">{a.titulo}</p>
              {a.texto && <p className="mt-0.5 whitespace-pre-line text-sm text-charcoal/80">{a.texto}</p>}
            </div>
            <button className="btn btn-line !px-2.5 !py-2" onClick={() => alternar(a)} aria-label={a.publicado ? "Ocultar do site" : "Mostrar no site"} title={a.publicado ? "Ocultar do site" : "Mostrar no site"}>{a.publicado ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            <button className="btn btn-line !px-2.5 !py-2 text-red-700" onClick={() => excluir(a)} aria-label="Excluir" title="Excluir"><Trash2 size={15} /></button>
          </li>
        ))}
        {lista && lista.length === 0 && <li className="rounded bg-sand p-6 text-center text-sm text-muted">Nenhuma atualização ainda.</li>}
      </ul>
    </div>
  );
}
