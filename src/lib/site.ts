// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO SITE — edite aqui os dados da empresa. Campos vazios ("") não aparecem no site.
// ─────────────────────────────────────────────────────────────────────────────
export const SITE = {
  nome: "Valen Prime Imóveis",
  marca: "Valen Prime",
  slogan: "Imóveis com estratégia.",
  descricao:
    "Consultoria e intermediação imobiliária no ABC paulista: lançamentos de alto padrão, médio padrão, compactos e Minha Casa Minha Vida, locação e serviços de documentação, financiamento, regularização e avaliação.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.valenprimeimoveis.com.br",

  consultor: "Mendes",
  cargo: "Consultor imobiliário",
  telefone: "(11) 99259-5837",
  whatsapp: "5511992595837", // só números, com DDI 55
  email: "", // ex.: contato@seudominio.com.br

  // Registro profissional — preencha quando sair. Enquanto vazio, o rodapé mostra "em processo de registro".
  creci: "", // ex.: "CRECI-SP J-00000"
  razaoSocial: "", // ex.: "Valen Prime ... Ltda."
  cnpj: "", // ex.: "00.000.000/0001-00"
  cnae: "", // ex.: "6821-8/01 — Corretagem na compra e venda e avaliação de imóveis"

  redes: {
    facebook: "", // ex.: "https://www.facebook.com/SUA-PAGINA"
    instagram: "", // ex.: "https://www.instagram.com/SEU-PERFIL"
    linkedin: "https://www.linkedin.com/company/valen-prime-strategy",
  },
  siteInstitucional: "https://www.valenprime.com.br",

  // Mostrar a comercializadora (ex.: Lopes) nas páginas dos empreendimentos? Só ative com autorização.
  mostrarComercializadora: false,
};

export const whatsappLink = (mensagem?: string) =>
  `https://wa.me/${SITE.whatsapp}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
