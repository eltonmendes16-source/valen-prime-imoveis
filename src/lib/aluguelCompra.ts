// Comparação simplificada entre comprar (financiado) e alugar investindo a diferença. Valores nominais, sem imposto de renda.
export type Entrada = {
  valor: number; entradaPct: number; taxaFin: number; prazoAnos: number; sistema: "price" | "sac";
  aluguel: number; reajusteAluguel: number; valorizacao: number; rendimento: number;
  custoCompraPct: number; manutencaoPct: number; custoVendaPct: number; horizonteAnos: number;
};
export type Ponto = { ano: number; comprar: number; alugar: number };
export type Resultado = { pontos: Ponto[]; parcelaInicial: number; financiado: number; entrada: number; custoCompra: number; equilibrio: number | null; diferenca: number };

const mensal = (aa: number) => Math.pow(1 + aa / 100, 1 / 12) - 1;

export function comparar(e: Entrada): Resultado {
  const H = Math.min(Math.max(Math.round(e.horizonteAnos), 1), 35);
  const N = Math.max(Math.round(e.prazoAnos * 12), 12);
  const entrada = e.valor * (e.entradaPct / 100);
  const fin = Math.max(e.valor - entrada, 0);
  const custoCompra = e.valor * (e.custoCompraPct / 100);
  const i = mensal(e.taxaFin), rv = mensal(e.valorizacao), ry = mensal(e.rendimento);
  const price = fin > 0 ? (i === 0 ? fin / N : (fin * i) / (1 - Math.pow(1 + i, -N))) : 0;
  let saldo = fin, valorImovel = e.valor, carteira = entrada + custoCompra;
  let aluguel = e.aluguel, parcelaInicial = 0;
  const pontos: Ponto[] = [];
  let equilibrio: number | null = null;
  for (let m = 1; m <= H * 12; m++) {
    if (m > 1 && (m - 1) % 12 === 0) aluguel *= 1 + e.reajusteAluguel / 100;
    let parcela = 0;
    if (saldo > 0.005 && m <= N) {
      const juros = saldo * i;
      const amort = e.sistema === "price" ? price - juros : fin / N;
      parcela = juros + amort; saldo = Math.max(saldo - amort, 0);
    }
    if (m === 1) parcelaInicial = parcela;
    valorImovel *= 1 + rv;
    const manut = (valorImovel * (e.manutencaoPct / 100)) / 12;
    carteira = carteira * (1 + ry) + (parcela + manut - aluguel);
    if (m % 12 === 0) {
      const comprar = valorImovel * (1 - e.custoVendaPct / 100) - saldo;
      const ano = m / 12;
      pontos.push({ ano, comprar, alugar: carteira });
      if (equilibrio === null && comprar >= carteira) equilibrio = ano;
    }
  }
  const ult = pontos[pontos.length - 1];
  return { pontos, parcelaInicial, financiado: fin, entrada, custoCompra, equilibrio, diferenca: ult.comprar - ult.alugar };
}
