"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EMPS, brl, getEmp } from "@/lib/emp";
import { whatsappLink } from "@/lib/site";

type Sistema = "SAC" | "PRICE";
const num = (v: string) => { const n = parseFloat(v.replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };

function Campo({ id, label, value, onChange, suf, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; suf?: string; hint?: string }) {
  return (
    <div><label className="label" htmlFor={id}>{label}</label>
      <div className="relative"><input id={id} inputMode="decimal" className="field" value={value} onChange={(e) => onChange(e.target.value)} />
        {suf && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{suf}</span>}</div>
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}</div>
  );
}

export function Simulador() {
  const sp = useSearchParams();
  const emp0 = getEmp(sp.get("emp") || "");
  const [empId, setEmpId] = useState(emp0?.id || "");
  const [preco, setPreco] = useState(emp0?.precoAPartir ? String(emp0.precoAPartir) : "600000");
  const [atoPct, setAtoPct] = useState("10");
  const [nMensal, setNMensal] = useState("36");
  const [mensal, setMensal] = useState("2500");
  const [anual, setAnual] = useState("15000");
  const [meses, setMeses] = useState("36");
  const [incc, setIncc] = useState("5");
  const [bancoPct, setBancoPct] = useState("80");
  const [juros, setJuros] = useState("11,5");
  const [anos, setAnos] = useState("30");
  const [sis, setSis] = useState<Sistema>("SAC");
  const [valoriz, setValoriz] = useState("6");

  function escolher(id: string) {
    setEmpId(id);
    const e = getEmp(id);
    if (e?.precoAPartir) setPreco(String(e.precoAPartir));
  }

  const r = useMemo(() => {
    const P = num(preco), ato = P * num(atoPct) / 100, N = Math.max(0, Math.round(num(nMensal))), V = num(mensal), A = num(anual);
    const M = Math.max(1, Math.round(num(meses))), i = num(incc) / 100, q = Math.pow(1 + i, 1 / 12);
    const mensaisNom = N * V;
    const anuaisMeses: number[] = []; for (let m = 12; m <= M; m += 12) anuaisMeses.push(m);
    const anuaisNom = anuaisMeses.length * A;
    const saldoNom = P - ato - mensaisNom - anuaisNom;
    // valores corrigidos pelo índice até o mês de pagamento
    let mensaisCorr = 0; for (let k = 1; k <= N; k++) mensaisCorr += V * Math.pow(q, k);
    const anuaisCorr = anuaisMeses.reduce((a, m) => a + A * Math.pow(q, m), 0);
    const saldoCorr = saldoNom > 0 ? saldoNom * Math.pow(q, M) : 0;
    const banco = saldoCorr * Math.min(100, num(bancoPct)) / 100;
    const proprio = saldoCorr - banco;
    const n = Math.max(1, Math.round(num(anos) * 12)), j = Math.pow(1 + num(juros) / 100, 1 / 12) - 1;
    let totalFin = 0, p1 = 0, pN = 0;
    if (banco > 0) {
      if (sis === "SAC") { const am = banco / n; p1 = am + banco * j; pN = am * (1 + j); totalFin = n * am + j * banco * (n + 1) / 2; }
      else { p1 = pN = j > 0 ? banco * j / (1 - Math.pow(1 + j, -n)) : banco / n; totalFin = p1 * n; }
    }
    const custoObra = ato + mensaisCorr + anuaisCorr + proprio;
    const total = custoObra + totalFin;
    const g = num(valoriz) / 100, valorEntrega = P * Math.pow(1 + g, M / 12);
    // série
    const serie: { mes: number; Pago: number }[] = []; let acc = ato;
    for (let m = 0; m <= M; m++) {
      if (m >= 1 && m <= N) acc += V * Math.pow(q, m);
      if (m > 0 && m % 12 === 0) acc += A * Math.pow(q, m);
      if (m === M) acc += proprio;
      if (m % Math.max(1, Math.floor(M / 24)) === 0 || m === M) serie.push({ mes: m, Pago: Math.round(acc) });
    }
    return { P, ato, mensaisNom, anuaisNom, saldoNom, mensaisCorr, anuaisCorr, saldoCorr, banco, proprio, p1, pN, totalFin, custoObra, total, valorEntrega, ganho: valorEntrega - P, serie, N, M };
  }, [preco, atoPct, nMensal, mensal, anual, meses, incc, bancoPct, juros, anos, sis, valoriz]);

  const e = getEmp(empId);
  const aviso = r.saldoNom < 0 ? "A soma de ato, mensais e anuais ultrapassa o preço. Ajuste os valores." : null;
  const msg = `Olá, Mendes! Fiz uma simulação no site${e ? ` do ${e.nome}` : ""}: preço ${brl(r.P)}, ato ${brl(r.ato)}, ${r.N}x de ${brl(num(mensal))}, saldo nas chaves ${brl(r.saldoCorr)} (corrigido). Quero conversar.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <form className="space-y-5 rounded-md border border-ink/10 bg-sand p-6" onSubmit={(ev) => ev.preventDefault()}>
        <div><label className="label" htmlFor="s-emp">Empreendimento (opcional)</label>
          <select id="s-emp" className="field" value={empId} onChange={(ev) => escolher(ev.target.value)}><option value="">Valores livres</option>{EMPS.map((x) => <option key={x.id} value={x.id}>{x.nome} — {x.cidade}</option>)}</select>
          {e && <p className="mt-1 text-[11px] text-muted">{e.precoAPartir ? "Preço de partida preenchido a partir da tabela. " : "Sem tabela cadastrada: informe o preço. "}Todos os campos são editáveis.</p>}</div>
        <Campo id="s-p" label="Preço do imóvel" suf="R$" value={preco} onChange={setPreco} />
        <div className="grid grid-cols-2 gap-4"><Campo id="s-a" label="Ato" suf="%" value={atoPct} onChange={setAtoPct} /><Campo id="s-m" label="Meses de obra" value={meses} onChange={setMeses} /></div>
        <div className="grid grid-cols-2 gap-4"><Campo id="s-nm" label="Nº de mensais" value={nMensal} onChange={setNMensal} /><Campo id="s-vm" label="Valor da mensal" suf="R$" value={mensal} onChange={setMensal} /></div>
        <Campo id="s-an" label="Reforço anual" suf="R$" value={anual} onChange={setAnual} hint="Pago nos meses 12, 24, 36… até o fim da obra." />
        <Campo id="s-i" label="Correção (INCC) ao ano" suf="%" value={incc} onChange={setIncc} hint="Premissa sua. Teste cenários mais altos." />
        <div className="grid grid-cols-2 gap-4"><Campo id="s-b" label="Financiado nas chaves" suf="%" value={bancoPct} onChange={setBancoPct} /><Campo id="s-j" label="Juros ao ano" suf="%" value={juros} onChange={setJuros} /></div>
        <div className="grid grid-cols-2 gap-4"><Campo id="s-y" label="Prazo (anos)" value={anos} onChange={setAnos} />
          <div><label className="label" htmlFor="s-s">Sistema</label><select id="s-s" className="field" value={sis} onChange={(ev) => setSis(ev.target.value as Sistema)}><option value="SAC">SAC</option><option value="PRICE">Price</option></select></div></div>
        <Campo id="s-v" label="Valorização ao ano (hipótese)" suf="%" value={valoriz} onChange={setValoriz} />
      </form>

      <div className="space-y-6">
        {aviso && <p role="alert" className="rounded border border-red-400/50 bg-red-950/40 p-4 text-sm text-red-200">{aviso}</p>}
        <div className="grid gap-px overflow-hidden rounded-md border border-ink/10 bg-ink/5 sm:grid-cols-2">
          {([["Ato", r.ato], ["Mensais (corrigidas)", r.mensaisCorr], ["Anuais (corrigidos)", r.anuaisCorr], ["Saldo nas chaves (corrigido)", r.saldoCorr], ["Financiado", r.banco], ["Recursos próprios nas chaves", r.proprio]] as [string, number][]).map(([k, v]) => (
            <div key={k} className="bg-sand p-4"><p className="text-[11px] uppercase tracking-wider text-muted">{k}</p><p className="mt-1 font-serif text-xl tabular-nums">{brl(v)}</p></div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-gold/50 bg-snow p-5"><p className="text-[11px] uppercase tracking-wider text-muted">Parcela do financiamento ({sis})</p>
            <p className="mt-1 font-serif text-2xl text-golddark tabular-nums">{brl(r.p1)}</p>{sis === "SAC" && <p className="text-xs text-muted">decresce até {brl(r.pN)}</p>}</div>
          <div className="rounded-md border border-gold/50 bg-snow p-5"><p className="text-[11px] uppercase tracking-wider text-muted">Custo total estimado</p>
            <p className="mt-1 font-serif text-2xl text-golddark tabular-nums">{brl(r.total)}</p><p className="text-xs text-muted">obra {brl(r.custoObra)} + financiamento {brl(r.totalFin)}</p></div>
        </div>
        <div className="rounded-md border border-ink/10 bg-sand p-4">
          <p className="mb-2 text-sm font-semibold">Total pago até a entrega (valores corrigidos)</p>
          <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={r.serie}>
            <CartesianGrid stroke="rgba(23,21,19,.08)" /><XAxis dataKey="mes" stroke="#8d867b" fontSize={11} unit="m" /><YAxis stroke="#8d867b" fontSize={11} width={64} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => brl(v)} labelFormatter={(l) => `Mês ${l}`} contentStyle={{ background: "#FFFFFF", border: "1px solid #E4DED2" }} /><Legend />
            <Area type="monotone" dataKey="Pago" stroke="#9A7430" fill="rgba(193,154,91,.28)" /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-md border border-ink/10 bg-sand p-5 text-sm text-charcoal/80">
          <p>Valor do imóvel na entrega com valorização de {num(valoriz)}% a.a. (hipótese): <strong className="text-golddark">{brl(r.valorEntrega)}</strong> ({r.ganho >= 0 ? "+" : ""}{brl(r.ganho)} sobre o preço).</p>
        </div>
        <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full justify-center">Conversar sobre esta simulação</a>
        <p className="text-xs leading-relaxed text-muted">Simulação ilustrativa e didática. Não constitui proposta, oferta nem promessa de rentabilidade ou valorização. Índices, juros, tarifas, seguros e condições reais variam por contrato e instituição financeira. Confirme com a incorporadora e o banco.</p>
      </div>
    </div>
  );
}
