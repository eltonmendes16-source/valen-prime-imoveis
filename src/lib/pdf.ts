// Geração de PDFs no navegador (nada é enviado a servidores).
import type { jsPDF } from "jspdf";
import { SITE } from "./site";

const OURO: [number, number, number] = [193, 154, 91];
const ESCURO: [number, number, number] = [31, 28, 25];
const CINZA: [number, number, number] = [110, 105, 98];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dataBR = (iso?: string | null) => (iso ? iso.split("T")[0].split("-").reverse().join("/") : "");

async function novoDoc() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "mm", format: "a4" });
}

function cabecalho(doc: jsPDF, titulo: string, sub?: string) {
  doc.setFillColor(...ESCURO); doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(SITE.marca, 14, 14);
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...OURO); doc.text("IMÓVEIS COM ESTRATÉGIA", 14, 20);
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.text(`${SITE.consultor} · ${SITE.telefone}`, 196, 14, { align: "right" });
  if (SITE.email) doc.text(SITE.email, 196, 19, { align: "right" });
  doc.setTextColor(...ESCURO); doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(titulo, 14, 38);
  if (sub) { doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...CINZA); doc.text(sub, 14, 44); }
  doc.setTextColor(...ESCURO);
}

function rodape(doc: jsPDF, texto: string) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(7); doc.setTextColor(...CINZA); doc.setFont("helvetica", "normal");
    const l = doc.splitTextToSize(texto, 182); doc.text(l, 14, 285 - (l.length - 1) * 3);
    doc.text(`${SITE.razaoSocial ? SITE.razaoSocial + " · " : ""}${SITE.creci || "CRECI: em processo de registro"} · Página ${i}/${n}`, 14, 292);
  }
}

function secao(doc: jsPDF, y: number, t: string) {
  doc.setFillColor(...OURO); doc.rect(14, y, 182, 6.5, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.text(t.toUpperCase(), 16, y + 4.6);
  doc.setTextColor(...ESCURO); return y + 10;
}

// ─────────── Ficha da unidade ───────────
export type UnidadeFicha = { id: string; andar: number; final: number; area: number; vaga: string; ato: number; mensal: number; anual: number; unica: number; financiamento: number; total: number };
export type TabelaFicha = { impressa: string; validade: string; condicoes: Record<string, { qtd: number; pct: number; inicio: string }>; obs: string[] };

export async function fichaUnidadePdf(emp: string, u: UnidadeFicha, t: TabelaFicha, extra?: { taxa?: number; meses?: number; parcelaFin?: number }) {
  const doc = await novoDoc();
  cabecalho(doc, `${emp} · Unidade ${u.id.replace("U-", "")}`, `${u.andar}º andar, final ${u.final} · tabela de ${dataBR(t.impressa)}, válida até ${dataBR(t.validade)}`);
  let y = 52;
  y = secao(doc, y, "A unidade");
  const dorm = u.final === 2 ? "2 dormitórios (1 suíte)" : "3 dormitórios (1 suíte)";
  const linhas: [string, string][] = [["Área privativa", `${u.area} m²`], ["Dormitórios", dorm], ["Vagas", u.vaga === "dupla" ? "2 vagas" : "1 vaga"], ["Valor de tabela", brl(u.total)], ["Valor por m²", brl(u.total / u.area)]];
  doc.setFontSize(10);
  linhas.forEach(([a, b], i) => { doc.setFont("helvetica", "normal"); doc.setTextColor(...CINZA); doc.text(a, 16, y + i * 7); doc.setFont("helvetica", "bold"); doc.setTextColor(...ESCURO); doc.text(b, 70, y + i * 7); });
  y += linhas.length * 7 + 4;

  y = secao(doc, y, "Fluxo de pagamento");
  const c = t.condicoes;
  const fluxo: [string, string, string, string][] = [
    ["Ato (entrada)", `${c.ato.qtd}x`, `${c.ato.pct}%`, `${brl(u.ato)} · ${c.ato.inicio}`],
    ["Mensais", `${c.mensais.qtd}x`, `${c.mensais.pct}%`, `${brl(u.mensal)} cada · a partir de ${c.mensais.inicio}`],
    ["Anuais", `${c.anuais.qtd}x`, `${c.anuais.pct}%`, `${brl(u.anual)} cada · a partir de ${c.anuais.inicio}`],
    ["Parcela única", "1x", `${c.unica.pct}%`, `${brl(u.unica)} · ${c.unica.inicio}`],
    ["Financiamento", "1x", `${c.financiamento.pct}%`, `${brl(u.financiamento)} · ${c.financiamento.inicio}`],
  ];
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...CINZA);
  ["Etapa", "Qtd.", "% do valor", "Valor e vencimento"].forEach((h, i) => doc.text(h, [16, 62, 80, 105][i], y));
  y += 5; doc.setFontSize(9.5);
  fluxo.forEach((l) => { doc.setFont("helvetica", "bold"); doc.setTextColor(...ESCURO); doc.text(l[0], 16, y); doc.setFont("helvetica", "normal"); doc.text(l[1], 62, y); doc.text(l[2], 80, y); doc.text(l[3], 105, y); doc.setDrawColor(225, 220, 210); doc.line(14, y + 2, 196, y + 2); y += 7; });
  y += 3;

  if (extra?.parcelaFin) {
    y = secao(doc, y, "Estimativa do financiamento (ilustrativa)");
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Saldo de ${brl(u.financiamento)} em ${extra.meses} meses, taxa de ${String(extra.taxa).replace(".", ",")}% ao ano (Tabela Price): parcela estimada de ${brl(extra.parcelaFin)} por mês.`, 16, y, { maxWidth: 178 });
    y += 12;
  }

  y = secao(doc, y, "Condições e observações");
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  t.obs.forEach((o) => { const l = doc.splitTextToSize(`• ${o}`, 178); doc.text(l, 16, y); y += l.length * 4 + 1.5; });

  rodape(doc, "Valores de referência da tabela do incorporador, sujeitos a alteração sem aviso prévio e a disponibilidade da unidade. Imagens e simulações são ilustrativas e não constituem proposta, reserva ou aprovação de crédito. Condições completas constam no contrato de compromisso de compra e venda.");
  doc.save(`ficha-${emp.toLowerCase().replace(/\s+/g, "-")}-unidade-${u.id.replace("U-", "")}.pdf`);
}

// ─────────── Ficha cadastral ───────────
type Cli = { nome?: string | null; email?: string | null; celular?: string | null; telefone?: string | null; cep?: string | null; endereco?: string | null; bairro?: string | null; cidade?: string | null; profissao?: string | null; renda_faixa?: string | null; empreendimento_interesse?: string | null; forma_pagamento?: string | null };

function campo(doc: jsPDF, x: number, y: number, w: number, rotulo: string, valor?: string | null) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...CINZA); doc.text(rotulo, x, y);
  doc.setDrawColor(190, 185, 175); doc.rect(x, y + 1, w, 7);
  if (valor) { doc.setFontSize(9); doc.setTextColor(...ESCURO); doc.text(doc.splitTextToSize(valor, w - 2)[0], x + 1.5, y + 6); }
}
function caixa(doc: jsPDF, x: number, y: number, rotulo: string) {
  doc.setDrawColor(120, 115, 108); doc.rect(x, y - 3, 3.5, 3.5); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...ESCURO); doc.text(rotulo, x + 5.5, y);
}

function blocoProponente(doc: jsPDF, y: number, titulo: string, c?: Cli) {
  y = secao(doc, y, titulo);
  campo(doc, 14, y, 120, "Nome completo", c?.nome); campo(doc, 137, y, 28, "Sexo"); campo(doc, 168, y, 28, "Data de nascimento"); y += 12;
  campo(doc, 14, y, 45, "Estado civil"); campo(doc, 62, y, 45, "Regime de bens"); campo(doc, 110, y, 40, "Nacionalidade"); campo(doc, 153, y, 43, "Naturalidade / UF"); y += 12;
  campo(doc, 14, y, 50, "CPF"); campo(doc, 67, y, 45, "RG"); campo(doc, 115, y, 40, "Órgão expedidor / UF"); campo(doc, 158, y, 38, "Data de emissão"); y += 12;
  campo(doc, 14, y, 90, "Nome do pai"); campo(doc, 107, y, 89, "Nome da mãe"); y += 12;
  campo(doc, 14, y, 100, "E-mail", c?.email); campo(doc, 117, y, 38, "Celular", c?.celular || c?.telefone); campo(doc, 158, y, 38, "Telefone residencial"); y += 12;
  campo(doc, 14, y, 110, "Endereço residencial", c?.endereco); campo(doc, 127, y, 20, "Nº"); campo(doc, 150, y, 46, "Complemento"); y += 12;
  campo(doc, 14, y, 55, "Bairro", c?.bairro); campo(doc, 72, y, 55, "Cidade", c?.cidade); campo(doc, 130, y, 14, "UF"); campo(doc, 147, y, 30, "CEP", c?.cep); y += 12;
  campo(doc, 14, y, 50, "Profissão", c?.profissao); campo(doc, 67, y, 60, "Empresa"); campo(doc, 130, y, 30, "Tempo de empresa"); campo(doc, 163, y, 33, "Renda mensal", c?.renda_faixa); y += 12;
  campo(doc, 14, y, 40, "Outros rendimentos (R$)"); campo(doc, 57, y, 40, "Gratificação anual (R$)"); campo(doc, 100, y, 30, "Banco"); campo(doc, 133, y, 28, "Agência"); campo(doc, 164, y, 32, "Conta"); y += 14;
  return y;
}

export async function fichaCadastralPdf(c: Cli) {
  const doc = await novoDoc();
  cabecalho(doc, "Ficha cadastral · Pessoa física", `Data: ____/____/______   Local: ______________________`);
  let y = 50;
  y = secao(doc, y, "Imóvel de interesse");
  campo(doc, 14, y, 100, "Empreendimento", c.empreendimento_interesse); campo(doc, 117, y, 38, "Torre"); campo(doc, 158, y, 38, "Unidade"); y += 14;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...ESCURO); doc.text("Como conheceu o empreendimento?", 14, y); y += 5;
  ["Site", "Instagram / Facebook", "Google", "Indicação", "Corretor", "Mídia impressa", "Outro"].forEach((t, i) => caixa(doc, 14 + (i % 4) * 46, y + Math.floor(i / 4) * 6, t));
  y += 15;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text("Objetivo da compra", 14, y); y += 5;
  ["Moradia", "Investimento", "Outro"].forEach((t, i) => caixa(doc, 14 + i * 46, y, t)); y += 9;
  doc.setFont("helvetica", "bold"); doc.text("Origem dos recursos", 14, y); y += 5;
  ["Recursos próprios", "FGTS", "Financiamento bancário", "Venda de imóvel"].forEach((t, i) => caixa(doc, 14 + i * 46, y, t)); y += 9;
  campo(doc, 14, y, 60, "Renda familiar total (R$)"); campo(doc, 77, y, 60, "Prazo desejado para fechar"); campo(doc, 140, y, 56, "Forma de pagamento", c.forma_pagamento); y += 14;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text("Documentos apresentados", 14, y); y += 5;
  ["RG / CNH", "CPF", "Comprovante de residência", "Comprovante de renda", "Certidão de estado civil", "Outros"].forEach((t, i) => caixa(doc, 14 + (i % 3) * 62, y + Math.floor(i / 3) * 6, t));
  y += 16;
  y = blocoProponente(doc, y, "1º proponente", c);

  doc.addPage(); y = 16;
  y = blocoProponente(doc, y, "2º proponente / cônjuge");
  y = secao(doc, y, "Dados patrimoniais");
  doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
  y += 3;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...ESCURO); doc.text("Possui imóvel em seu nome?", 14, y + 2);
  caixa(doc, 62, y + 2, "Sim"); caixa(doc, 78, y + 2, "Não");
  campo(doc, 95, y - 2, 101, "Descrição / endereço / valor do imóvel"); y += 14;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...ESCURO); doc.text("Possui veículo em seu nome?", 14, y + 2);
  caixa(doc, 62, y + 2, "Carro"); caixa(doc, 80, y + 2, "Moto");
  campo(doc, 95, y - 2, 60, "Modelo / marca"); campo(doc, 158, y - 2, 38, "Valor (R$)"); y += 15;
  y = secao(doc, y, "Procurador / representante / fiador (se houver)");
  campo(doc, 14, y, 60, "Relação"); campo(doc, 77, y, 119, "Nome completo"); y += 12;
  campo(doc, 14, y, 50, "CPF"); campo(doc, 67, y, 50, "RG"); campo(doc, 120, y, 76, "Celular / e-mail"); y += 14;

  y = secao(doc, y, "Declarações e autorização");
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  const dec = [
    "1. Declaro que as informações desta ficha são verdadeiras, exatas e de minha responsabilidade, e que tenho ciência de que são confidenciais.",
    "2. Autorizo a consulta de meus dados em órgãos de proteção ao crédito e a análise cadastral necessárias à negociação e à aquisição do imóvel, pela incorporadora, pela instituição financeira e por seus representantes.",
    "3. Proteção de dados (LGPD): autorizo a Valen Prime a tratar os dados desta ficha (identificação, contato, renda e patrimônio) para atendimento, análise de crédito e elaboração de proposta e contrato, compartilhando-os somente com incorporadora, banco e assessorias envolvidas na operação, e a conservá-los pelo tempo necessário. Posso solicitar acesso, correção ou exclusão a qualquer momento.",
    "4. Estou ciente de que o preenchimento desta ficha não constitui reserva, proposta aceita nem aprovação de crédito.",
  ];
  dec.forEach((t) => { const l = doc.splitTextToSize(t, 180); doc.text(l, 14, y); y += l.length * 3.8 + 1.5; });
  y += 10;
  doc.setDrawColor(...ESCURO);
  doc.line(14, y, 100, y); doc.line(110, y, 196, y); doc.setFontSize(8); doc.text("Assinatura do 1º proponente", 14, y + 4); doc.text("Assinatura do 2º proponente / cônjuge", 110, y + 4);

  rodape(doc, "Documento confidencial. Os dados desta ficha são usados apenas para atendimento e análise da negociação e não são publicados.");
  doc.save(`ficha-cadastral-${(c.nome || "cliente").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}.pdf`);
}
