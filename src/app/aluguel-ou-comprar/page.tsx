import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { AluguelOuCompra } from "@/components/AluguelOuCompra";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Aluguel ou compra? Calculadora",
  description: "Compare comprar um imóvel financiado com alugar e investir a diferença. Ajuste juros, valorização, aluguel e rendimento e veja o resultado ano a ano.",
  alternates: { canonical: "/aluguel-ou-comprar" },
};

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Ferramenta" titulo={<>Aluguel ou <em>compra?</em></>} texto="Compare, ano a ano, o patrimônio de quem compra financiado com o de quem aluga e investe a diferença. Troque os valores de exemplo pelos seus." />
      <section className="bg-snow py-14"><div className="container-page"><AluguelOuCompra /></div></section>
      <section className="bg-paper py-14"><div className="container-page max-w-2xl"><LeadForm titulo="Quer conversar sobre o seu caso?" subtitulo="Eu ajudo a olhar os números e as opções de imóvel." id="contato-ac" /></div></section>
    </>
  );
}
