"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Aviso } from "./ui";

const TABELAS = [
  ["Clientes", "clientes"], ["Interações", "interacoes"], ["Contratos", "contratos"], ["Etapas e documentos", "contrato_itens"],
  ["Parcelas", "contrato_parcelas"], ["Atualizações", "atualizacoes"], ["Depoimentos", "depoimentos"], ["Inscritos no boletim", "inscritos_boletim"],
] as const;

async function tudo(tabela: string) {
  const sb = getSupabase()!;
  const linhas: Record<string, unknown>[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await sb.from(tabela).select("*").order("criado_em", { ascending: true }).range(de, de + 999);
    if (error) throw new Error(`${tabela}: ${error.message}`);
    linhas.push(...((data || []) as Record<string, unknown>[]));
    if (!data || data.length < 1000) break;
  }
  return linhas;
}
const celula = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : typeof v === "number" || typeof v === "boolean" ? v : String(v));

export function Backup() {
  const [estado, setEstado] = useState<"" | "gerando" | "ok" | "erro">("");
  const [msg, setMsg] = useState("");
  async function baixar() {
    if (!getSupabase()) return;
    setEstado("gerando"); setMsg("");
    try {
      const { default: writeXlsxFile } = await import("write-excel-file");
      const dados: { valor: unknown; fontWeight?: "bold" }[][][] = [];
      let total = 0;
      for (const [, t] of TABELAS) {
        const l = await tudo(t);
        total += l.length;
        const cols = l.length ? Object.keys(l[0]) : ["(vazio)"];
        dados.push([
          cols.map((c) => ({ value: c, fontWeight: "bold" as const })),
          ...l.map((r) => cols.map((c) => ({ value: celula(r[c]) }))),
        ] as never);
      }
      const dia = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      await writeXlsxFile(dados as never, { sheets: TABELAS.map(([n]) => n), fileName: `backup-crm-valen-prime-${dia}.xlsx` } as never);
      setEstado("ok"); setMsg(`Backup baixado: ${total} registros em ${TABELAS.length} abas.`);
    } catch (e) { setEstado("erro"); setMsg(e instanceof Error ? e.message : "Não foi possível gerar o backup."); }
  }
  return (
    <section className="mt-8 rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-ink">Backup dos dados</h2>
      <p className="mt-1 text-sm text-muted">Baixe uma cópia de todos os clientes, histórico, contratos, atualizações e depoimentos em um arquivo Excel. Guarde em um lugar seguro (seu computador ou Drive pessoal): o arquivo contém dados pessoais. Uma cópia automática também é guardada toda semana no sistema.</p>
      <button onClick={baixar} disabled={estado === "gerando"} className="btn btn-gold mt-3 !py-2 disabled:opacity-60"><Download size={16} /> {estado === "gerando" ? "Gerando…" : "Baixar backup (Excel)"}</button>
      {msg && <div className="mt-3"><Aviso tipo={estado === "erro" ? "erro" : "ok"}>{msg}</Aviso></div>}
    </section>
  );
}
