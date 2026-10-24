import murano from "@/data/tabelas/ilha-de-murano.json";

// Tabela de preços por unidade (modelo "Escolha sua unidade"). Para padronizar um novo empreendimento:
// 1) crie src/data/tabelas/<id>.json no mesmo formato do Ilha de Murano; 2) registre aqui; 3) inclua o id em COM_TABELA (src/lib/emp.ts);
// 4) rode `node scripts/validar-tabelas.mjs`.
export type Parcela = { qtd: number; pct: number; inicio: string };
export type UnidadeTabela = { id: string; andar: number; final: number; area: number; vaga: string; ato: number; mensal: number; anual: number; unica: number; financiamento: number; total: number };
export type TabelaEmp = {
  empreendimento: string;
  tabela: { nome: string; impressa: string; validade: string; condicoes: { ato: Parcela; mensais: Parcela; anuais: Parcela; unica: Parcela; financiamento: Parcela }; obs: string[] };
  andares: number; finais: number[]; unidades: UnidadeTabela[];
  tour360?: string; videoDecorado?: string; videoPoster?: string;
};

export const TABELAS: Record<string, TabelaEmp> = {
  "ilha-de-murano": murano as unknown as TabelaEmp,
};
