import { lerEscolha } from "./comportamento";

// De qual rede ou site o visitante veio. Serve para (1) a contagem anônima de visitas e (2) saber a origem de um lead.
// O "toque de origem" fica só no aparelho (localStorage) e só vai ao CRM junto com um formulário enviado com consentimento.
export const REDES = [
  { id: "instagram", nome: "Instagram" }, { id: "facebook", nome: "Facebook" }, { id: "threads", nome: "Threads" },
  { id: "linkedin", nome: "LinkedIn" }, { id: "tiktok", nome: "TikTok" }, { id: "youtube", nome: "YouTube" },
  { id: "whatsapp", nome: "WhatsApp" }, { id: "x", nome: "X (Twitter)" }, { id: "pinterest", nome: "Pinterest" },
  { id: "telegram", nome: "Telegram" }, { id: "email", nome: "E-mail / boletim" }, { id: "google", nome: "Buscadores (Google etc.)" },
  { id: "outros", nome: "Outros sites" }, { id: "direto", nome: "Direto / não identificado" },
] as const;
export type Rede = (typeof REDES)[number]["id"];
export const nomeRede = (id: string | null | undefined) => REDES.find((r) => r.id === id)?.nome ?? (id || "Direto / não identificado");

const PADROES: [RegExp, Rede][] = [
  [/(^|\.)threads\.(net|com)$/, "threads"], [/(^|\.)(instagram\.com|ig\.me)$|^l\.instagram/, "instagram"], [/(^|\.)(facebook\.com|fb\.com|fb\.me|fb\.watch|messenger\.com)$|^l\.facebook|^lm\.facebook/, "facebook"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"], [/(^|\.)(tiktok\.com|vm\.tiktok)/, "tiktok"], [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"], [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x"], [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, "pinterest"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram"], [/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org)$/, "google"],
];
const APELIDOS: Record<string, Rede> = {
  ig: "instagram", insta: "instagram", instagram: "instagram", fb: "facebook", facebook: "facebook", meta: "facebook", threads: "threads",
  li: "linkedin", linkedin: "linkedin", tt: "tiktok", tiktok: "tiktok", yt: "youtube", youtube: "youtube", wa: "whatsapp", whatsapp: "whatsapp",
  x: "x", twitter: "x", pinterest: "pinterest", telegram: "telegram", email: "email", newsletter: "email", boletim: "email", google: "google",
};

export const redeDoHost = (host: string): Rede => PADROES.find(([re]) => re.test(host.toLowerCase()))?.[1] ?? "outros";
export const redeDoUtm = (utm: string): Rede => APELIDOS[utm.trim().toLowerCase()] ?? "outros";
export const limparCampanha = (c: string) => c.toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export type Toque = { rede: Rede; campanha: string | null; t: number };
const CHAVE = "vp_toque";
const VALIDADE = 30 * 86400000;

/** Lê a origem da visita atual: UTM do link tem prioridade; depois a página de onde veio (referrer). */
export function origemDaVisita(): { rede: Rede; campanha: string | null; explicita: boolean } {
  const q = new URLSearchParams(window.location.search);
  const utm = q.get("utm_source") || q.get("src") || "";
  const camp = limparCampanha(q.get("utm_campaign") || "") || null;
  if (utm) return { rede: redeDoUtm(utm), campanha: camp, explicita: true };
  if (document.referrer) {
    try { const h = new URL(document.referrer).hostname; if (h !== window.location.hostname) return { rede: redeDoHost(h), campanha: null, explicita: false }; } catch { /* ignora */ }
  }
  return { rede: "direto", campanha: null, explicita: false };
}

export function lerToque(): Toque | null {
  try { const t = JSON.parse(localStorage.getItem(CHAVE) || "null"); if (t && typeof t.rede === "string" && Date.now() - t.t < VALIDADE) return t; } catch { /* sem armazenamento */ }
  return null;
}

/** Guarda a origem (primeiro contato) no aparelho. Link com UTM sempre atualiza; sem UTM só preenche se ainda não houver origem real. */
export function registrarToque() {
  if (typeof window === "undefined" || lerEscolha() === "recusado") return;
  const v = origemDaVisita();
  const atual = lerToque();
  if (v.rede === "direto" && atual) return;
  if (!v.explicita && atual && atual.rede !== "direto") return;
  try { localStorage.setItem(CHAVE, JSON.stringify({ rede: v.rede, campanha: v.campanha, t: Date.now() })); } catch { /* ignora */ }
}

/** Campos para gravar no lead (vazio se a pessoa recusou o registro ou se não há origem). */
export function origemParaLead(): { rede_origem?: string; campanha?: string } {
  if (typeof window === "undefined" || lerEscolha() === "recusado") return {};
  const t = lerToque(); if (!t) return {};
  return { rede_origem: t.rede, ...(t.campanha ? { campanha: t.campanha } : {}) };
}
