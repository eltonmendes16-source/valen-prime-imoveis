import { getSupabase } from "./supabase";
import { lerEscolha } from "./comportamento";

// Estatística de visitas SEM cookies e SEM identificar a pessoa: guarda só a página, de onde veio (grupo) e o tipo de aparelho.
// Não grava IP, nome, dados do navegador nem nenhum código que permita reconhecer o visitante.
type Origem = "direto" | "google" | "instagram" | "facebook" | "whatsapp" | "linkedin" | "youtube" | "outros";
const GRUPOS: [RegExp, Origem][] = [
  [/google\.|bing\.|duckduckgo|yahoo\./, "google"], [/instagram\.|l\.instagram/, "instagram"], [/facebook\.|fb\.com|fb\.me|l\.facebook/, "facebook"],
  [/whatsapp\.|wa\.me/, "whatsapp"], [/linkedin\.|lnkd\.in/, "linkedin"], [/youtube\.|youtu\.be/, "youtube"],
];

function origemDaSessao(): Origem {
  try { const g = sessionStorage.getItem("vp_origem"); if (g) return g as Origem; } catch { /* segue */ }
  let o: Origem = "direto";
  const utm = (new URLSearchParams(window.location.search).get("utm_source") || "").toLowerCase();
  let host = utm;
  if (!host && document.referrer) { try { const h = new URL(document.referrer).hostname.toLowerCase(); if (h !== window.location.hostname) host = h; } catch { /* ignora */ } }
  if (host) o = GRUPOS.find(([re]) => re.test(host))?.[1] ?? "outros";
  try { sessionStorage.setItem("vp_origem", o); } catch { /* ignora */ }
  return o;
}

export function contarVisita(caminho: string) {
  if (typeof window === "undefined") return;
  if (navigator.webdriver || /bot|crawl|spider|preview|headless/i.test(navigator.userAgent)) return;
  if (lerEscolha() === "recusado") return;
  const sb = getSupabase(); if (!sb) return;
  const limpo = caminho.split("?")[0].split("#")[0].slice(0, 200) || "/";
  sb.from("visitas_site").insert({ caminho: limpo, origem: origemDaSessao(), aparelho: window.innerWidth < 768 ? "celular" : "computador" }).then(() => undefined, () => undefined);
}
