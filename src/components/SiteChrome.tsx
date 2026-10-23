"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";

// Em /admin o painel do CRM usa a tela inteira, sem cabeçalho, rodapé nem botão flutuante do site.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const caminho = usePathname() || "";
  if (caminho.startsWith("/admin")) return <main id="conteudo">{children}</main>;
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
