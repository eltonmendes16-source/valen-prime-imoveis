import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.nome} — ${SITE.slogan}`, template: `%s | ${SITE.nome}` },
  description: SITE.descricao,
  openGraph: { title: SITE.nome, description: SITE.descricao, locale: "pt_BR", type: "website", siteName: SITE.nome },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#FCFBF8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,500&display=swap"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: SITE.nome,
              url: SITE.url,
              telephone: SITE.telefone,
              areaServed: ["Santo André", "São Bernardo do Campo", "São Caetano do Sul"],
              ...(SITE.email ? { email: SITE.email } : {}),
            }),
          }}
        />
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">Ir para o conteúdo</a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
