"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Secao } from "./Secao";

type D = { id: string; nome_exibicao: string; texto: string; empreendimento: string | null; criado_em: string };

function useDepoimentos(limite: number) {
  const [lista, setLista] = useState<D[] | null>(null);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) { setLista([]); return; }
    sb.from("depoimentos").select("id,nome_exibicao,texto,empreendimento,criado_em").eq("publicado", true).order("criado_em", { ascending: false }).limit(limite)
      .then(({ data, error }) => setLista(error ? [] : (data as D[])));
  }, [limite]);
  return lista;
}

function Cartoes({ lista }: { lista: D[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lista.map((d) => (
        <figure key={d.id} className="flex flex-col rounded-md border border-ink/10 bg-white p-6 shadow-sm">
          <Quote size={22} className="text-gold" aria-hidden="true" />
          <blockquote className="mt-3 flex-1 whitespace-pre-line text-charcoal/85">{d.texto}</blockquote>
          <figcaption className="mt-4 text-sm"><b className="text-ink">{d.nome_exibicao}</b>{d.empreendimento ? <span className="text-muted"> · {d.empreendimento}</span> : null}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Seção da página inicial: só aparece quando há depoimentos publicados e autorizados. */
export function DepoimentosHome() {
  const lista = useDepoimentos(3);
  if (!lista || lista.length === 0) return null;
  return (
    <Secao eyebrow="Depoimentos" titulo={<>O que dizem os <em>clientes</em></>}>
      <Cartoes lista={lista} />
      <p className="mt-8"><Link href="/depoimentos" className="underline">Ver todos os depoimentos</Link></p>
    </Secao>
  );
}

export function DepoimentosPagina() {
  const lista = useDepoimentos(100);
  if (!lista) return <p className="text-sm text-mutedink">Carregando…</p>;
  if (lista.length === 0) return <p className="rounded bg-sand p-6 text-sm text-mutedink">Ainda não há depoimentos publicados. Quando houver, eles aparecem aqui, sempre com a autorização de quem escreveu.</p>;
  return <Cartoes lista={lista} />;
}
