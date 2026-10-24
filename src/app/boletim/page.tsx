import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BoletimForm } from "@/components/BoletimForm";

export const metadata: Metadata = { title: "Boletim por e-mail", description: "Receba novidades de lançamentos e mercado imobiliário do ABC paulista por e-mail.", alternates: { canonical: "/boletim" } };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Boletim" titulo={<>Novidades no seu <em>e-mail</em></>} texto="Lançamentos, atualizações de tabela e conteúdo de mercado, em poucas linhas." />
      <section className="bg-snow py-16"><div className="container-page max-w-xl"><BoletimForm /></div></section>
    </>
  );
}
