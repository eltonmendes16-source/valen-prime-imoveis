// Confere os arquivos de src/data/tabelas/*.json. Uso: node scripts/validar-tabelas.mjs
// Arquivo com "unidades" vazio é permitido (tabela ainda não incluída): aparece só como aviso.
import { readdirSync, readFileSync, existsSync } from "node:fs";
const dir = new URL("../src/data/tabelas/", import.meta.url);
let erros = 0, avisos = 0;
const falha = (m) => { console.log("  ERRO:", m); erros++; };
const aviso = (m) => { console.log("  aviso:", m); avisos++; };
const hoje = new Date().toISOString().slice(0, 10);
const emps = JSON.parse(readFileSync(new URL("../src/data/empreendimentos.json", import.meta.url), "utf8"));
const ids = new Set(emps.map((e) => e.id));
const arquivos = readdirSync(dir).filter((f) => f.endsWith(".json"));
for (const e of emps) if (!arquivos.includes(`${e.id}.json`)) falha(`${e.id}: falta o arquivo src/data/tabelas/${e.id}.json (rode scripts/novo-empreendimento.mjs ou copie um modelo)`);
let prontas = 0;
for (const f of arquivos) {
  const id = f.replace(".json", "");
  const d = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  const rotulos = [];
  if (!ids.has(id)) falha(`${f}: não existe empreendimento "${id}" em empreendimentos.json`);
  if (d.empreendimento !== id) falha(`${f}: o campo "empreendimento" (${d.empreendimento}) deve ser igual ao nome do arquivo`);
  for (const [campo, rot] of [["tour360", "tour 360"], ["videoDecorado", "vídeo"]]) {
    const v = d[campo];
    if (v) { rotulos.push(rot); if (!/^(https:\/\/|\/)/.test(v)) falha(`${f}: ${campo} deve começar com https:// ou /`); else if (v.startsWith("/") && !existsSync(new URL(`../public${v}`, import.meta.url))) falha(`${f}: arquivo ${v} não existe em public/`); }
  }
  if (!d.unidades?.length) { console.log(`${id}: sem tabela ainda${rotulos.length ? ` (com ${rotulos.join(" e ")})` : ""}`); continue; }
  prontas++;
  console.log(`${id}: ${d.unidades.length} unidades${rotulos.length ? `, ${rotulos.join(" e ")}` : ""}`);
  const c = d.tabela?.condicoes;
  if (!c) { falha(`${id}: tem unidades, mas faltam as condições de pagamento`); continue; }
  const grupos = c.ato.pct + c.mensais.pct + c.anuais.pct + c.unica.pct + c.financiamento.pct;
  if (Math.abs(grupos - 100) > 0.01) aviso(`${id}: a soma dos grupos de pagamento dá ${grupos}% (esperado 100%)`);
  if (d.tabela.validade < hoje) aviso(`${id}: tabela VENCIDA em ${d.tabela.validade}`);
  const vistos = new Set();
  for (const u of d.unidades) {
    if (vistos.has(u.id)) falha(`${id}: unidade repetida ${u.id}`); vistos.add(u.id);
    const soma = u.ato + u.mensal * c.mensais.qtd + u.anual * c.anuais.qtd + u.unica + u.financiamento;
    if (Math.abs(soma - u.total) > 2) falha(`${id} ${u.id}: as parcelas somam ${soma.toFixed(2)}, mas o total é ${u.total}`);
    if (u.andar < 1 || u.andar > d.andares) falha(`${id} ${u.id}: andar ${u.andar} fora do limite (${d.andares} andares)`);
    if (!d.finais.includes(u.final)) falha(`${id} ${u.id}: final ${u.final} não está em "finais"`);
  }
}
console.log(erros ? `\n${erros} erro(s), ${avisos} aviso(s)` : `\nTudo certo: ${arquivos.length} empreendimentos, ${prontas} com tabela (${avisos} aviso(s))`);
process.exit(erros ? 1 : 0);
