// Confere as tabelas de preço por unidade (src/data/tabelas/*.json). Uso: node scripts/validar-tabelas.mjs
import { readdirSync, readFileSync } from "node:fs";
const dir = new URL("../src/data/tabelas/", import.meta.url);
let erros = 0, avisos = 0;
const falha = (m) => { console.log("  ERRO:", m); erros++; };
const aviso = (m) => { console.log("  aviso:", m); avisos++; };
const hoje = new Date().toISOString().slice(0, 10);
const arquivos = readdirSync(dir).filter((f) => f.endsWith(".json"));
for (const f of arquivos) {
  console.log(f);
  const d = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  if (d.empreendimento + ".json" !== f) falha(`o campo "empreendimento" (${d.empreendimento}) deve ser igual ao nome do arquivo`);
  const c = d.tabela?.condicoes;
  if (!c) { falha("faltam as condições de pagamento"); continue; }
  // as porcentagens "pct" são do total de cada grupo: a soma dos grupos deve dar 100
  const grupos = c.ato.pct + c.mensais.pct + c.anuais.pct + c.unica.pct + c.financiamento.pct;
  if (Math.abs(grupos - 100) > 0.01) aviso(`a soma dos grupos de pagamento dá ${grupos}% (esperado 100%)`);
  if (d.tabela.validade < hoje) aviso(`tabela VENCIDA em ${d.tabela.validade}`);
  const ids = new Set();
  for (const u of d.unidades) {
    if (ids.has(u.id)) falha(`unidade repetida: ${u.id}`); ids.add(u.id);
    const soma = u.ato + u.mensal * c.mensais.qtd + u.anual * c.anuais.qtd + u.unica + u.financiamento;
    if (Math.abs(soma - u.total) > 2) falha(`${u.id}: as parcelas somam ${soma.toFixed(2)}, mas o total é ${u.total}`);
    if (u.andar < 1 || u.andar > d.andares) falha(`${u.id}: andar ${u.andar} fora do limite (${d.andares} andares)`);
    if (!d.finais.includes(u.final)) falha(`${u.id}: final ${u.final} não está em "finais"`);
  }
  console.log(`  ${d.unidades.length} unidades, validade ${d.tabela.validade}`);
}
// COM_TABELA (src/lib/emp.ts) precisa listar exatamente as tabelas existentes
const emp = readFileSync(new URL("../src/lib/emp.ts", import.meta.url), "utf8");
const lista = (/COM_TABELA\s*=\s*\[([^\]]*)\]/.exec(emp)?.[1] || "").match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
const ids = arquivos.map((f) => f.replace(".json", ""));
for (const id of ids) if (!lista.includes(id)) falha(`${id} tem tabela, mas não está em COM_TABELA (src/lib/emp.ts)`);
for (const id of lista) if (!ids.includes(id)) falha(`${id} está em COM_TABELA, mas não existe src/data/tabelas/${id}.json`);
console.log(erros ? `\n${erros} erro(s), ${avisos} aviso(s)` : `\nTudo certo (${avisos} aviso(s))`);
process.exit(erros ? 1 : 0);
