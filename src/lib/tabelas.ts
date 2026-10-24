// Dados comerciais de cada empreendimento: src/data/tabelas/<id>.json (tabela por unidade, passeio 360° e vídeo).
// Todo empreendimento tem um arquivo; enquanto a tabela estiver vazia, o site mostra "em breve" nos lugares certos.
export type Parcela = { qtd: number; pct: number; inicio: string };
export type UnidadeTabela = { id: string; andar: number; final: number; area: number; vaga: string; ato: number; mensal: number; anual: number; unica: number; financiamento: number; total: number };
export type TabelaEmp = {
  empreendimento: string;
  tabela: { nome: string; impressa: string; validade: string; condicoes: { ato: Parcela; mensais: Parcela; anuais: Parcela; unica: Parcela; financiamento: Parcela }; obs: string[] } | null;
  andares: number; finais: number[]; unidades: UnidadeTabela[];
  tour360?: string; videoDecorado?: string; videoPoster?: string;
};
export type TabelaPreenchida = TabelaEmp & { tabela: NonNullable<TabelaEmp["tabela"]> };

/** Carrega o arquivo do empreendimento (só no servidor). Retorna null se o arquivo não existir. */
export async function carregarTabela(id: string): Promise<TabelaEmp | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try { return ((await import(`@/data/tabelas/${id}.json`)).default) as TabelaEmp; } catch { return null; }
}
