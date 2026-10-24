import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Calculator, Building2, Home, KeyRound, Mail, MessageCircle, Scale } from "lucide-react";
import { COM_TABELA, EMPS } from "@/lib/emp";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Links", description: "Todos os caminhos da Valen Prime Imóveis em um só lugar.", robots: { index: false, follow: true } };

const REDES: [string, string][] = [["Instagram", SITE.redes.instagram], ["Facebook", SITE.redes.facebook], ["LinkedIn", SITE.redes.linkedin]];

export default function Page() {
  const comTabela = EMPS.filter((e) => COM_TABELA.includes(e.id)).slice(0, 3);
  const itens: { href: string; t: string; d?: string; i: React.ReactNode; externo?: boolean; destaque?: boolean }[] = [
    { href: whatsappLink("Olá, Mendes! Vim pelo link da bio e quero conversar sobre imóveis."), t: "Falar no WhatsApp", d: SITE.telefone, i: <MessageCircle size={18} />, externo: true, destaque: true },
    { href: "/imoveis", t: "Ver lançamentos", d: "Alto padrão, médio padrão e compactos no ABC", i: <Building2 size={18} /> },
    ...comTabela.map((e) => ({ href: `/escolha-sua-unidade/${e.id}`, t: `Tabela de preços · ${e.nome}`, d: "Escolha o andar e simule o fluxo", i: <Calculator size={18} /> })),
    { href: "/#contato", t: "Agendar uma visita", d: "Preencha e receba o retorno pelo WhatsApp", i: <CalendarCheck size={18} /> },
    { href: "/avaliacao-e-consultoria", t: "Avaliar o meu imóvel", d: "Opinião de valor e consultoria", i: <Scale size={18} /> },
    { href: "/ambientes/locacao", t: "Alugar ou anunciar para alugar", i: <KeyRound size={18} /> },
    { href: "/aluguel-ou-comprar", t: "Aluguel ou compra: o que vale mais?", i: <Home size={18} /> },
    { href: "/boletim", t: "Receber o boletim por e-mail", i: <Mail size={18} /> },
  ];
  return (
    <section className="bg-snow py-10">
      <div className="mx-auto max-w-md px-4">
        <div className="text-center"><h1 className="font-serif text-3xl font-semibold text-ink">{SITE.marca}</h1><p className="mt-2 text-sm text-muted">{SITE.slogan} Consultoria e intermediação imobiliária no ABC paulista.</p></div>
        <ul className="mt-8 space-y-3">
          {itens.map((x) => {
            const cls = `flex items-center gap-3 rounded-md border p-4 transition hover:-translate-y-0.5 ${x.destaque ? "border-gold bg-gold text-ink" : "border-ink/10 bg-white text-ink hover:border-gold"}`;
            const corpo = <><span className="text-golddark">{x.i}</span><span className="flex-1"><span className="block font-semibold">{x.t}</span>{x.d && <span className="block text-xs text-mutedink">{x.d}</span>}</span></>;
            return <li key={x.t}>{x.externo ? <a href={x.href} target="_blank" rel="noopener noreferrer" className={cls}>{corpo}</a> : <Link href={x.href} className={cls}>{corpo}</Link>}</li>;
          })}
        </ul>
        <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          {REDES.filter(([, u]) => u).map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a>)}
        </p>
      </div>
    </section>
  );
}
