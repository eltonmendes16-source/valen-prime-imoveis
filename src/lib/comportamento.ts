// Interesse do visitante, guardado só no navegador dele (localStorage).
// Nada é enviado a servidor até o visitante enviar um formulário e concordar com o uso dos dados.
const CHAVE = "vp_interesse";
type Dados = { emps: string[]; unidades: string[]; dias: string[]; tabela?: boolean; renda?: boolean; pdf?: boolean; simulador?: boolean };
const PREF = "vp_privacidade";
export type Escolha = "ok" | "recusado" | null;
export function lerEscolha(): Escolha {
  try { const v = localStorage.getItem(PREF); return v === "ok" || v === "recusado" ? v : null; } catch { return null; }
}
export function gravarEscolha(v: "ok" | "recusado") {
  try { localStorage.setItem(PREF, v); if (v === "recusado") localStorage.removeItem(CHAVE); } catch { /* ignora */ }
}
const vazio = (): Dados => ({ emps: [], unidades: [], dias: [] });
const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

function ler(): Dados {
  try { const d = JSON.parse(localStorage.getItem(CHAVE) || "null"); if (d && typeof d === "object") return { ...vazio(), ...d }; } catch { /* sem armazenamento */ }
  return vazio();
}
function gravar(d: Dados) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch { /* ignora */ } }

export type Evento = { tipo: "pagina"; caminho: string } | { tipo: "unidade"; id: string } | { tipo: "tabela" | "renda" | "pdf" | "simulador" };

export function registrar(e: Evento) {
  if (typeof window === "undefined" || lerEscolha() === "recusado") return;
  const d = ler();
  const h = hoje();
  if (!d.dias.includes(h)) d.dias = [...d.dias, h].slice(-10);
  if (e.tipo === "pagina") {
    const [, rota, id] = e.caminho.split("/");
    if ((rota === "empreendimentos" || rota === "escolha-sua-unidade") && id && !d.emps.includes(id)) d.emps = [...d.emps, id].slice(-10);
    if (rota === "escolha-sua-unidade") d.tabela = true;
    if (rota === "simulador") d.simulador = true;
  } else if (e.tipo === "unidade") {
    if (!d.unidades.includes(e.id)) d.unidades = [...d.unidades, e.id].slice(-10);
  } else d[e.tipo] = true;
  gravar(d);
}

/** Resumo para anexar ao pedido do visitante (só é enviado com o consentimento dele). */
export function resumoInteresse(): Dados | null {
  if (typeof window === "undefined" || lerEscolha() === "recusado") return null;
  const d = ler();
  return d.emps.length || d.unidades.length || d.tabela || d.renda || d.pdf || d.simulador || d.dias.length ? d : null;
}
