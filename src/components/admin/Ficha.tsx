"use client";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Phone, Trash2, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import {
  BASES, ETAPAS, MODELOS, MOTIVOS_PERDA, RESULTADOS, TEMPERATURAS, aplicarResultado, dadosIncompletos, fmtData,
  numeroPrincipal, numeroWhats, paraInputData, type Cliente, type Interacao, type Resultado,
} from "@/lib/crm";
import { formatarTelefone, linkWhatsApp } from "@/lib/telefone";
import { melhorFaixa, taxaPorFaixa, temperaturaSugerida } from "@/lib/analytics";
import { Aviso, ChipBase, ChipEtapa, ChipTemp } from "./ui";
import { ClienteForm } from "./ClienteForm";

export function Ficha({ id, novo, classificarAberto, onClose, onChanged, onAbrir }: {
  id: string | null; novo: boolean; classificarAberto: boolean; onClose: () => void; onChanged: () => void; onAbrir: (id: string) => void;
}) {
  const sb = getSupabase();
  const [c, setC] = useState<Cliente | null>(null);
  const [hist, setHist] = useState<Interacao[]>([]);
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");
  const [canal, setCanal] = useState<"ligacao" | "whatsapp">("ligacao");
  const [pendente, setPendente] = useState<Resultado | null>(null);
  const [quando, setQuando] = useState(paraInputData());
  const [motivo, setMotivo] = useState(MOTIVOS_PERDA[0]);
  const [modelo, setModelo] = useState(MODELOS[0].id);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [confirmaExcluir, setConfirmaExcluir] = useState(false);

  const carregar = useCallback(async () => {
    if (!sb || !id) return;
    const [a, b] = await Promise.all([
      sb.from("clientes").select("*").eq("id", id).single(),
      sb.from("interacoes").select("*").eq("cliente_id", id).order("criado_em", { ascending: false }).limit(100),
    ]);
    if (a.error) { setErro(a.error.message); return; }
    setC(a.data as Cliente); setHist((b.data as Interacao[]) || []);
  }, [sb, id]);

  useEffect(() => { setC(null); setEditando(false); setPendente(null); setErro(""); setOk(""); setNota(""); setConfirmaExcluir(false); carregar(); }, [carregar]);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);

  async function registrar(tipo: string, resultado: string | null, texto: string | null) {
    if (!sb || !c) return;
    await sb.from("interacoes").insert({ cliente_id: c.id, tipo, resultado, nota: texto });
  }

  async function confirmarResultado(r: Resultado) {
    if (!sb || !c) return;
    setErro(""); setOk("");
    const up = aplicarResultado(c, r, { quando, motivo });
    const { error } = await sb.from("clientes").update(up).eq("id", c.id);
    if (error) { setErro(error.message); return; }
    const destino = BASES.find((b) => b.id === up.base)?.nome;
    const partes = [nota.trim(), destino && destino !== BASES.find((b) => b.id === c.base)?.nome ? `Base: ${destino}` : "", r.pede === "motivo" ? `Motivo: ${motivo}` : "", up.proximo_contato ? `Retorno: ${fmtData(up.proximo_contato as string)}` : ""].filter(Boolean);
    await registrar(canal, r.rotulo, partes.join(" · ") || null);
    setNota(""); setPendente(null); setOk(`Registrado: ${r.rotulo}.`);
    onChanged(); carregar();
  }

  async function escolher(r: Resultado) {
    if (r.pede === "nenhum") await confirmarResultado(r);
    else { setPendente(r); setQuando(paraInputData()); }
  }

  async function salvarNota() {
    if (!nota.trim()) return;
    await registrar("nota", null, nota.trim()); setNota(""); setOk("Anotação salva."); onChanged(); carregar();
  }

  async function mudar(campo: string, valor: string) {
    if (!sb || !c) return;
    const { error } = await sb.from("clientes").update({ [campo]: valor }).eq("id", c.id);
    if (error) { setErro(error.message); return; }
    await registrar("sistema", null, `${campo} alterado para ${valor}`);
    onChanged(); carregar();
  }

  async function agendar(valor: string) {
    if (!sb || !c) return;
    const { error } = await sb.from("clientes").update({ proximo_contato: valor ? new Date(valor).toISOString() : null }).eq("id", c.id);
    if (error) setErro(error.message); else { onChanged(); carregar(); }
  }

  async function abrirWhats() {
    if (!c) return;
    const n = numeroWhats(c); if (!n) return;
    const m = MODELOS.find((x) => x.id === modelo) || MODELOS[0];
    window.open(linkWhatsApp(n, m.texto(c)), "_blank", "noopener,noreferrer");
    await registrar("whatsapp", "Mensagem aberta", m.nome); carregar();
  }

  async function excluir() {
    if (!sb || !c) return;
    const { error } = await sb.from("clientes").delete().eq("id", c.id);
    if (error) { setErro(error.message); return; }
    onChanged(); onClose();
  }

  const bloqueado = c ? c.base === "bloqueados" || c.tags?.includes("nao_contatar") : false;
  const tel = c ? numeroPrincipal(c) : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-snow shadow-2xl" role="dialog" aria-modal="true" aria-label="Ficha do cliente">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink/10 bg-snow px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xl font-semibold text-ink">{novo ? "Novo cliente" : c?.nome ?? "Carregando…"}</h2>
            {c && !novo && <div className="mt-1.5 flex flex-wrap items-center gap-1.5"><ChipBase base={c.base} /><ChipEtapa e={c.etapa} /><ChipTemp t={c.temperatura} /></div>}
          </div>
          <button onClick={onClose} className="rounded p-2 hover:bg-gold/15" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {novo && <ClienteForm onSalvo={(cl) => { onChanged(); onAbrir(cl.id); }} onCancelar={onClose} onAbrirExistente={onAbrir} />}

          {!novo && c && (
            <>
              {erro && <Aviso tipo="erro">{erro}</Aviso>}
              {ok && <Aviso tipo="ok">{ok}</Aviso>}
              {dadosIncompletos(c).length > 0 && <Aviso>Dados incompletos: faltam {dadosIncompletos(c).join(", ")}. Use “Editar dados” para completar.</Aviso>}
              {bloqueado && <Aviso tipo="erro">Este cliente pediu para não ser contatado. Ligações e mensagens estão desativadas.</Aviso>}
              {c.telefone_valido === false && <Aviso>Telefone marcado como inválido. Corrija em “Editar dados”.</Aviso>}

              <section className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 text-sm sm:grid-cols-2">
                <div><p className="label">Telefone principal</p><p className="font-medium">{tel ? formatarTelefone(tel) : "—"}</p></div>
                <div><p className="label">E-mail</p><p className="break-all font-medium">{c.email || "—"}</p></div>
                <div><p className="label">Interesse</p><p className="font-medium">{[c.empreendimento_interesse, c.tipo_imovel, c.dormitorios && `${c.dormitorios} dorm.`].filter(Boolean).join(" · ") || "—"}</p></div>
                <div><p className="label">Origem</p><p className="font-medium">{c.origem}{c.pagina_origem ? ` (${c.pagina_origem})` : ""}</p></div>
                <div><p className="label">Melhor horário</p><p className="font-medium">{c.melhor_horario || "—"}</p></div>
                <div><p className="label">Tentativas sem resposta</p><p className="font-medium">{c.tentativas_sem_resposta}</p></div>
                {(c as unknown as { mensagem_site?: string }).mensagem_site && <div className="sm:col-span-2"><p className="label">Mensagem enviada pelo site</p><p>{(c as unknown as { mensagem_site: string }).mensagem_site}</p></div>}
                {c.observacoes && <div className="sm:col-span-2"><p className="label">Observações</p><p className="whitespace-pre-wrap">{c.observacoes}</p></div>}
              </section>

              <section className="flex flex-wrap items-end gap-2">
                {tel && !bloqueado && <a href={`tel:+55${tel}`} className="btn btn-ink"><Phone size={16} /> Ligar</a>}
                {numeroWhats(c) && !bloqueado && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block"><span className="label">Mensagem pronta</span>
                      <select className="field !py-2.5" value={modelo} onChange={(e) => setModelo(e.target.value)}>{MODELOS.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}</select></label>
                    <button onClick={abrirWhats} className="btn !bg-[#25D366] text-ink"><MessageCircle size={16} /> WhatsApp</button>
                  </div>
                )}
              </section>

              <section aria-label="Inteligência" className="rounded-lg border border-ink/10 bg-white p-4 text-sm">
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Inteligência</h3>
                {(() => {
                  const t = temperaturaSugerida(c, hist);
                  const mf = melhorFaixa(taxaPorFaixa(hist), 2);
                  const ligou = hist.filter((h) => h.tipo === "ligacao").length;
                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="label">Temperatura sugerida</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <ChipTemp t={t.sugerida} />
                          {t.sugerida !== c.temperatura && <button className="text-xs font-medium text-golddark underline" onClick={() => mudar("temperatura", t.sugerida)}>Aplicar</button>}
                          {t.sugerida === c.temperatura && <span className="text-xs text-muted">já aplicada</span>}
                        </div>
                        <p className="mt-1 text-xs text-muted">{t.motivos.length ? `Porque: ${t.motivos.join("; ")}.` : "Ainda sem sinais suficientes."}</p>
                      </div>
                      <div>
                        <p className="label">Melhor horário para ligar</p>
                        {c.melhor_horario && <p className="font-medium">Informado pelo cliente: {c.melhor_horario}</p>}
                        <p className="text-xs text-muted">{mf ? `Pelo histórico, ${mf.faixa} (${mf.taxa}% de atendimento em ${mf.tentativas} ligações).` : `Poucos dados deste cliente (${ligou} ligação${ligou === 1 ? "" : "ões"} registrada${ligou === 1 ? "" : "s"}). Veja o melhor horário geral na aba Painel.`}</p>
                      </div>
                      {c.proximo_contato && (
                        <a className="inline-block text-xs font-medium text-golddark underline" target="_blank" rel="noopener noreferrer"
                          href={(() => {
                            const ini = new Date(c.proximo_contato); const fim = new Date(ini.getTime() + 30 * 60000);
                            const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
                            const detalhes = [numeroPrincipal(c) ? `Telefone: ${formatarTelefone(numeroPrincipal(c))}` : "", c.empreendimento_interesse ? `Interesse: ${c.empreendimento_interesse}` : ""].filter(Boolean).join("\n");
                            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Contato: ${c.nome}`)}&dates=${f(ini)}/${f(fim)}&details=${encodeURIComponent(detalhes)}`;
                          })()}>Adicionar o próximo contato ao Google Agenda</a>
                      )}
                    </div>
                  );
                })()}
              </section>

              <section aria-label="Classificar contato" className={`rounded-lg border bg-white p-4 ${classificarAberto ? "border-gold ring-2 ring-gold/30" : "border-ink/10"}`}>
                <h3 className="font-serif text-lg font-semibold text-ink">Classificar este contato</h3>
                <p className="mb-3 text-xs text-muted">Escolha o resultado. O cliente muda de base e o próximo passo é agendado sozinho.</p>
                <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <textarea className="field" rows={2} placeholder="Anotação do contato (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />
                  <div className="flex gap-1 sm:flex-col">
                    {(["ligacao", "whatsapp"] as const).map((t) => <button key={t} type="button" onClick={() => setCanal(t)} className={`rounded px-3 py-1.5 text-xs font-medium ${canal === t ? "bg-ink text-paper" : "bg-sand text-ink ring-1 ring-ink/15"}`}>{t === "ligacao" ? "Ligação" : "WhatsApp"}</button>)}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {RESULTADOS.map((r) => (
                    <button key={r.id} onClick={() => escolher(r)} title={r.dica}
                      className={`rounded-md border px-3 py-2.5 text-left text-sm font-medium transition hover:-translate-y-0.5 ${r.tom === "bom" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : r.tom === "ruim" ? "border-stone-300 bg-stone-50 text-stone-800" : "border-gold/50 bg-goldsoft/25 text-ink"}`}>
                      {r.rotulo}<span className="mt-0.5 block text-[11px] font-normal opacity-75">{r.dica}</span>
                    </button>
                  ))}
                </div>
                {pendente && (
                  <div className="mt-3 rounded-md border border-gold/50 bg-goldsoft/20 p-3">
                    <p className="mb-2 text-sm font-medium">{pendente.rotulo}</p>
                    {pendente.pede === "data" && <label className="block"><span className="label">Quando retornar?</span><input type="datetime-local" className="field" value={quando} onChange={(e) => setQuando(e.target.value)} /></label>}
                    {pendente.pede === "motivo" && <label className="block"><span className="label">Motivo</span><select className="field" value={motivo} onChange={(e) => setMotivo(e.target.value)}>{MOTIVOS_PERDA.map((m) => <option key={m}>{m}</option>)}</select></label>}
                    <div className="mt-3 flex gap-2"><button className="btn btn-gold !py-2" onClick={() => confirmarResultado(pendente)}>Confirmar</button><button className="btn btn-line !py-2" onClick={() => setPendente(null)}>Cancelar</button></div>
                  </div>
                )}
                <button onClick={salvarNota} disabled={!nota.trim()} className="mt-3 text-xs font-medium text-golddark underline disabled:opacity-40">Salvar só a anotação, sem classificar</button>
              </section>

              <section className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 sm:grid-cols-2" aria-label="Ajustes manuais">
                <label><span className="label">Base</span><select className="field" value={c.base} onChange={(e) => mudar("base", e.target.value)}>{BASES.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}</select></label>
                <label><span className="label">Etapa do funil</span><select className="field" value={c.etapa} onChange={(e) => mudar("etapa", e.target.value)}>{ETAPAS.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}</select></label>
                <label><span className="label">Temperatura</span><select className="field" value={c.temperatura} onChange={(e) => mudar("temperatura", e.target.value)}>{TEMPERATURAS.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}</select></label>
                <label><span className="label">Próximo contato</span>
                  <input type="datetime-local" className="field" value={c.proximo_contato ? paraInputData(c.proximo_contato) : ""} onChange={(e) => agendar(e.target.value)} /></label>
              </section>

              <section>
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Histórico</h3>
                {hist.length === 0 ? <p className="text-sm text-muted">Nenhum registro ainda.</p> : (
                  <ol className="space-y-2 border-l-2 border-gold/40 pl-4">
                    {hist.map((h) => (
                      <li key={h.id} className="text-sm">
                        <p className="text-[11px] text-muted">{fmtData(h.criado_em)} · {h.tipo === "ligacao" ? "Ligação" : h.tipo === "whatsapp" ? "WhatsApp" : h.tipo === "nota" ? "Anotação" : h.tipo === "sistema" ? "Sistema" : h.tipo}</p>
                        {h.resultado && <p className="font-medium text-ink">{h.resultado}</p>}
                        {h.nota && <p className="whitespace-pre-wrap text-ink/80">{h.nota}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="border-t border-ink/10 pt-4">
                {!editando ? <button className="btn btn-line" onClick={() => setEditando(true)}>Editar dados</button> : (
                  <ClienteForm inicial={c} onSalvo={(cl) => { setC(cl); setEditando(false); setOk("Dados salvos."); onChanged(); }} onCancelar={() => setEditando(false)} />
                )}
              </section>

              <section className="border-t border-ink/10 pt-4">
                {!confirmaExcluir ? (
                  <button className="inline-flex items-center gap-1.5 text-xs text-red-700 underline" onClick={() => setConfirmaExcluir(true)}><Trash2 size={13} /> Excluir cliente e todos os dados (LGPD)</button>
                ) : (
                  <Aviso tipo="erro">Esta ação apaga o cliente e o histórico, e não pode ser desfeita.
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
