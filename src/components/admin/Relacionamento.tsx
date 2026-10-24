"use client";
import { useEffect, useState } from "react";
import { Cake, Check, HeartHandshake, MessageCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { MARCOS_POSVENDA, numeroWhats, textoAniversario } from "@/lib/crm";
import { linkWhatsApp } from "@/lib/telefone";

type Cli = { id: string; nome: string; celular: string | null; telefone: string | null; data_nascimento: string; base: string; tags: string[] };
type Ctr = { id: string; empreendimento: string | null; concluido_em: string; posvenda_feitos: string[]; clientes: { id: string; nome: string; celular: string | null; telefone: string | null; base: string; tags: string[] } | null };

const primeiro = (n: string) => n.trim().split(/\s+/)[0];
const ymd = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const bloqueado = (c: { base: string; tags: string[] }) => c.base === "bloqueados" || c.tags?.includes("nao_contatar");
const somaDias = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); };

export function Relacionamento({ versao, abrir }: { versao: number; abrir: (id: string) => void }) {
  const [anivs, setAnivs] = useState<(Cli & { quando: number })[]>([]);
  const [pos, setPos] = useState<{ ctr: Ctr; marco: (typeof MARCOS_POSVENDA)[number]; em: string }[]>([]);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    const hoje = ymd(new Date());
    Promise.all([
      sb.from("clientes").select("id,nome,celular,telefone,data_nascimento,base,tags").not("data_nascimento", "is", null).limit(5000),
      sb.from("contratos").select("id,empreendimento,concluido_em,posvenda_feitos,clientes(id,nome,celular,telefone,base,tags)").eq("status", "concluido").not("concluido_em", "is", null).limit(1000),
    ]).then(([a, b]) => {
      if (!vivo) return;
      const ano = Number(hoje.slice(0, 4));
      const lista: (Cli & { quando: number })[] = [];
      ((a.data || []) as Cli[]).forEach((c) => {
        if (bloqueado(c)) return;
        const [, m, d] = c.data_nascimento.split("-");
        let alvo = `${ano}-${m}-${d}`;
        if (alvo < hoje) alvo = `${ano + 1}-${m}-${d}`;
        const dias = Math.round((new Date(alvo + "T12:00:00").getTime() - new Date(hoje + "T12:00:00").getTime()) / 86400000);
        if (dias >= 0 && dias <= 7) lista.push({ ...c, quando: dias });
      });
      setAnivs(lista.sort((x, y) => x.quando - y.quando));
      const p: typeof pos = [];
      ((b.data || []) as unknown as Ctr[]).forEach((ctr) => {
        if (!ctr.clientes || bloqueado(ctr.clientes)) return;
        MARCOS_POSVENDA.forEach((marco) => {
          const em = somaDias(ctr.concluido_em, marco.dias);
          if (em <= hoje && !(ctr.posvenda_feitos || []).includes(marco.id)) p.push({ ctr, marco, em });
        });
      });
      setPos(p.sort((x, y) => x.em.localeCompare(y.em)));
    });
    return () => { vivo = false; };
  }, [versao, recarga]);

  async function feito(ctr: Ctr, marcoId: string) {
    const sb = getSupabase(); if (!sb || !ctr.clientes) return;
    const novos = [...(ctr.posvenda_feitos || []), marcoId];
    await sb.from("contratos").update({ posvenda_feitos: novos }).eq("id", ctr.id);
    await sb.from("interacoes").insert({ cliente_id: ctr.clientes.id, tipo: "sistema", resultado: null, nota: `Pós-venda (${MARCOS_POSVENDA.find((m) => m.id === marcoId)?.nome}) feito` });
    setRecarga((n) => n + 1);
  }

  if (anivs.length === 0 && pos.length === 0) return null;
  const fmt = (iso: string) => iso.split("-").reverse().join("/");
  return (
    <>
      {anivs.length > 0 && (
        <section aria-label="Aniversariantes">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><Cake size={16} className="text-pink-600" />Aniversariantes (hoje e próximos 7 dias) <span className="font-normal text-muted">({anivs.length})</span></h2>
          <div className="space-y-2">
            {anivs.map((c) => {
              const wa = numeroWhats(c);
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-l-4 border-ink/10 border-l-pink-400 bg-white p-3 shadow-sm">
                  <button onClick={() => abrir(c.id)} className="min-w-0 flex-1 text-left"><p className="truncate font-semibold text-ink">{c.nome}</p><p className="text-xs text-muted">{c.quando === 0 ? "Faz aniversário hoje" : c.quando === 1 ? "Amanhã" : `Em ${c.quando} dias`} · {c.data_nascimento.split("-").reverse().slice(0, 2).join("/")}</p></button>
                  {wa && <a href={linkWhatsApp(wa, textoAniversario(primeiro(c.nome)))} target="_blank" rel="noopener noreferrer" className="btn !bg-[#25D366] !px-3 !py-2 text-ink" aria-label={`Parabenizar ${c.nome} no WhatsApp`}><MessageCircle size={15} /> Parabenizar</a>}
                </div>
              );
            })}
          </div>
        </section>
      )}
      {pos.length > 0 && (
        <section aria-label="Pós-venda">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><HeartHandshake size={16} className="text-teal-600" />Pós-venda a fazer <span className="font-normal text-muted">({pos.length})</span></h2>
          <div className="space-y-2">
            {pos.map(({ ctr, marco, em }) => {
              const cl = ctr.clientes!; const wa = numeroWhats(cl);
              return (
                <div key={`${ctr.id}-${marco.id}`} className="flex flex-wrap items-center gap-3 rounded-lg border border-l-4 border-ink/10 border-l-teal-400 bg-white p-3 shadow-sm">
                  <button onClick={() => abrir(cl.id)} className="min-w-0 flex-1 text-left"><p className="truncate font-semibold text-ink">{cl.nome}</p><p className="truncate text-xs text-muted">Contato de {marco.nome} · {ctr.empreendimento ?? "contrato"} · devido desde {fmt(em)}</p></button>
                  {wa && <a href={linkWhatsApp(wa, marco.texto(primeiro(cl.nome), ctr.empreendimento))} target="_blank" rel="noopener noreferrer" className="btn !bg-[#25D366] !px-3 !py-2 text-ink"><MessageCircle size={15} /> WhatsApp</a>}
                  <button onClick={() => feito(ctr, marco.id)} className="btn btn-line !px-3 !py-2"><Check size={15} /> Feito</button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
