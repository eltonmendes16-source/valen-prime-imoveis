"use client";
import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Scale } from "lucide-react";
import { EmpCard } from "./EmpCard";
import { useFavoritos } from "@/lib/favoritos";
import { EMPS, type Emp } from "@/lib/emp";
import { SITE, whatsappLink } from "@/lib/site";

export function FavoritosLista() {
  const f = useFavoritos();
  const [sel, setSel] = useState<string[]>([]);
  const lista = f.ids.map((id) => EMPS.find((e) => e.id === id)).filter(Boolean) as Emp[];
  const marcar = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-3)));

  if (!lista.length) return (
    <div className="rounded-md border border-ink/10 bg-sand p-8 text-center">
      <p className="text-charcoal/80">Você ainda não salvou nenhum empreendimento. Toque no coração do cartão para guardar aqui.</p>
      <Link href="/imoveis" className="btn btn-gold mt-4 inline-flex">Ver empreendimentos</Link>
    </div>
  );
  const msg = `Olá, ${SITE.consultor}! Salvei estes empreendimentos no site da ${SITE.nome} e gostaria de conversar:\n` + lista.map((e) => `• ${e.nome} (${e.bairro ? e.bairro + ", " : ""}${e.cidade})`).join("\n");
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-gold"><MessageCircle size={16} /> Falar sobre meus favoritos</a>
        {sel.length >= 2
          ? <Link href={`/comparar?ids=${sel.join(",")}`} className="btn btn-line"><Scale size={16} /> Comparar {sel.length} selecionados</Link>
          : <span className="text-sm text-muted">Marque 2 ou 3 para comparar lado a lado.</span>}
        <button className="ml-auto text-xs underline" onClick={() => { f.limpar(); setSel([]); }}>Limpar lista</button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((e) => (
          <div key={e.id}>
            <EmpCard emp={e} />
            <label className="mt-2 flex items-center gap-2 text-sm text-charcoal"><input type="checkbox" checked={sel.includes(e.id)} onChange={() => marcar(e.id)} /> Comparar este</label>
          </div>
        ))}
      </div>
    </>
  );
}
