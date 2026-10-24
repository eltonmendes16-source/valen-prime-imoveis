// Cria um empreendimento novo com a estrutura completa. Uso:
//   node scripts/novo-empreendimento.mjs id="meu-emp" nome="Meu Emp" cidade="Santo André" bairro="Jardim" incorporadora="Fulana" segmento=medio quartos="2 e 3" vagas="1 ou 2" entrega=2029-06
// Obrigatórios: id, nome, cidade. segmento: alto-padrao | medio | economico.
// Depois: coloque as fotos em public/empreendimentos/<id>/ e preencha src/data/tabelas/<id>.json (tabela, tour360, videoDecorado).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const i = x.indexOf("="); return [x.slice(0, i), x.slice(i + 1)]; }));
const sai = (m) => { console.error("ERRO:", m); process.exit(1); };
if (!a.id || !a.nome || !a.cidade) sai("informe pelo menos id=, nome= e cidade=");
if (!/^[a-z0-9-]+$/.test(a.id)) sai("o id deve ter só letras minúsculas, números e hífen (ex.: meu-emp-santo-andre)");
if (a.segmento && !["alto-padrao", "medio", "economico"].includes(a.segmento)) sai("segmento deve ser alto-padrao, medio ou economico");
const arq = new URL("../src/data/empreendimentos.json", import.meta.url);
const lista = JSON.parse(readFileSync(arq, "utf8"));
if (lista.some((e) => e.id === a.id)) sai(`já existe um empreendimento com o id ${a.id}`);
lista.push({
  id: a.id, nome: a.nome, incorporadora: a.incorporadora || null, bairro: a.bairro || null, cidade: a.cidade,
  quartos: a.quartos || "2", suites: a.suites || null, vagas: a.vagas || "1", segmento: a.segmento || "medio",
  metragens: [], areaMin: 0, areaMax: 0, precoAPartir: null, precoAPartirArea: null, precoM2Min: null, tabelaData: null,
  entrega: a.entrega || null, torres: null, pavimentos: null, totalUnidades: null, terreno: null, estrutura: null,
  tipologias: [], lazer: [], infraestrutura: [], acabamentos: [], fluxoPct: 30,
});
writeFileSync(arq, JSON.stringify(lista, null, 1) + "\n");
const tab = new URL(`../src/data/tabelas/${a.id}.json`, import.meta.url);
if (!existsSync(tab)) writeFileSync(tab, JSON.stringify({ empreendimento: a.id, tabela: null, andares: 0, finais: [], unidades: [], tour360: "", videoDecorado: "", videoPoster: "" }, null, 2) + "\n");
mkdirSync(new URL(`../public/empreendimentos/${a.id}/`, import.meta.url), { recursive: true });
console.log(`Criado: ${a.nome} (${a.id}).\nFalta: metragens/áreas, lazer e demais dados em empreendimentos.json; fotos em public/empreendimentos/${a.id}/; tabela em src/data/tabelas/${a.id}.json.\nDepois rode: node scripts/validar-tabelas.mjs`);
