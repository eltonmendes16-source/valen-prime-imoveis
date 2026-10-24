import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { CancelarBoletim } from "@/components/CancelarBoletim";

export const metadata: Metadata = { title: "Cancelar boletim", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Boletim" titulo="Cancelar inscrição" />
      <section className="bg-snow py-16"><div className="container-page max-w-xl"><Suspense><CancelarBoletim /></Suspense></div></section>
    </>
  );
}
