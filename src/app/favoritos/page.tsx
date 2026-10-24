import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { FavoritosLista } from "@/components/FavoritosLista";

export const metadata: Metadata = { title: "Meus favoritos", robots: { index: false, follow: true } };

export default function Favoritos() {
  return (
    <>
      <PageHero eyebrow="Sua seleção" titulo="Meus favoritos" />
      <section className="bg-snow py-12"><div className="container-page">
        <p className="mb-6 max-w-2xl text-sm text-muted">A lista fica salva só neste aparelho e navegador. Não pedimos cadastro.</p>
        <FavoritosLista />
      </div></section>
    </>
  );
}
