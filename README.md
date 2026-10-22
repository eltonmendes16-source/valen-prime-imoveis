# Valen Prime Imóveis — site (Next.js 15 + Tailwind)

## Rodar localmente
    npm install
    npm run dev      # http://localhost:3000
    npm run build    # teste de produção

## Publicar na Vercel
1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: Add New → Project → importe o repositório (Next.js é detectado sozinho).
3. Em Settings → Environment Variables, crie `NEXT_PUBLIC_SITE_URL` com o endereço final.
4. Em Settings → Domains, adicione seu domínio.

## O que editar
- `src/lib/site.ts`: CRECI, razão social, CNPJ, CNAE, e-mail, Facebook e Instagram. Campos vazios não aparecem.
- `src/data/empreendimentos.json`: dados e preços de partida (`precoAPartir`, `tabelaData`, `entrega`). Para novas empresas, copie um item e ajuste.
- `public/empreendimentos/<id>/capa.jpg`: foto da fachada (só imagens autorizadas). Sem foto, aparece uma ilustração.
- `src/lib/blog.ts`: artigos (os 3 atuais são rascunhos para revisão; adicione os do LinkedIn).
- `src/lib/emp.ts`: ambientes. Logo: `src/components/Logo.tsx` (monograma provisório).

## Observações
- Os formulários abrem o WhatsApp com a mensagem pronta (sem servidor).
- Privacidade e termos são texto-base: revise com um advogado.
- Preços são de partida, sujeitos a alteração; sem promessa de rentabilidade.
