import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { DepoimentoForm } from "@/components/DepoimentoForm";

export const metadata: Metadata = { title: "Deixe o seu depoimento", description: "Conte como foi o seu atendimento na Valen Prime Imóveis.", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Depoimento" titulo={<>Conte como foi a sua <em>experiência</em></>} texto="Seu texto só é publicado depois da minha conferência e com a sua autorização." />
      <section className="bg-snow py-14"><div className="container-page max-w-2xl"><DepoimentoForm /></div></section>
    </>
  );
}
