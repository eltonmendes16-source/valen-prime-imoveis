"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { comparar, type Entrada } from "@/lib/aluguelCompra";
import { brl } from "@/lib/emp";
import { registrar } from "@/lib/comportamento";

const PADRAO: Entrada = {
  valor: 800000, entradaPct: 20, taxaFin: 11.5, prazoAnos: 30, sistema: "price", aluguel: 3600, reajusteAluguel: 5,
  valorizacao: 5, rendimento: 8, custoCompraPct: 4, manutencaoPct: 1, custoVendaPct: 6, horizonteAnos: 10,
};

function Num({ id, rotulo, valor, onChange, passo = 1, min = 0, sufixo, dica }: { id: string; rotulo: string; valor: number; onChange: (v: number) => void; passo?: number; min?: number; sufixo?: string; dica?: string }) {
  return (
    <div>
      <label htmlFor={id} className="label">{rotulo}</label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" min={min} step={passo} value={Number.isFinite(valor) ? valor : ""} onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))} className="field pr-12" />
        {sufixo && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{sufixo}</span>}
      </div>
      {dica && <p className="mt-1 text-[11px] text-muted">{dica}</p>}
    </div>
  );
}

function Grafico({ pontos }: { pontos: { ano: number; comprar: number; alugar: number }[] }) {
  const W = 640, H = 240, pl = 8, pb = 24;
  const todos = pontos.flatMap((p) => [p.comprar, p.alugar]);
  const min = Math.min(0, ...todos), max = Math.max(...todos, 1);
  const x = (i: number) => pl + (i / Math.max(pontos.length - 1, 1)) * (W - pl * 2);
  const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * (H - pb - 16);
  const linha = (k: "comprar" | "alugar") => pontos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Patrimônio ao longo dos anos: comprar contra alugar e investir">
      <line x1={pl} x2={W - pl} y1={y(0)} y2={y(0)} stroke="#00000022" strokeDasharray="3 3" />
      <path d={linha("alugar")} fill="none" stroke="#1F1C19" strokeWidth="2.5" />
      <path d={linha("comprar")} fill="none" stroke="#C19A5B" strokeWidth="2.5" />
      {pontos.map((p, i) => (i % Math.ceil(pontos.length / 8) === 0 || i === pontos.length - 1) && <text key={p.ano} x={x(i)} y={H - 6} fontSize="11" textAnchor="middle" fill="#6b655d">{p.ano}a</text>)}
    </svg>
  );
}

export function AluguelOuCompra() {
  const [e, setE] = useState<Entrada>(PADRAO);
  const [aluguelManual, setAluguelManual] = useState(false);
  const set = <K extends keyof Entrada>(k: K, v: Entrada[K]) => {
    setE((a) => {
      const n = { ...a, [k]: v };
      if (k === "valor" && !aluguelManual && Number.isFinite(v as number)) n.aluguel = Math.round((v as number) * 0.0045);
      return n;
    });
    if (k === "aluguel") setAluguelManual(true);
  };
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const v = Number(q.get("valor")), ent = Number(q.get("entrada"));
    if (v > 0) setE((a) => ({ ...a, valor: v, aluguel: Math.round(v * 0.0045), entradaPct: ent > 0 && ent < v ? Math.round((ent / v) * 100) : a.entradaPct }));
    registrar({ tipo: "simulador" });
  }, []);

  const ok = [e.valor, e.entradaPct, e.taxaFin, e.prazoAnos, e.aluguel, e.reajusteAluguel, e.valorizacao, e.rendimento, e.custoCompraPct, e.manutencaoPct, e.custoVendaPct, e.horizonteAnos].every(Number.isFinite) && e.valor > 0 && e.entradaPct >= 0 && e.entradaPct <= 100 && e.prazoAnos >= 1;
  const r = useMemo(() => (ok ? comparar(e) : null), [e, ok]);
  const ult = r?.pontos[r.pontos.length - 1];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form className="space-y-6" onSubmit={(ev) => ev.preventDefault()} aria-label="Dados da comparação">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="eyebrow mb-2">Comprar</legend>
          <Num id="ac-valor" rotulo="Valor do imóvel (R$)" valor={e.valor} onChange={(v) => set("valor", v)} passo={10000} />
          <Num id="ac-ent" rotulo="Entrada" valor={e.entradaPct} onChange={(v) => set("entradaPct", v)} sufixo="%" dica={ok ? `${brl(e.valor * e.entradaPct / 100)}` : undefined} />
          <Num id="ac-taxa" rotulo="Juros do financiamento" valor={e.taxaFin} onChange={(v) => set("taxaFin", v)} passo={0.25} sufixo="% a.a." />
          <Num id="ac-prazo" rotulo="Prazo do financiamento" valor={e.prazoAnos} onChange={(v) => set("prazoAnos", v)} sufixo="anos" min={1} />
          <div>
            <label htmlFor="ac-sis" className="label">Sistema de amortização</label>
            <select id="ac-sis" className="field" value={e.sistema} onChange={(ev) => set("sistema", ev.target.value as Entrada["sistema"])}><option value="price">Price (parcela fixa)</option><option value="sac">SAC (parcela cai)</option></select>
          </div>
          <Num id="ac-cc" rotulo="Custos de compra" valor={e.custoCompraPct} onChange={(v) => set("custoCompraPct", v)} passo={0.5} sufixo="%" dica="ITBI, escritura e registro. Varia por cidade." />
          <Num id="ac-man" rotulo="Manutenção e IPTU do dono" valor={e.manutencaoPct} onChange={(v) => set("manutencaoPct", v)} passo={0.25} sufixo="% a.a." dica="Sobre o valor do imóvel." />
          <Num id="ac-val" rotulo="Valorização do imóvel" valor={e.valorizacao} onChange={(v) => set("valorizacao", v)} passo={0.5} sufixo="% a.a." />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="eyebrow mb-2">Alugar e investir a diferença</legend>
          <Num id="ac-alu" rotulo="Aluguel mensal (R$)" valor={e.aluguel} onChange={(v) => set("aluguel", v)} passo={100} dica="Sugestão inicial: 0,45% do valor do imóvel." />
          <Num id="ac-rea" rotulo="Reajuste do aluguel" valor={e.reajusteAluguel} onChange={(v) => set("reajusteAluguel", v)} passo={0.5} sufixo="% a.a." />
          <Num id="ac-ren" rotulo="Rendimento da aplicação" valor={e.rendimento} onChange={(v) => set("rendimento", v)} passo={0.5} sufixo="% a.a." dica="Líquido de impostos." />
          <Num id="ac-cv" rotulo="Custo de venda do imóvel" valor={e.custoVendaPct} onChange={(v) => set("custoVendaPct", v)} passo={0.5} sufixo="%" dica="Corretagem e impostos na venda." />
          <Num id="ac-h" rotulo="Comparar após" valor={e.horizonteAnos} onChange={(v) => set("horizonteAnos", v)} sufixo="anos" min={1} />
        </fieldset>
        <button type="button" className="text-sm underline" onClick={() => { setE(PADRAO); setAluguelManual(false); }}>Voltar aos valores de exemplo</button>
      </form>

      <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {!r || !ult ? <p className="rounded bg-sand p-6 text-sm text-mutedink">Preencha todos os campos com números válidos para ver o resultado.</p> : (
          <>
            <div className="rounded-md border border-gold/60 bg-white p-6 shadow-sm" aria-live="polite">
              <p className="text-xs uppercase tracking-wider text-muted">Em {ult.ano} anos</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-ink">
                {r.diferenca >= 0 ? "Comprar" : "Alugar e investir"} deixa você com <span className="text-golddark">{brl(Math.abs(r.diferenca))}</span> a mais
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted">Patrimônio comprando</dt><dd className="font-semibold">{brl(ult.comprar)}</dd></div>
                <div><dt className="text-muted">Patrimônio alugando</dt><dd className="font-semibold">{brl(ult.alugar)}</dd></div>
                <div><dt className="text-muted">Parcela inicial</dt><dd className="font-semibold">{brl(r.parcelaInicial)}</dd></div>
                <div><dt className="text-muted">Entrada + custos</dt><dd className="font-semibold">{brl(r.entrada + r.custoCompra)}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-mutedink">{r.equilibrio ? `Neste cenário, comprar passa a compensar a partir do ano ${r.equilibrio}.` : `Neste cenário, comprar não alcança alugar dentro de ${ult.ano} anos.`}</p>
            </div>
            <div className="rounded-md border border-ink/10 bg-white p-4">
              <Grafico pontos={r.pontos} />
              <p className="mt-1 flex gap-4 text-xs text-muted"><span><b className="text-golddark">━</b> Comprando</span><span><b className="text-ink">━</b> Alugando e investindo</span></p>
            </div>
          </>
        )}
        <div className="rounded border border-gold/40 bg-gold/10 p-4 text-sm text-ink" role="note">
          <p><b>É uma simulação, não uma previsão.</b> Os números iniciais são só exemplos. O resultado depende de juros, valorização, aluguel e rendimento, que ninguém sabe com certeza. Valores nominais, sem imposto de renda e sem inflação, com condomínio igual nos dois cenários. Em imóvel na planta, tudo o que é pago antes do financiamento entra como entrada, sem considerar as datas. A parcela e a aprovação do financiamento dependem do banco. Veja também o <Link href="/simulador" className="underline">simulador de fluxo da planta</Link>.</p>
        </div>
      </div>
    </div>
  );
}
