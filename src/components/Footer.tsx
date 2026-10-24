import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { CIDADES_PAGINA } from "@/lib/emp";

export function Footer() {
  const redes = [
    { t: "Instagram", h: SITE.redes.instagram }, { t: "Facebook", h: SITE.redes.facebook }, { t: "LinkedIn", h: SITE.redes.linkedin },
  ].filter((r) => r.h);
  return (
    <footer className="border-t border-white/10 bg-coal">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">{SITE.descricao}</p>
          {redes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {redes.map((r) => (
                <a key={r.t} href={r.h} target="_blank" rel="noopener noreferrer" className="chip-dark hover:border-gold hover:text-gold">{r.t}</a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="eyebrow mb-4">Imóveis</h3>
          <ul className="space-y-2 text-sm text-paper/85">
            <li><Link href="/imoveis" className="hover:text-gold">Todos os empreendimentos</Link></li>
            <li><Link href="/ambientes/alto-padrao" className="hover:text-gold">Alto padrão</Link></li>
            <li><Link href="/ambientes/medio-padrao" className="hover:text-gold">Médio padrão</Link></li>
            <li><Link href="/ambientes/compactos-mcmv" className="hover:text-gold">Compactos e MCMV</Link></li>
            <li><Link href="/ambientes/locacao" className="hover:text-gold">Locação</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4">Empresa</h3>
          <ul className="space-y-2 text-sm text-paper/85">
            <li><Link href="/servicos" className="hover:text-gold">Serviços</Link></li>
            <li><Link href="/simulador" className="hover:text-gold">Simulador</Link></li>
            <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
            <li><Link href="/parceiros" className="hover:text-gold">Parceiros</Link></li>
            <li><Link href="/sobre" className="hover:text-gold">Sobre</Link></li>
            <li><Link href="/depoimentos" className="hover:text-gold">Depoimentos</Link></li>
            <li><Link href="/aluguel-ou-comprar" className="hover:text-gold">Aluguel ou compra?</Link></li>
            <li><Link href="/perguntas-frequentes" className="hover:text-gold">Compra na planta: perguntas</Link></li>
            <li><Link href="/atualizacoes" className="hover:text-gold">Últimas atualizações</Link></li>
            <li><Link href="/favoritos" className="hover:text-gold">Meus favoritos</Link></li>
            {CIDADES_PAGINA.map((c) => <li key={c.slug}><Link href={`/lancamentos/${c.slug}`} className="hover:text-gold">Lançamentos em {c.nome}</Link></li>)}
            <li><a href={SITE.siteInstitucional} className="hover:text-gold" target="_blank" rel="noopener noreferrer">Valen Prime Strategy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4">Contato</h3>
          <ul className="space-y-2 text-sm text-paper/85">
            <li>{SITE.consultor} · {SITE.cargo}</li>
            <li><a className="hover:text-gold" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.telefone}</a></li>
            {SITE.email && <li><a className="hover:text-gold" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
            <li className="text-muted">ABC paulista · São Paulo</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page space-y-2 py-6 text-xs leading-relaxed text-muted">
          <p>
            {SITE.razaoSocial ? `${SITE.razaoSocial} · ` : ""}{SITE.cnpj ? `CNPJ ${SITE.cnpj} · ` : ""}
            {SITE.creci ? SITE.creci : "CRECI: em processo de registro"}{SITE.cnae ? ` · CNAE ${SITE.cnae}` : ""}
          </p>
          <p>
            Imagens ilustrativas. Valores, metragens e condições são de referência, sujeitos a alteração sem aviso prévio pela incorporadora, e não constituem
            proposta. A simulação é ilustrativa e não garante rentabilidade nem aprovação de crédito.
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <span>© {new Date().getFullYear()} {SITE.nome}</span>
            <Link href="/privacidade" className="hover:text-gold">Política de privacidade</Link>
            <Link href="/termos" className="hover:text-gold">Termos de uso</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
