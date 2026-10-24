"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { EMPS } from "@/lib/emp";
import { Aviso } from "./ui";

type D = { id: string; criado_em: string; nome_exibicao: string; texto: string; empreendimento: string | null; origem: string; contato: string | null; publicado: boolean };

export function Depoimentos({ onChanged }: { onChanged?: () => void }) {
  const [lista, setLista] = useState<D[] | null>(null);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [formKey, setFormKey] = useState(0);

  const carregar = useCallback(async () => {
    const sb = getSupabase(); if (!sb) return;
    const { data, error } = await sb.from("depoimentos").select("*").order("criado_em", { ascending: false }).limit(300);
    if (error) setErro(error.message); else setLista(data as D[]);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sb = getSupabase(); if (!sb) return;
    const f = new FormData(e.currentTarget);
    setErro(""); setOk("");
    const { error } = await sb.from("depoimentos").insert({
      nome_exibicao: String(f.get("nome")).trim(), texto: String(f.get("texto")).trim(), empreendimento: String(f.get("emp") || "") || null,
      origem: "cadastro", consentimento: true, publicado: f.get("publicar") === "on",
    });
    if (error) { setErro(error.message); return; }
    setOk("Depoimento salvo."); setFormKey((k) => k + 1); carregar(); onChanged?.();
  }
  async function publicar(d: D, valor: boolean) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from("depoimentos").update({ publicado: valor }).eq("id", d.id);
    if (error) setErro(error.message); else carregar();
  }
  async function excluir(d: D) {
    const sb = getSupabase(); if (!sb) return;
    if (!window.confirm(`Excluir o depoimento de ${d.nome_exibicao}?`)) return;
    const { error } = await sb.from("depoimentos").delete().eq("id", d.id);
    if (error) setErro(error.message); else carregar();
  }
  const pendentes = (lista || []).filter((d) => !d.publicado);
  const publicados = (lista || []).filter((d) => d.publicado);
  const Linha = ({ d }: { d: D }) => (
    <li className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{new Date(d.criado_em).toLocaleDateString("pt-BR")} · {d.origem === "cliente" ? "enviado pelo cliente" : "cadastrado por você"}{d.empreendimento ? ` · ${d.empreendimento}` : ""}{d.contato ? ` · contato: ${d.contato}` : ""}</p>
        <p className="font-semibold text-ink">{d.nome_exibicao}</p>
        <p className="mt-0.5 whitespace-pre-line text-sm text-charcoal/80">{d.texto}</p>
      </div>
      {d.publicado
        ? <button className="btn btn-line !px-2.5 !py-2" onClick={() => publicar(d, false)} aria-label="Tirar do site" title="Tirar do site"><EyeOff size={15} /></button>
        : <button className="btn btn-gold !px-2.5 !py-2" onClick={() => publicar(d, true)} aria-label="Aprovar e publicar" title="Aprovar e publicar"><Check size={15} /></button>}
      <button className="btn btn-line !px-2.5 !py-2 text-red-700" onClick={() => excluir(d)} aria-label="Excluir" title="Excluir"><Trash2 size={15} /></button>
    </li>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Depoimentos</h1>
        <p className="text-sm text-muted">Só vão ao site os que você aprovar. Peça o depoimento ao cliente pelo link <b>/depoimento</b> (ele já autoriza a publicação ao enviar). Nunca cadastre texto escrito por você ou sem autorização.</p>
      </div>
      <form key={formKey} onSubmit={salvar} className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-semibold text-ink">Cadastrar um depoimento que o cliente enviou por outro meio</p>
        <div><label className="label" htmlFor="dm-nome">Nome a exibir</label><input id="dm-nome" name="nome" required minLength={2} maxLength={60} className="field" placeholder="Ex.: Maria S." /></div>
        <div><label className="label" htmlFor="dm-emp">Empreendimento</label><select id="dm-emp" name="emp" className="field" defaultValue=""><option value="">Nenhum</option>{EMPS.map((e) => <option key={e.id}>{e.nome}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="dm-tx">Texto (do jeito que o cliente escreveu)</label><textarea id="dm-tx" name="texto" required minLength={20} maxLength={600} rows={3} className="field" /></div>
        <label className="sm:col-span-2 flex items-start gap-2 text-xs text-muted"><input type="checkbox" required className="mt-0.5 accent-[#C19A5B]" /> Tenho a autorização do cliente, por escrito (mensagem ou e-mail), para publicar este texto e este nome.</label>
        <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" name="publicar" className="accent-[#C19A5B]" /> Publicar já no site</label>
        <div><button type="submit" className="btn btn-gold !py-2">Salvar</button></div>
      </form>
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {ok && <Aviso tipo="ok">{ok}</Aviso>}
      <section><h2 className="mb-2 text-sm font-semibold text-ink">Aguardando aprovação ({pendentes.length})</h2><ul className="space-y-2">{pendentes.map((d) => <Linha key={d.id} d={d} />)}{lista && pendentes.length === 0 && <li className="rounded bg-sand p-4 text-center text-sm text-muted">Nada aguardando.</li>}</ul></section>
      <section><h2 className="mb-2 text-sm font-semibold text-ink">Publicados no site ({publicados.length})</h2><ul className="space-y-2">{publicados.map((d) => <Linha key={d.id} d={d} />)}{lista && publicados.length === 0 && <li className="rounded bg-sand p-4 text-center text-sm text-muted">Nenhum publicado.</li>}</ul></section>
    </div>
  );
}
