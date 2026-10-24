export type Contrato = {
  id: string; cliente_id: string; empreendimento: string | null; unidade: string | null; valor: number | null;
  forma_pagamento: string | null; status: "em_andamento" | "concluido" | "cancelado"; observacoes: string | null;
  criado_em: string; atualizado_em: string;
};
export type Item = { id: string; contrato_id: string; tipo: "etapa" | "documento"; nome: string; prazo: string | null; concluido_em: string | null; ordem: number };
export type Parcela = { id: string; contrato_id: string; descricao: string; vencimento: string; valor: number; pago_em: string | null };

export const STATUS_CONTRATO = [
  { id: "em_andamento", nome: "Em andamento", cor: "bg-sky-100 text-sky-900" },
  { id: "concluido", nome: "Concluído", cor: "bg-emerald-100 text-emerald-900" },
  { id: "cancelado", nome: "Cancelado", cor: "bg-stone-200 text-stone-700" },
] as const;

export const ETAPAS_PADRAO = ["Proposta enviada", "Proposta aprovada", "Assinatura do contrato", "Entrada paga", "Financiamento aprovado", "Entrega das chaves"];
export const DOCS_PADRAO = ["RG e CPF", "Comprovante de renda", "Comprovante de residência", "Certidão de estado civil"];

export const brl = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

/** Data de hoje (AAAA-MM-DD) no fuso de São Paulo, para comparar com colunas do tipo date. */
export const hojeISO = (deslocDias = 0) => {
  const d = new Date(); d.setDate(d.getDate() + deslocDias);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(d);
};
export const fmtDia = (iso?: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");

/** Soma meses mantendo o dia (limitado ao último dia do mês). */
export function somarMeses(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + n, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}

export const atrasado = (prazo: string | null, concluido: string | null) => !!prazo && !concluido && prazo < hojeISO();
