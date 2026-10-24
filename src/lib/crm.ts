import { SITE } from "@/lib/site";

export const BASES = [
  { id: "novos", nome: "Novos", cor: "bg-sky-100 text-sky-900" },
  { id: "interessados", nome: "Interessados", cor: "bg-emerald-100 text-emerald-900" },
  { id: "frios", nome: "Frios", cor: "bg-slate-200 text-slate-800" },
  { id: "nao_interessados", nome: "Não interessados", cor: "bg-stone-200 text-stone-800" },
  { id: "corrigir_dados", nome: "Corrigir dados", cor: "bg-amber-100 text-amber-900" },
  { id: "arquivados", nome: "Arquivados", cor: "bg-zinc-200 text-zinc-800" },
  { id: "bloqueados", nome: "Bloqueados (LGPD)", cor: "bg-red-100 text-red-900" },
] as const;
export type BaseId = (typeof BASES)[number]["id"];
export const baseNome = (id: string) => BASES.find((b) => b.id === id)?.nome ?? id;
export const baseCor = (id: string) => BASES.find((b) => b.id === id)?.cor ?? "bg-stone-100 text-stone-800";

export const ETAPAS = [
  { id: "novo", nome: "Novo" },
  { id: "contato_feito", nome: "Contato feito" },
  { id: "interessado", nome: "Interessado" },
  { id: "visita_agendada", nome: "Visita agendada" },
  { id: "proposta", nome: "Proposta" },
  { id: "contrato", nome: "Contrato" },
  { id: "fechado", nome: "Fechado" },
  { id: "perdido", nome: "Perdido" },
] as const;
export const etapaNome = (id: string) => ETAPAS.find((e) => e.id === id)?.nome ?? id;

export const TEMPERATURAS = [
  { id: "quente", nome: "Quente", cor: "bg-red-100 text-red-800" },
  { id: "morno", nome: "Morno", cor: "bg-amber-100 text-amber-800" },
  { id: "frio", nome: "Frio", cor: "bg-sky-100 text-sky-800" },
] as const;
export const tempCor = (id: string) => TEMPERATURAS.find((t) => t.id === id)?.cor ?? "";

export const ORIGENS = ["site", "manual", "importacao", "indicacao", "facebook", "instagram", "google", "oferta_ativa", "evento", "outro"];
export const GENEROS = ["", "Feminino", "Masculino", "Outro", "Prefere não informar"];
export const RENDAS = ["", "Até R$ 4 mil", "R$ 4 a 8 mil", "R$ 8 a 15 mil", "R$ 15 a 30 mil", "Acima de R$ 30 mil"];
export const PAGAMENTOS = ["", "Financiamento", "À vista", "FGTS + financiamento", "Permuta", "Ainda não sei"];
export const TIPOS_IMOVEL = ["", "Apartamento", "Casa", "Terreno", "Comercial", "Outro"];

export type Cliente = {
  id: string; nome: string; telefone: string | null; celular: string | null; hotfone: "telefone" | "celular";
  telefone_valido: boolean | null; whatsapp_confirmado: boolean; email: string | null;
  cep: string | null; endereco: string | null; bairro: string | null; cidade: string | null;
  idade: number | null; data_nascimento: string | null; genero: string | null; profissao: string | null; renda_faixa: string | null;
  empreendimento_interesse: string | null; tipo_imovel: string | null; dormitorios: string | null;
  faixa_valor: string | null; forma_pagamento: string | null; prazo: string | null;
  origem: string; pagina_origem: string | null; base: BaseId; etapa: string; temperatura: string;
  proximo_contato: string | null; tentativas_sem_resposta: number; melhor_horario: string | null;
  motivo_perda: string | null; tags: string[]; observacoes: string | null;
  consentimento: boolean; consentimento_em: string | null; criado_em: string; atualizado_em: string;
};
export type Interacao = { id: string; cliente_id: string; tipo: string; resultado: string | null; nota: string | null; criado_em: string };

/** Número principal para ligar (hotfone). */
export function numeroPrincipal(c: Pick<Cliente, "telefone" | "celular" | "hotfone">): string | null {
  const escolhido = c.hotfone === "telefone" ? c.telefone : c.celular;
  return escolhido || c.celular || c.telefone || null;
}
/** Número para WhatsApp: celular primeiro. */
export function numeroWhats(c: Pick<Cliente, "telefone" | "celular">): string | null {
  return c.celular || c.telefone || null;
}

export function dadosIncompletos(c: Cliente): string[] {
  const f: string[] = [];
  if (!c.telefone) f.push("telefone");
  if (!c.celular) f.push("celular");
  if (!c.email) f.push("e-mail");
  if (!c.endereco) f.push("endereço");
  return f;
}

// ── Classificação: o resultado do contato decide a base, a etapa e o próximo passo ──
export type PedeData = "nenhum" | "data" | "motivo";
export type Resultado = {
  id: string; rotulo: string; dica: string; tom: "bom" | "neutro" | "ruim";
  base?: BaseId; etapa?: string; temperatura?: string; pede: PedeData; diasProximo?: number | null;
  tentativa?: boolean; telefoneInvalido?: boolean; bloquear?: boolean;
};
export const RESULTADOS: Resultado[] = [
  { id: "quer_visitar", rotulo: "Quer visitar", dica: "Vai para Interessados (quente) e agenda a visita", tom: "bom", base: "interessados", etapa: "visita_agendada", temperatura: "quente", pede: "data" },
  { id: "pediu_material", rotulo: "Pediu material", dica: "Vai para Interessados; retorno em 2 dias", tom: "bom", base: "interessados", etapa: "interessado", temperatura: "morno", pede: "nenhum", diasProximo: 2 },
  { id: "ligar_mais_tarde", rotulo: "Ligar mais tarde", dica: "Continua na base; você escolhe quando", tom: "neutro", etapa: "contato_feito", pede: "data" },
  { id: "nao_atende", rotulo: "Não atende / ocupado", dica: "Tenta de novo amanhã; após 5 tentativas vai para Frios", tom: "neutro", pede: "nenhum", diasProximo: 1, tentativa: true },
  { id: "sem_interesse", rotulo: "Não tenho interesse", dica: "Vai para Não interessados e para o follow-up", tom: "ruim", base: "nao_interessados", etapa: "perdido", temperatura: "frio", pede: "motivo", diasProximo: null },
  { id: "nao_quer_ligacoes", rotulo: "Não quer mais ligações", dica: "Vai para Bloqueados e trava contatos (LGPD)", tom: "ruim", base: "bloqueados", etapa: "perdido", temperatura: "frio", pede: "nenhum", diasProximo: null, bloquear: true },
  { id: "numero_errado", rotulo: "Número errado / não existe", dica: "Vai para Corrigir dados", tom: "ruim", base: "corrigir_dados", pede: "nenhum", diasProximo: null, telefoneInvalido: true },
  { id: "ja_comprou", rotulo: "Já comprou imóvel", dica: "Arquiva e revisita em 6 meses", tom: "ruim", base: "arquivados", etapa: "perdido", temperatura: "frio", pede: "nenhum", diasProximo: 180 },
  { id: "ja_tem_corretor", rotulo: "Já tem corretor", dica: "Arquiva e revisita em 6 meses", tom: "ruim", base: "arquivados", etapa: "perdido", temperatura: "frio", pede: "nenhum", diasProximo: 180 },
];
export const MOTIVOS_PERDA = ["Preço", "Região", "Prazo de entrega", "Perfil do imóvel", "Sem condição financeira", "Desistiu de comprar", "Outro"];
export const MAX_TENTATIVAS = 5;

/** Dias até o próximo contato sugerido ao mover o cliente de etapa no funil (null = sem retorno). */
export const DIAS_PROXIMO_ETAPA: Record<string, number | null> = {
  novo: 1, contato_feito: 2, interessado: 2, visita_agendada: 1, proposta: 2, contrato: 3, fechado: null, perdido: null,
};

const dias = (n: number, hora = 10) => {
  const d = new Date(); d.setDate(d.getDate() + n); d.setHours(hora, 0, 0, 0); return d.toISOString();
};

/** Monta a atualização do cliente a partir do resultado escolhido. */
export function aplicarResultado(c: Cliente, r: Resultado, opc: { quando?: string; motivo?: string }) {
  const up: Record<string, unknown> = {};
  let base: BaseId = r.base ?? c.base;
  if (c.base === "novos" && !r.base) base = "novos";
  if (r.etapa) up.etapa = r.etapa; else if (c.etapa === "novo") up.etapa = "contato_feito";
  if (r.temperatura) up.temperatura = r.temperatura;
  if (r.tentativa) {
    const t = c.tentativas_sem_resposta + 1;
    up.tentativas_sem_resposta = t;
    if (t >= MAX_TENTATIVAS) { base = "frios"; up.temperatura = "frio"; }
  } else if (!r.telefoneInvalido) up.tentativas_sem_resposta = 0;
  if (r.telefoneInvalido) { up.telefone_valido = false; up.tentativas_sem_resposta = 0; }
  if (r.bloquear) up.tags = Array.from(new Set([...(c.tags || []), "nao_contatar"]));
  if (r.pede === "data") up.proximo_contato = opc.quando ? new Date(opc.quando).toISOString() : dias(1);
  else if (r.diasProximo === null) up.proximo_contato = null;
  else if (typeof r.diasProximo === "number") up.proximo_contato = dias(r.diasProximo);
  if (r.pede === "motivo" && opc.motivo) up.motivo_perda = opc.motivo;
  up.base = base;
  return up;
}

// ── Mensagens prontas de WhatsApp ──
export type Modelo = { id: string; nome: string; texto: (c: Cliente) => string };
const primeiro = (n: string) => n.trim().split(/\s+/)[0];
const assinatura = `${SITE.consultor} — ${SITE.nome}`;
export const MODELOS: Modelo[] = [
  { id: "boas_vindas", nome: "Boas-vindas", texto: (c) => `Olá, ${primeiro(c.nome)}! Aqui é o ${SITE.consultor}, da ${SITE.nome}. Recebi o seu contato${c.empreendimento_interesse ? ` sobre o ${c.empreendimento_interesse}` : ""}. Posso te ajudar por aqui? Qual o melhor horário para conversarmos?` },
  { id: "material", nome: "Enviar material", texto: (c) => `Olá, ${primeiro(c.nome)}! Conforme combinamos, segue o material${c.empreendimento_interesse ? ` do ${c.empreendimento_interesse}` : ""}. Qualquer dúvida sobre valores, plantas ou condições, é só me chamar. Abraço, ${assinatura}.` },
  { id: "visita", nome: "Convite para visita", texto: (c) => `Olá, ${primeiro(c.nome)}! Que tal conhecer${c.empreendimento_interesse ? ` o ${c.empreendimento_interesse}` : " o empreendimento"} pessoalmente? Tenho horários disponíveis esta semana. Qual dia fica melhor para você?` },
  { id: "pos_visita", nome: "Pós-visita", texto: (c) => `Olá, ${primeiro(c.nome)}! Foi um prazer receber você${c.empreendimento_interesse ? ` no ${c.empreendimento_interesse}` : ""}. Ficou alguma dúvida? Posso preparar uma simulação com as condições para você avaliar.` },
  { id: "retorno", nome: "Retorno / ainda tem interesse?", texto: (c) => `Olá, ${primeiro(c.nome)}! Passando para saber se ainda tem interesse${c.empreendimento_interesse ? ` no ${c.empreendimento_interesse}` : " em um imóvel"}. Posso te atualizar sobre as condições?` },
];

export const MARCOS_POSVENDA = [
  { id: "30d", dias: 30, nome: "30 dias", texto: (nome: string, emp: string | null) => `Olá, ${nome}! Aqui é o ${SITE.consultor}, da ${SITE.nome}. Já faz cerca de um mês da sua compra${emp ? ` no ${emp}` : ""}. Passando para saber como está tudo e se precisa de ajuda com documentos, financiamento ou qualquer dúvida. Conte comigo!` },
  { id: "6m", dias: 180, nome: "6 meses", texto: (nome: string, emp: string | null) => `Olá, ${nome}! Aqui é o ${SITE.consultor}. Passando para saber como estão as coisas com o seu imóvel${emp ? ` do ${emp}` : ""}, e se posso ajudar em algo nessa fase. Abraço!` },
  { id: "12m", dias: 365, nome: "1 ano", texto: (nome: string, emp: string | null) => `Olá, ${nome}! Aqui é o ${SITE.consultor}, da ${SITE.nome}. Faz um ano da sua compra${emp ? ` no ${emp}` : ""}! Como está sendo a experiência? Se tiver alguém que também esteja pensando em comprar ou vender, será um prazer atender com o mesmo cuidado. Obrigado pela confiança! Se quiser, conte como foi a sua experiência (só publico com a sua autorização): ${SITE.url.replace(/\/$/, "")}/depoimento` },
] as const;
export const textoAniversario = (nome: string) => `Olá, ${nome}! Aqui é o ${SITE.consultor}, da ${SITE.nome}. Passando para desejar um feliz aniversário, com muita saúde e conquistas! Um abraço.`;

export const hojeFim = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };
export const diasDeAtraso = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
export const fmtData = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
export const paraInputData = (iso?: string | null) => {
  const d = iso ? new Date(iso) : new Date(Date.now() + 86400000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
