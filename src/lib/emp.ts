import capas from "@/data/capas.json";
import data from "@/data/empreendimentos.json";

export type Tipologia = { area: string; desc?: string };
export type Emp = {
  id: string; nome: string; incorporadora: string | null; bairro: string | null; cidade: string;
  quartos: string; suites: string | null; vagas: string; segmento: "alto-padrao" | "medio" | "economico";
  metragens: number[]; areaMin: number; areaMax: number;
  precoAPartir: number | null; precoAPartirArea: number | null; precoM2Min: number | null; tabelaData: string | null;
  entrega: string | null; torres: number | null; pavimentos: number | null; totalUnidades: number | null;
  terreno: string | null; estrutura: string | null; tipologias: Tipologia[]; lazer: string[];
  infraestrutura: string[]; acabamentos: string[]; fluxoPct: number;
};

export const EMPS = data as unknown as Emp[];

export const AMBIENTES = [
  { slug: "alto-padrao", titulo: "Alto padrão", segmento: "alto-padrao", resumo: "Metragens amplas, suítes e acabamento superior.", texto: "Apartamentos amplos, com três ou mais suítes, coberturas duplex e lazer completo. Os empreendimentos desta linha pedem análise cuidadosa de metragem, vagas e fluxo de pagamento." },
  { slug: "medio-padrao", titulo: "Médio padrão", segmento: "medio", resumo: "Dois e três dormitórios com lazer completo.", texto: "A faixa com maior número de lançamentos no ABC: dois e três dormitórios, varanda gourmet e áreas comuns completas, em bairros consolidados." },
  { slug: "compactos-mcmv", titulo: "Compactos e Minha Casa Minha Vida", segmento: "economico", resumo: "Studios, 1 e 2 dormitórios até 60 m².", texto: "Unidades compactas, de entrada mais acessível. O enquadramento no Minha Casa Minha Vida depende de renda familiar, valor do imóvel e regras vigentes: consulte antes de decidir." },
  { slug: "locacao", titulo: "Locação", segmento: "", resumo: "Encontre ou anuncie imóveis para alugar.", texto: "" },
] as const;

export const SEGMENTO_LABEL: Record<string, string> = {
  "alto-padrao": "Alto padrão", medio: "Médio padrão", economico: "Compactos e MCMV",
};

export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
export const m2 = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`;

export function faixaArea(e: Emp) {
  return e.areaMin === e.areaMax ? m2(e.areaMax) : `${m2(e.areaMin)} a ${m2(e.areaMax)}`;
}
export function localizacao(e: Emp) {
  return e.bairro ? `${e.bairro}, ${e.cidade}` : e.cidade;
}
export function porSegmento(seg: string) {
  return EMPS.filter((e) => e.segmento === seg);
}
export function getEmp(id: string) {
  return EMPS.find((e) => e.id === id);
}
export const CIDADES = Array.from(new Set(EMPS.map((e) => e.cidade))).sort();

// Foto de capa opcional: coloque public/empreendimentos/<id>/capa.jpg (somente imagens autorizadas pela incorporadora).
export function temCapa(id: string) {
  return (capas as string[]).includes(id);
}
export function entregaTexto(iso: string | null) {
  if (!iso) return null;
  const [a, m] = iso.split("-");
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${meses[parseInt(m, 10) - 1]}/${a}`;
}
