// Artigos do blog. Os textos abaixo são RASCUNHOS originais para revisão do consultor.
// Para publicar os artigos do LinkedIn, adicione novos itens neste array (slug, título, data, corpo em parágrafos).
export type Post = { slug: string; titulo: string; resumo: string; categoria: string; leitura: number; data: string; corpo: { h?: string; p: string }[] };

export const POSTS: Post[] = [
  {
    slug: "como-ler-o-fluxo-de-pagamento-de-um-lancamento",
    titulo: "Como ler o fluxo de pagamento de um lançamento",
    resumo: "Ato, mensais, anuais e chaves: o que cada parcela significa e onde mora o custo real.",
    categoria: "Lançamentos", leitura: 5, data: "2026-10-01",
    corpo: [
      { p: "A tabela de um lançamento costuma mostrar um preço e um fluxo: quanto pagar no ato, em parcelas mensais, em reforços anuais e nas chaves. Entender cada bloco evita surpresas ao longo da obra." },
      { h: "Ato e entrada", p: "O ato é o primeiro desembolso, na assinatura. Em muitos lançamentos ele é parte de uma entrada maior, dividida em poucas parcelas iniciais." },
      { h: "Mensais e anuais", p: "Durante a obra, as parcelas mensais e os reforços anuais costumam ser corrigidos por um índice, geralmente o INCC. Isso significa que o valor nominal sobe com o tempo, mesmo com o preço combinado." },
      { h: "Chaves e financiamento", p: "Na entrega, o saldo devedor é quitado com recursos próprios ou financiado em banco. É nesse momento que o sistema (SAC ou Price), o prazo e a taxa de juros definem o custo total." },
      { h: "O que conferir", p: "Verifique o índice de correção, a data-base da tabela, a data das parcelas e se há desconto ou condição especial por prazo. Compare sempre o custo total, não apenas a entrada." },
    ],
  },
  {
    slug: "incc-o-que-e-e-como-afeta-sua-parcela",
    titulo: "INCC: o que é e como afeta a sua parcela na planta",
    resumo: "O índice que corrige as parcelas durante a obra e por que ele importa no seu orçamento.",
    categoria: "Educação financeira", leitura: 4, data: "2026-10-08",
    corpo: [
      { p: "O INCC (Índice Nacional de Custo da Construção) mede a variação do custo de obras. Contratos de imóvel na planta costumam usá-lo para atualizar as parcelas até a entrega das chaves." },
      { h: "Na prática", p: "Se o índice acumulado for de 5% ao ano, uma parcela de R$ 2.000 passa a aproximadamente R$ 2.100 após doze meses. O efeito se acumula parcela a parcela." },
      { h: "Como se planejar", p: "Ao simular o fluxo, use uma taxa de correção realista e teste cenários mais altos. O simulador do site permite ajustar essa taxa e ver o impacto no custo total." },
      { p: "Os valores deste texto são ilustrativos e não representam projeção do índice." },
    ],
  },
  {
    slug: "sac-ou-price-qual-sistema-de-financiamento-escolher",
    titulo: "SAC ou Price: qual sistema de financiamento escolher",
    resumo: "As diferenças entre parcelas decrescentes e fixas, e como isso muda o custo total.",
    categoria: "Financiamento", leitura: 4, data: "2026-10-15",
    corpo: [
      { h: "SAC", p: "No Sistema de Amortização Constante, a amortização é igual todo mês e os juros incidem sobre o saldo devedor. As parcelas começam maiores e diminuem ao longo do tempo. O custo total de juros tende a ser menor." },
      { h: "Price", p: "Na Tabela Price, as parcelas são fixas (antes de correções). A parcela inicial é menor que a do SAC, o que facilita a aprovação de crédito, mas o total pago em juros costuma ser maior." },
      { h: "Qual escolher", p: "Depende da renda, do prazo e do objetivo. Simule os dois cenários com o mesmo prazo e a mesma taxa e compare a parcela inicial e o custo total antes de decidir." },
      { p: "Condições, taxas e regras variam por banco e podem mudar. Confirme com a instituição financeira." },
    ],
  },
];
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
