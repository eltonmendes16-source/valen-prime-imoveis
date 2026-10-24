import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { DepoimentosPagina } from "@/components/DepoimentosLista";

export const metadata: Metadata = { title: "Depoimentos de clientes", description: "Relatos de clientes da Valen Prime Imóveis, publicados com autorização de quem escreveu.", alternates: { canonical: "/depoimentos" } };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Clientes" titulo={<>O que dizem os <em>clientes</em></>} texto="Relatos reais, publicados somente com a autorização de quem escreveu." />
      <section className="bg-snow py-16"><div className="container-page space-y-8">
        <DepoimentosPagina />
        <p className="text-sm text-mutedink">Já foi atendido(a) por mim? <Link href="/depoimento" className="underline">Deixe o seu depoimento</Link>.</p>
      </div></section>
    </>
  );
}
