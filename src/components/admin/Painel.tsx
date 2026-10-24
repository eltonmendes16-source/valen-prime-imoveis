"use client";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSupabase } from "@/lib/supabase";
import { ETAPAS, baseNome } from "@/lib/crm";
import { FAIXAS, chaveDia, contar, ligacoesValidas, melhorFaixa, taxaPorFaixa, ultimosDias } from "@/lib/analytics";
import { Aviso } from "./ui";

type C = { id: string; criado_em: string; origem: string; base: string; etapa: string; temperatura: string; empreendimento_interesse: string | null; motivo_perda: string | null };
type I = { cliente_id: string; tipo: string; resultado: string | null; criado_em: string };

const OURO = "#C19A5B", ESCURO = "#1F1C19", CLARO = "#E6D3AD";

function Cartao({ titulo, pergunta, children, vazio, largo = false }: { titulo: string; pergunta: string; children: React.ReactNode; vazio?: string; largo?: boolean }) {
  return (
    <section className={`rounded-lg border border-ink/10 bg-white p-4 shadow-sm ${largo ? "lg:col-span-2" : ""}`}>
      <h2 className="font-serif text-lg font-semibold text-ink">{titulo}</h2>
      <p className="mb-3 text-xs text-muted">{pergunta}</p>
      {vazio ? <p className="rounded-md bg-sand px-3 py-6 text-center text-sm text-muted">{vazio}</p> : children}
    </section>
  );
}

function Barras({ dados, horizontal = false, altura = 220, cor = OURO }: { dados: { nome: string; valor: number }[]; horizontal?: boolean; altura?: number; cor?: string }) {
  return (
    <div style={{ width: "100%", height: horizontal ? Math.max(altura, dados.length * 34) : altura }}>
      <ResponsiveContainer>
        <BarChart data={dados} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 16, right: 24, left: horizontal ? 8 : -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00000012" vertical={!horizontal} horizontal={horizontal ? false : true} />
          {horizontal ? <><XAxis type="number" allowDecimals={false} hide /><YAxis type="category" dataKey="nome" width={130} tick={{ fontSize: 12, fill: ESCURO }} /></> : <><XAxis dataKey="nome" tick={{ fontSize: 11, fill: ESCURO }} interval="preserveStartEnd" /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#756D60" }} /></>}
          <Tooltip cursor={{ fill: "#C19A5B22" }} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="valor" name="Clientes" fill={cor} radius={[3, 3, 0, 0]}><LabelList dataKey="valor" position={horizontal ? "right" : "top"} style={{ fontSize: 11, fill: ESCURO }} /></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Painel({ versao }: { versao: number }) {
  const [cs, setCs] = useState<C[] | null>(null);
  const [is, setIs] = useState<I[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    let vivo = true;
    Promise.all([
      sb.from("clientes").select("id,criado_em,origem,base,etapa,temperatura,empreendimento_interesse,motivo_perda").limit(10000),
      sb.from("interacoes").select("cliente_id,tipo,resultado,criado_em").order("criado_em", { ascending: true }).limit(10000),
    ]).then(([a, b]) => {
      if (!vivo) return;
      if (a.error || b.error) { setErro((a.error || b.error)!.message); return; }
      setCs(a.data as C[]); setIs(b.data as I[]);
    });
    return () => { vivo = false; };
  }, [versao]);

  const d = useMemo(() => {
    if (!cs) return null;
    const dias30 = ultimosDias(30);
    const porDia = new Map<string, number>();
    cs.forEach((c) => porDia.set(chaveDia(c.criado_em), (porDia.get(chaveDia(c.criado_em)) || 0) + 1));
    const serieDias = dias30.map((x) => ({ nome: x.dia, valor: porDia.get(x.chave) || 0 }));
    const novos7 = serieDias.slice(-7).reduce((a, b) => a + b.valor, 0);

    const validas = ligacoesValidas(is);
    const atendidas = validas.filter((h) => h.resultado !== "Não atende / ocupado").length;
    const faixas = taxaPorFaixa(is);
    const melhor = melhorFaixa(faixas);

    // mediana de horas entre o cadastro e o primeiro contato (ligação ou WhatsApp)
    const criado = new Map(cs.map((c) => [c.id, new Date(c.criado_em).getTime()]));
    const primeiro = new Map<string, number>();
    is.forEach((h) => { if ((h.tipo === "ligacao" || h.tipo === "whatsapp") && !primeiro.has(h.cliente_id)) primeiro.set(h.cliente_id, new Date(h.criado_em).getTime()); });
    const horas = Array.from(primeiro, ([id, t]) => (t - (criado.get(id) || t)) / 3600000).filter((h) => h >= 0).sort((a, b) => a - b);
    const mediana = horas.length ? horas[Math.floor(horas.length / 2)] : null;

    const etapas = ETAPAS.filter((e) => e.id !== "perdido").map((e) => ({ nome: e.nome, valor: cs.filter((c) => c.etapa === e.id).length }));
    return {
      total: cs.length, novos7, serieDias,
      origem: contar(cs, (c) => c.origem),
      bases: contar(cs, (c) => baseNome(c.base)),
      etapas,
      perdas: contar(cs.filter((c) => c.motivo_perda), (c) => c.motivo_perda),
      emps: contar(cs, (c) => c.empreendimento_interesse).slice(0, 8),
      temp: contar(cs, (c) => c.temperatura),
      fechados: cs.filter((c) => c.etapa === "fechado").length,
      ligacoes: validas.length, atendidas, taxa: validas.length ? Math.round((atendidas / validas.length) * 100) : null,
      faixas, melhor, mediana,
    };
  }, [cs, is]);

  if (erro) return <Aviso tipo="erro">Não consegui carregar os números: {erro}</Aviso>;
  if (!d) return <p className="text-sm text-muted">Carregando…</p>;

  const kpis = [
    { t: "Clientes no CRM", v: String(d.total), d: `${d.novos7} novos nos últimos 7 dias` },
    { t: "Taxa de atendimento", v: d.taxa === null ? "—" : `${d.taxa}%`, d: d.ligacoes ? `${d.atendidas} de ${d.ligacoes} ligações registradas` : "Registre ligações para medir" },
    { t: "Tempo até o 1º contato", v: d.mediana === null ? "—" : d.mediana < 1 ? `${Math.round(d.mediana * 60)} min` : d.mediana < 48 ? `${d.mediana.toFixed(1).replace(".", ",")} h` : `${Math.round(d.mediana / 24)} dias`, d: "mediana entre cadastro e primeiro contato" },
    { t: "Negócios fechados", v: String(d.fechados), d: d.total ? `${((d.fechados / d.total) * 100).toFixed(1).replace(".", ",")}% dos clientes` : "—" },
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="font-serif text-2xl font-semibold text-ink">Painel</h1><p className="text-sm text-muted">Cada gráfico responde a uma pergunta. Os números melhoram conforme você registra os contatos.</p></div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.t} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
            <p className="text-xs text-muted">{k.t}</p><p className="mt-1 font-serif text-3xl font-semibold text-ink">{k.v}</p><p className="mt-1 text-[11px] text-muted">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao largo titulo="Quando chegam os contatos?" pergunta="Novos clientes cadastrados por dia, nos últimos 30 dias." vazio={d.total === 0 ? "Ainda não há clientes. Os contatos do site e os cadastros aparecem aqui." : undefined}>
          <Barras dados={d.serieDias} />
        </Cartao>

        <Cartao titulo="De onde vem o melhor lead?" pergunta="Quantidade de clientes por origem." vazio={d.origem.length === 0 ? "Sem dados ainda." : undefined}>
          <Barras dados={d.origem} horizontal />
        </Cartao>

        <Cartao titulo="Onde estão os clientes no funil?" pergunta="Clientes por etapa hoje (fora os perdidos)." vazio={d.total === 0 ? "Sem dados ainda." : undefined}>
          <Barras dados={d.etapas} horizontal cor={ESCURO} />
        </Cartao>

        <Cartao titulo="Em que horário mais atendem?" pergunta="Taxa de ligações atendidas por faixa de horário (fuso de São Paulo)."
          vazio={d.ligacoes === 0 ? "Registre ligações na ficha do cliente (Classificar) para o sistema aprender o melhor horário." : undefined}>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={d.faixas.filter((f) => f.faixa !== "Fora do horário" || f.tentativas > 0).map((f) => ({ nome: f.faixa, valor: f.taxa ?? 0, n: f.tentativas }))} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000012" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 10, fill: ESCURO }} interval={0} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#756D60" }} />
                <Tooltip formatter={(v, _n, p) => [`${v}% (${(p?.payload as { n: number }).n} ligações)`, "Atendimento"]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="valor" radius={[3, 3, 0, 0]}>
                  {d.faixas.filter((f) => f.faixa !== "Fora do horário" || f.tentativas > 0).map((f) => <Cell key={f.faixa} fill={d.melhor?.faixa === f.faixa ? OURO : CLARO} />)}
                  <LabelList dataKey="valor" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fill: ESCURO }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">
            {d.melhor ? <>Melhor faixa até agora: <strong className="text-ink">{d.melhor.faixa}</strong> ({d.melhor.taxa}% de {d.melhor.tentativas} ligações). </> : "Ainda poucos dados: preciso de pelo menos 3 ligações por faixa para sugerir. "}
            Faixas: {FAIXAS.slice(0, 4).join(", ")}.
          </p>
        </Cartao>

        <Cartao titulo="Por que perdemos clientes?" pergunta="Motivos informados em “Não tenho interesse”." vazio={d.perdas.length === 0 ? "Nenhum motivo registrado ainda." : undefined}>
          <Barras dados={d.perdas} horizontal cor="#8A672A" />
        </Cartao>

        <Cartao titulo="Quais empreendimentos geram interesse?" pergunta="Os 8 mais citados nos cadastros." vazio={d.emps.length === 0 ? "Nenhum empreendimento informado ainda." : undefined}>
          <Barras dados={d.emps} horizontal />
        </Cartao>

        <Cartao titulo="Como estão as bases?" pergunta="Clientes por base e por temperatura." vazio={d.total === 0 ? "Sem dados ainda." : undefined}>
          <Barras dados={d.bases} horizontal cor={ESCURO} altura={200} />
          <p className="mt-2 text-xs text-muted">Temperatura: {d.temp.map((t) => `${t.nome} ${t.valor}`).join(" · ")}</p>
        </Cartao>
      </div>
    </div>
  );
}
