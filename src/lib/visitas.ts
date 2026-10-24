import { getSupabase } from "./supabase";
import { lerEscolha } from "./comportamento";
import { origemDaVisita } from "./origem";

// Estatística de visitas SEM cookies e SEM identificar a pessoa: guarda só a página, de onde veio (grupo) e o tipo de aparelho.
// Não grava IP, nome, dados do navegador nem nenhum código que permita reconhecer o visitante.
function origemDaSessao(): { rede: string; campanha: string | null } {
  try { const g = sessionStorage.getItem("vp_origem2"); if (g) return JSON.parse(g); } catch { /* segue */ }
  const v = origemDaVisita();
  const o = { rede: v.rede, campanha: v.campanha };
  try { sessionStorage.setItem("vp_origem2", JSON.stringify(o)); } catch { /* ignora */ }
  return o;
}

export function contarVisita(caminho: string) {
  if (typeof window === "undefined") return;
  if (navigator.webdriver || /bot|crawl|spider|preview|headless/i.test(navigator.userAgent)) return;
  if (lerEscolha() === "recusado") return;
  const sb = getSupabase(); if (!sb) return;
  const limpo = caminho.split("?")[0].split("#")[0].slice(0, 200) || "/";
  const o = origemDaSessao();
  sb.from("visitas_site").insert({ caminho: limpo, origem: o.rede, ...(o.campanha ? { campanha: o.campanha } : {}), aparelho: window.innerWidth < 768 ? "celular" : "computador" }).then(() => undefined, () => undefined);
}
