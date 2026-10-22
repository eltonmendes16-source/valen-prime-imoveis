"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { SITE, whatsappLink } from "@/lib/site";

const AMB = [
  { href: "/ambientes/alto-padrao", t: "Alto padrão" },
  { href: "/ambientes/medio-padrao", t: "Médio padrão" },
  { href: "/ambientes/compactos-mcmv", t: "Compactos e Minha Casa Minha Vida" },
  { href: "/ambientes/locacao", t: "Locação" },
];
const LINKS = [
  { href: "/servicos", t: "Serviços" },
  { href: "/simulador", t: "Simulador" },
  { href: "/blog", t: "Blog" },
  { href: "/parceiros", t: "Parceiros" },
  { href: "/sobre", t: "Sobre" },
];

export function Header() {
  const [aberto, setAberto] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-snow/90 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Logo claro />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          <div className="group relative">
            <Link href="/imoveis" className="inline-flex items-center gap-1 text-sm text-charcoal/90 hover:text-golddark">
              Imóveis <ChevronDown size={14} />
            </Link>
            <div className="invisible absolute left-0 top-full w-72 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded border border-ink/10 bg-sand p-2 shadow-2xl">
                <Link href="/imoveis" className="block rounded px-3 py-2 text-sm hover:bg-ink/[.03]">Todos os empreendimentos</Link>
                {AMB.map((a) => (
                  <Link key={a.href} href={a.href} className="block rounded px-3 py-2 text-sm text-charcoal/85 hover:bg-ink/[.03] hover:text-golddark">{a.t}</Link>
                ))}
              </div>
            </div>
          </div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-charcoal/90 hover:text-golddark">{l.t}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={whatsappLink("Olá, Mendes! Vim pelo site da Valen Prime Imóveis e gostaria de falar com um consultor.")} target="_blank" rel="noopener noreferrer" className="btn btn-gold hidden sm:inline-flex">Falar com consultor</a>
          <button className="grid h-10 w-10 place-items-center rounded border border-ink/15 lg:hidden" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} aria-label={aberto ? "Fechar menu" : "Abrir menu"}>
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {aberto && (
        <div className="border-t border-ink/10 bg-sand lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label="Menu móvel">
            <Link onClick={() => setAberto(false)} href="/imoveis" className="py-3 text-charcoal">Todos os empreendimentos</Link>
            {AMB.map((a) => (
              <Link key={a.href} onClick={() => setAberto(false)} href={a.href} className="py-2 pl-4 text-sm text-charcoal/75">{a.t}</Link>
            ))}
            {LINKS.map((l) => (
              <Link key={l.href} onClick={() => setAberto(false)} href={l.href} className="border-t border-ink/5 py-3 text-charcoal">{l.t}</Link>
            ))}
            <a href={whatsappLink()} className="btn btn-gold my-3">WhatsApp {SITE.telefone}</a>
          </nav>
        </div>
      )}
    </header>
  );
}
