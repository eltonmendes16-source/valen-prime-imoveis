import type { Cliente, Interacao } from "@/lib/crm";

const TZ = "America/Sao_Paulo";

// ── Melhor horário para ligar (BTC) ──
export const FAIXAS = ["Manhã (8–12h)", "Almoço (12–14h)", "Tarde (14–18h)", "Fim de tarde (18–21h)", "Fora do horário"] as const;
export type Faixa = (typeof FAIXAS)[number];

export function horaLocal(iso: string): { hora: number; dia: number } {
  const d = new Date(iso);
  const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", hour12: false, timeZone: TZ }).format(d)) % 24;
  const dia = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].indexOf(new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: TZ }).format(d).replace(".", "").toLowerCase());
  return { hora, dia };
}

export function faixaDe(iso: string): Faixa {
  const { hora } = horaLocal(iso);
  if (hora >= 8 && hora < 12) return FAIXAS[0];
  if (hora >= 12 && hora < 14) return FAIXAS[1];
  if (hora >= 14 && hora < 18) return FAIXAS[2];
  if (hora >= 18 && hora < 21) return FAIXAS[3];
  return FAIXAS[4];
}

const NAO_ATENDEU = "Não atende / ocupado";
const NUMERO_ERRADO = "Número errado / não existe";

/** Uma ligação conta como "atendida" quando houve conversa (qualquer resultado exceto não atende e número errado). */
export function ligacoesValidas(hist: Pick<Interacao, "tipo" | "resultado" | "criado_em">[]) {
  return hist.filter((h) => h.tipo === "ligacao" && h.resultado && h.resultado !== NUMERO_ERRADO);
}

export type LinhaFaixa = { faixa: Faixa; tentativas: number; atendidas: number; taxa: number | null };
export function taxaPorFaixa(hist: Pick<Interacao, "tipo" | "resultado" | "criado_em">[]): LinhaFaixa[] {
  const base: Record<string, { t: number; a: number }> = {};
  FAIXAS.forEach((f) => (base[f] = { t: 0, a: 0 }));
  ligacoesValidas(hist).forEach((h) => {
    const f = faixaDe(h.criado_em);
    base[f].t += 1;
    if (h.resultado !== NAO_ATENDEU) base[f].a += 1;
  });
  return FAIXAS.map((f) => ({ faixa: f, tentativas: base[f].t, atendidas: base[f].a, taxa: base[f].t ? Math.round((base[f].a / base[f].t) * 100) : null }));
}

/** Faixa com maior taxa de atendimento, exigindo um mínimo de tentativas para não concluir com poucos dados. */
export function melhorFaixa(linhas: LinhaFaixa[], minimo = 3): LinhaFaixa | null {
  const aptas = linhas.filter((l) => l.faixa !== "Fora do horário" && l.tentativas >= minimo && l.taxa !== null);
  if (!aptas.length) return null;
  return aptas.sort((a, b) => (b.taxa ?? 0) - (a.taxa ?? 0) || b.tentativas - a.tentativas)[0];
}

// ── Temperatura sugerida ──
const dias = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000;

export function temperaturaSugerida(c: Cliente, hist: Interacao[]): { sugerida: "quente" | "morno" | "frio"; pontos: number; motivos: string[] } {
  let p = 0; const m: string[] = [];
  if (c.etapa === "proposta" || c.etapa === "contrato") { p += 3; m.push("está em proposta ou contrato"); }
  else if (c.etapa === "visita_agendada") { p += 2; m.push("tem visita agendada"); }
  else if (c.etapa === "interessado") { p += 1; m.push("demonstrou interesse"); }
  const recentes = hist.filter((h) => dias(h.criado_em) <= 7);
  if (recentes.some((h) => h.resultado === "Pediu material" || h.resultado === "Quer visitar")) { p += 2; m.push("pediu material ou visita na última semana"); }
  if (recentes.some((h) => h.tipo === "ligacao" && h.resultado && h.resultado !== NAO_ATENDEU && h.resultado !== NUMERO_ERRADO)) { p += 1; m.push("conversou na última semana"); }
  if (c.prazo && /(1|2|3|um|dois|tr[eê]s)\s*m[eê]s|imediat|urgente|agora/i.test(c.prazo)) { p += 1; m.push("prazo curto para decidir"); }
  if (c.tentativas_sem_resposta >= 2) { p -= c.tentativas_sem_resposta >= 4 ? 2 : 1; m.push(`${c.tentativas_sem_resposta} tentativas sem resposta`); }
  const ultimo = hist.find((h) => h.tipo !== "sistema");
  if (ultimo ? dias(ultimo.criado_em) > 30 : dias(c.criado_em) > 30) { p -= 2; m.push("sem contato há mais de 30 dias"); }
  if (c.base === "nao_interessados" || c.base === "bloqueados" || c.base === "arquivados") { p -= 3; m.push(`está na base ${c.base.replace("_", " ")}`); }
  return { sugerida: p >= 3 ? "quente" : p >= 1 ? "morno" : "frio", pontos: p, motivos: m };
}

// ── Painel ──
export const ultimosDias = (n: number) => {
  const out: { dia: string; chave: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({ chave: new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(d), dia: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ }).format(d) });
  }
  return out;
};
export const chaveDia = (iso: string) => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date(iso));

export function contar<T>(itens: T[], chave: (x: T) => string | null | undefined): { nome: string; valor: number }[] {
  const m = new Map<string, number>();
  itens.forEach((i) => { const k = chave(i); if (k) m.set(k, (m.get(k) || 0) + 1); });
  return Array.from(m, ([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}
