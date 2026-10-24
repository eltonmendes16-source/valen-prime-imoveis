"use client";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Plus, Trash2, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { PAGAMENTOS } from "@/lib/crm";
import { linkWhatsApp } from "@/lib/telefone";
import { STATUS_CONTRATO, atrasado, brl, fmtDia, hojeISO, somarMeses, type Contrato, type Item, type Parcela } from "@/lib/contratos";
import { Aviso, Chip } from "./ui";

type Comcliente = Contrato & { clientes: { nome: string; celular: string | null; telefone: string | null } | null };

export function ContratoDetalhe({ id, onClose, onChanged, onAbrirCliente }: {
  id: string; onClose: () => void; onChanged: () => void; onAbrirCliente: (clienteId: string) => void;
}) {
  const sb = getSupabase();
  const [c, setC] = useState<Comcliente | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [parc, setParc] = useState<Parcela[]>([]);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [f, setF] = useState({ empreendimento: "", unidade: "", valor: "", forma_pagamento: "", status: "em_andamento", observacoes: "" });
  const [novoItem, setNovoItem] = useState({ nome: "", tipo: "documento", prazo: "" });
  const [novaParc, setNovaParc] = useState({ descricao: "Parcela", vencimento: hojeISO(30), valor: "", qtd: "1" });
  const [confirmaExcluir, setConfirmaExcluir] = useState(false);

  const carregar = useCallback(async () => {
    if (!sb) return;
    const [a, b, p] = await Promise.all([
      sb.from("contratos").select("*, clientes(nome,celular,telefone)").eq("id", id).single(),
      sb.from("contrato_itens").select("*").eq("contrato_id", id).order("tipo", { ascending: true }).order("ordem", { ascending: true }),
      sb.from("contrato_parcelas").select("*").eq("contrato_id", id).order("vencimento", { ascending: true }),
    ]);
    if (a.error) { setErro(a.error.message); return; }
    const k = a.data as unknown as Comcliente;
    setC(k); setItens((b.data as Item[]) || []); setParc((p.data as Parcela[]) || []);
    setF({ empreendimento: k.empreendimento || "", unidade: k.unidade || "", valor: k.valor === null ? "" : String(k.valor).replace(".", ","), forma_pagamento: k.forma_pagamento || "", status: k.status, observacoes: k.observacoes || "" });
  }, [sb, id]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);

  const paraNumero = (s: string) => { const n = Number(s.replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : NaN; };
  const falha = (e: { message: string } | null) => { if (e) setErro(e.message); return !!e; };
  const depois = () => { onChanged(); carregar(); };

  async function salvarDados() {
    if (!sb) return; setErro(""); setOk("");
    const v = f.valor.trim() ? paraNumero(f.valor) : null;
    if (v !== null && Number.isNaN(v)) { setErro("Valor inválido. Use números, ex.: 850000 ou 850.000,00."); return; }
    const { error } = await sb.from("contratos").update({ empreendimento: f.empreendimento.trim() || null, unidade: f.unidade.trim() || null, valor: v, forma_pagamento: f.forma_pagamento || null, status: f.status, observacoes: f.observacoes.trim() || null }).eq("id", id);
    if (!falha(error)) { setOk("Dados do contrato salvos."); depois(); }
  }
  async function alternar(i: Item) {
    if (!sb) return;
    const { error } = await sb.from("contrato_itens").update({ concluido_em: i.concluido_em ? null : new Date().toISOString() }).eq("id", i.id);
    if (!falha(error)) depois();
  }
  async function mudarPrazo(i: Item, v: string) {
    if (!sb) return;
    const { error } = await sb.from("contrato_itens").update({ prazo: v || null }).eq("id", i.id);
    if (!falha(error)) depois();
  }
  async function apagarItem(i: Item) {
    if (!sb) return;
    const { error } = await sb.from("contrato_itens").delete().eq("id", i.id);
    if (!falha(error)) depois();
  }
  async function addItem() {
    if (!sb || novoItem.nome.trim().length < 2) { setErro("Dê um nome ao item (mínimo 2 letras)."); return; }
    setErro("");
    const ordem = Math.max(0, ...itens.filter((i) => i.tipo === novoItem.tipo).map((i) => i.ordem)) + 1;
    const { error } = await sb.from("contrato_itens").insert({ contrato_id: id, tipo: novoItem.tipo, nome: novoItem.nome.trim(), prazo: novoItem.prazo || null, ordem });
    if (!falha(error)) { setNovoItem({ nome: "", tipo: novoItem.tipo, prazo: "" }); depois(); }
  }
  async function addParcelas() {
    if (!sb) return; setErro("");
    const valor = paraNumero(novaParc.valor); const qtd = Math.floor(Number(novaParc.qtd));
    if (Number.isNaN(valor) || valor <= 0) { setErro("Informe o valor da parcela."); return; }
    if (!(qtd >= 1 && qtd <= 600)) { setErro("A quantidade deve ficar entre 1 e 600."); return; }
    const linhas = Array.from({ length: qtd }, (_, k) => ({
      contrato_id: id, descricao: qtd > 1 ? `${novaParc.descricao.trim() || "Parcela"} ${k + 1}/${qtd}` : novaParc.descricao.trim() || "Parcela",
      vencimento: somarMeses(novaParc.vencimento, k), valor,
    }));
    for (let k = 0; k < linhas.length; k += 200) {
      const { error } = await sb.from("contrato_parcelas").insert(linhas.slice(k, k + 200));
      if (falha(error)) return;
    }
    setOk(`${qtd} parcela${qtd > 1 ? "s" : ""} adicionada${qtd > 1 ? "s" : ""}.`); depois();
  }
  async function pagar(p: Parcela) {
    if (!sb) return;
    const { error } = await sb.from("contrato_parcelas").update({ pago_em: p.pago_em ? null : hojeISO() }).eq("id", p.id);
    if (!falha(error)) depois();
  }
  async function apagarParcela(p: Parcela) {
    if (!sb) return;
    const { error } = await sb.from("contrato_parcelas").delete().eq("id", p.id);
    if (!falha(error)) depois();
  }
  async function excluir() {
    if (!sb) return;
    const { error } = await sb.from("contratos").delete().eq("id", id);
    if (!falha(error)) { onChanged(); onClose(); }
  }

  const docsPend = itens.filter((i) => i.tipo === "documento" && !i.concluido_em);
  const tel = c?.clientes?.celular || c?.clientes?.telefone || null;
  const totalParc = parc.reduce((a, p) => a + Number(p.valor), 0);
  const pago = parc.filter((p) => p.pago_em).reduce((a, p) => a + Number(p.valor), 0);
  const vencidas = parc.filter((p) => !p.pago_em && p.vencimento < hojeISO());

  function lembreteDocs() {
    if (!c || !tel) return;
    const nome = c.clientes?.nome.trim().split(/\s+/)[0] || "";
    const msg = `Olá, ${nome}! Aqui é o ${SITE.consultor}, da ${SITE.nome}. Para seguirmos com o seu contrato${c.empreendimento ? ` do ${c.empreendimento}` : ""}, ainda preciso dos seguintes documentos:\n\n${docsPend.map((d) => `• ${d.nome}`).join("\n")}\n\nPode me enviar por aqui mesmo? Obrigado!`;
    window.open(linkWhatsApp(tel, msg), "_blank", "noopener,noreferrer");
  }

  const bloco = (titulo: string, tipo: "etapa" | "documento") => {
    const lista = itens.filter((i) => i.tipo === tipo);
    const feitos = lista.filter((i) => i.concluido_em).length;
    return (
      <section className="rounded-lg border border-ink/10 bg-white p-4" aria-label={titulo}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">{titulo}</h3>
          <span className="text-xs text-muted">{feitos} de {lista.length} concluídos</span>
        </div>
        {lista.length > 0 && <div className="mb-3 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-gold" style={{ width: `${(feitos / lista.length) * 100}%` }} /></div>}
        {lista.length === 0 && <p className="text-sm text-muted">Nenhum item.</p>}
        <ul className="space-y-2">
          {lista.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[#C19A5B]" checked={!!i.concluido_em} onChange={() => alternar(i)} aria-label={`Concluir ${i.nome}`} />
              <span className={`min-w-0 flex-1 ${i.concluido_em ? "text-muted line-through" : "font-medium text-ink"}`}>{i.nome}</span>
              {atrasado(i.prazo, i.concluido_em) && <Chip className="bg-red-100 text-red-800">Atrasado</Chip>}
              <input type="date" value={i.prazo || ""} onChange={(e) => mudarPrazo(i, e.target.value)} className="field !w-36 !px-2 !py-1.5 text-xs" aria-label={`Prazo de ${i.nome}`} />
              <button onClick={() => apagarItem(i)} className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-700" aria-label={`Remover ${i.nome}`}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-snow shadow-2xl" role="dialog" aria-modal="true" aria-label="Contrato">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink/10 bg-snow px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xl font-semibold text-ink">Contrato{c?.empreendimento ? ` · ${c.empreendimento}` : ""}</h2>
            {c && <p className="mt-0.5 text-sm text-muted">Cliente: <button className="font-medium text-golddark underline" onClick={() => onAbrirCliente(c.cliente_id)}>{c.clientes?.nome ?? "ver cliente"}</button></p>}
          </div>
          <button onClick={onClose} className="rounded p-2 hover:bg-gold/15" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {ok && <Aviso tipo="ok">{ok}</Aviso>}
          {!c ? <p className="text-sm text-muted">Carregando…</p> : (
            <>
              <section className="rounded-lg border border-ink/10 bg-white p-4" aria-label="Dados do contrato">
                <h3 className="mb-3 font-serif text-lg font-semibold text-ink">Dados do contrato</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className="label">Empreendimento</span><input className="field" value={f.empreendimento} onChange={(e) => setF({ ...f, empreendimento: e.target.value })} /></label>
                  <label><span className="label">Unidade</span><input className="field" placeholder="Apto 82, Torre B" value={f.unidade} onChange={(e) => setF({ ...f, unidade: e.target.value })} /></label>
                  <label><span className="label">Valor do contrato (R$)</span><input className="field" inputMode="decimal" placeholder="850.000,00" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></label>
                  <label><span className="label">Forma de pagamento</span><select className="field" value={f.forma_pagamento} onChange={(e) => setF({ ...f, forma_pagamento: e.target.value })}>{PAGAMENTOS.map((p) => <option key={p}>{p}</option>)}</select></label>
                  <label><span className="label">Situação</span><select className="field" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{STATUS_CONTRATO.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></label>
                </div>
                <label className="mt-3 block"><span className="label">Observações</span><textarea rows={2} className="field" value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} /></label>
                <button className="btn btn-gold mt-3 !py-2" onClick={salvarDados}>Salvar dados</button>
              </section>

              {bloco("Etapas do contrato", "etapa")}
              {bloco("Documentos", "documento")}
              {docsPend.length > 0 && tel && (
                <button onClick={lembreteDocs} className="btn !bg-[#25D366] text-ink"><MessageCircle size={16} /> Cobrar {docsPend.length} documento{docsPend.length > 1 ? "s" : ""} pendente{docsPend.length > 1 ? "s" : ""} pelo WhatsApp</button>
              )}

              <section className="rounded-lg border border-ink/10 bg-white p-4" aria-label="Adicionar item">
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Adicionar etapa ou documento</h3>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                  <input className="field" placeholder="Nome do item" value={novoItem.nome} onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })} aria-label="Nome do item" />
                  <select className="field" value={novoItem.tipo} onChange={(e) => setNovoItem({ ...novoItem, tipo: e.target.value })} aria-label="Tipo"><option value="documento">Documento</option><option value="etapa">Etapa</option></select>
                  <input type="date" className="field" value={novoItem.prazo} onChange={(e) => setNovoItem({ ...novoItem, prazo: e.target.value })} aria-label="Prazo" />
                  <button className="btn btn-ink !py-2" onClick={addItem}><Plus size={15} /> Adicionar</button>
                </div>
              </section>

              <section className="rounded-lg border border-ink/10 bg-white p-4" aria-label="Parcelas">
                <h3 className="font-serif text-lg font-semibold text-ink">Parcelas e pagamentos</h3>
                {parc.length > 0 && (
                  <dl className="my-3 grid grid-cols-3 gap-3 text-sm">
                    <div><dt className="text-xs text-muted">Total</dt><dd className="font-semibold">{brl(totalParc)}</dd></div>
                    <div><dt className="text-xs text-muted">Pago</dt><dd className="font-semibold text-emerald-800">{brl(pago)}</dd></div>
                    <div><dt className="text-xs text-muted">Em aberto</dt><dd className={`font-semibold ${vencidas.length ? "text-red-700" : ""}`}>{brl(totalParc - pago)}{vencidas.length > 0 && ` (${vencidas.length} vencida${vencidas.length > 1 ? "s" : ""})`}</dd></div>
                  </dl>
                )}
                {parc.length > 0 && (
                  <div className="max-h-72 overflow-y-auto rounded border border-ink/10">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-sand text-xs text-muted"><tr><th className="px-3 py-2">Parcela</th><th className="px-3 py-2">Vencimento</th><th className="px-3 py-2">Valor</th><th className="px-3 py-2">Pago</th><th className="w-8" /></tr></thead>
                      <tbody>
                        {parc.map((p) => (
                          <tr key={p.id} className={`border-t border-ink/10 ${!p.pago_em && p.vencimento < hojeISO() ? "bg-red-50" : ""}`}>
                            <td className="px-3 py-1.5">{p.descricao}</td><td className="px-3 py-1.5">{fmtDia(p.vencimento)}</td><td className="px-3 py-1.5">{brl(Number(p.valor))}</td>
                            <td className="px-3 py-1.5"><input type="checkbox" className="accent-[#C19A5B]" checked={!!p.pago_em} onChange={() => pagar(p)} aria-label={`Marcar ${p.descricao} como paga`} />{p.pago_em && <span className="ml-1 text-[11px] text-muted">{fmtDia(p.pago_em)}</span>}</td>
                            <td><button onClick={() => apagarParcela(p)} className="p-1 text-muted hover:text-red-700" aria-label={`Remover ${p.descricao}`}><Trash2 size={13} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mb-2 mt-4 text-xs text-muted">Para uma série mensal (ex.: 36 parcelas de obra), informe a quantidade: os vencimentos avançam um mês por parcela.</p>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
                  <input className="field" placeholder="Descrição" value={novaParc.descricao} onChange={(e) => setNovaParc({ ...novaParc, descricao: e.target.value })} aria-label="Descrição da parcela" />
                  <input type="date" className="field" value={novaParc.vencimento} onChange={(e) => setNovaParc({ ...novaParc, vencimento: e.target.value })} aria-label="Primeiro vencimento" />
                  <input className="field sm:!w-32" inputMode="decimal" placeholder="Valor (R$)" value={novaParc.valor} onChange={(e) => setNovaParc({ ...novaParc, valor: e.target.value })} aria-label="Valor da parcela" />
                  <input className="field sm:!w-20" inputMode="numeric" placeholder="Qtd" value={novaParc.qtd} onChange={(e) => setNovaParc({ ...novaParc, qtd: e.target.value })} aria-label="Quantidade de parcelas" />
                  <button className="btn btn-ink !py-2" onClick={addParcelas}><Plus size={15} /> Adicionar</button>
                </div>
              </section>

              <section className="border-t border-ink/10 pt-4">
                {!confirmaExcluir ? <button className="inline-flex items-center gap-1.5 text-xs text-red-700 underline" onClick={() => setConfirmaExcluir(true)}><Trash2 size={13} /> Excluir este contrato</button> : (
                  <Aviso tipo="erro">Apaga o contrato, as etapas, os documentos e as parcelas. Não dá para desfazer.
                    <div className="mt-2 flex gap-2"><button className="btn !bg-red-700 !px-3 !py-1.5 text-white" onClick={excluir}>Excluir definitivamente</button><button className="btn btn-line !px-3 !py-1.5" onClick={() => setConfirmaExcluir(false)}>Cancelar</button></div>
                  </Aviso>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
