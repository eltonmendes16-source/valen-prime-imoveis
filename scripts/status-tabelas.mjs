// Gera src/data/tabelas-status.json a partir de src/data/tabelas/*.json (roda sozinho antes do build).
// O site usa esse resumo para saber quais empreendimentos já têm tabela, passeio 360° e vídeo.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = new URL("../src/data/tabelas/", import.meta.url);
const status = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const d = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  status[f.replace(".json", "")] = { tabela: Array.isArray(d.unidades) && d.unidades.length > 0 && !!d.tabela, tour: !!d.tour360, video: !!d.videoDecorado };
}
writeFileSync(new URL("../src/data/tabelas-status.json", import.meta.url), JSON.stringify(status, null, 1) + "\n");
console.log("tabelas-status.json:", Object.keys(status).length, "empreendimentos");
