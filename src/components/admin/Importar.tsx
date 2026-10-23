"use client";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { validarTelefone } from "@/lib/telefone";
import { Aviso } from "./ui";

// Campos que a planilha pode preencher, com apelidos aceitos nos cabeçalhos.
const CAMPOS: { id: string; rotulo: string; apelidos: string[] }[] = [
  { id: "nome", rotulo: "Nome", apelidos: ["nome", "cliente", "name", "nome completo"] },
  { id: "celular", rotulo: "Celular / WhatsApp", apelidos: ["celular", "whatsapp", "cel", "telefone celular", "mobile"] },
  { id: "telefone", rotulo: "Telefone", apelidos: ["telefone", "fone", "tel", "telefone fixo", "phone"] },
  { id: "email", rotulo: "E-mail", apelidos: ["email", "e-mail", "mail"] },
  { id: "endereco", rotulo: "Endereço", apelidos: ["endereco", "endereço", "logradouro", "rua"] },
  { id: "bairro", rotulo: "Bairro", apelidos: ["bairro"] },
  { id: "cidade", rotulo: "Cidade", apelidos: ["cidade", "municipio", "município"] },
  { id: "cep", rotulo: "CEP", apelidos: ["cep"] },
  { id: "empreendimento_interesse", rotulo: "Empreendimento de interesse", apelidos: ["empreendimento", "interesse", "produto", "imovel", "imóvel"] },
  { id: "observacoes", rotulo: "Observações", apelidos: ["observacao", "observação", "observacoes", "observações", "obs", "notas"] },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Leitor de CSV simples (aspas, vírgula ou ponto e vírgula). */
function lerCsv(texto: string): string[][] {
  const t = texto.replace(/^﻿/, "");
  const primeira = t.split(/\r?\n/)[0] || "";
  const sep = (primeira.match(/;/g) || []).length >= (primeira.match(/,/g) || []).length ? ";" : ",";
  const linhas: string[][] = []; let atual: string[] = []; let campo = ""; let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (aspas) {
      if (ch === '"' && t[i + 1] === '"') { campo += '"'; i++; } else if (ch === '"') aspas = false; else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) { atual.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i + 1] === "\n") i++; atual.push(campo); campo = ""; if (atual.some((x) => x.trim())) linhas.push(atual); atual = []; }
    else campo += ch;
  }
  atual.push(campo); if (atual.some((x) => x.trim())) linhas.push(atual);
  return linhas;
}

export function Importar({ onConcluido }: { onConcluido: () => void }) {
  const [linhas, setLinhas] = useState<string[][]>([]);
  const [mapa, setMapa] = useState<Record<string, number>>({});
  const [origem, setOrigem] = useState("importacao");
  const [autorizado, setAutorizado] = useState(false);
  const [existentes, setExistentes] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [erro, setErro] = useState("");

  const cabecalho = linhas[0] || [];
  const dados = linhas.slice(1);

  async function carregarArquivo(arq: File) {
    setErro(""); setResultado("");
    const texto = await arq.text();
    const l = lerCsv(texto);
    if (l.length < 2) { setErro("Não encontrei linhas de dados. Salve a planilha como CSV (separado por vírgulas ou ponto e vírgula)."); return; }
    setLinhas(l);
    const m: Record<string, number> = {};
    CAMPOS.forEach((c) => {
      const i = l[0].findIndex((h) => c.apelidos.includes(norm(h)));
      if (i >= 0) m[c.id] = i;
    });
    setMapa(m);
    // se a planilha só tem uma coluna de telefone, ela entra como "celular" e o sistema separa fixo e celular
    const nums = l.slice(1).flatMap((r) => [m.celular, m.telefone].filter((x) => x !== undefined).map((i) => validarTelefone(r[i as number] || "").digitos)).filter(Boolean);
    const sb = getSupabase();
    if (sb && nums.length) {
      const achados = new Set<string>();
      for (let i = 0; i < nums.length; i += 200) {
        const parte = nums.slice(i, i + 200).join(",");
        const { data } = await sb.from("clientes").select("celular,telefone").or(`celular.in.(${parte}),telefone.in.(${parte})`);
        (data || []).forEach((r: { celular: string | null; telefone: string | null }) => { if (r.celular) achados.add(r.celular); if (r.telefone) achados.add(r.telefone); });
      }
      setExistentes(achados);
    }
  }

  const analise = useMemo(() => {
    const vistos = new Set<string>();
    const ok: Record<string, string | boolean | null>[] = []; const invalidos: string[] = []; let dupArquivo = 0; let dupBanco = 0; let semNome = 0;
    const pega = (r: string[], id: string) => (mapa[id] !== undefined ? (r[mapa[id]] || "").trim() : "");
    for (const r of dados) {
      const nome = pega(r, "nome");
      if (!nome) { semNome++; continue; }
      const t1 = validarTelefone(pega(r, "celular")); const t2 = validarTelefone(pega(r, "telefone"));
      let cel: string | null = null, fix: string | null = null;
      for (const t of [t1, t2]) { if (!t.valido) continue; if (t.tipo === "celular" && !cel) cel = t.digitos; else if (t.tipo === "fixo" && !fix) fix = t.digitos; }
      if (!cel && !fix) { invalidos.push(`${nome} (${t1.motivo || t2.motivo || "sem telefone"})`); continue; }
      const chave = cel || fix!;
      if (vistos.has(chave)) { dupArquivo++; continue; }
      vistos.add(chave);
      if (existentes.has(chave) || (fix && existentes.has(fix))) { dupBanco++; continue; }
      ok.push({
        nome, celular: cel, telefone: fix, hotfone: cel ? "celular" : "telefone", telefone_valido: true,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pega(r, "email")) ? pega(r, "email") : null,
        endereco: pega(r, "endereco") || null, bairro: pega(r, "bairro") || null, cidade: pega(r, "cidade") || null,
        cep: pega(r, "cep") || null, empreendimento_interesse: pega(r, "empreendimento_interesse") || null, observacoes: pega(r, "observacoes") || null,
      });
    }
    return { ok, invalidos, dupArquivo, dupBanco, semNome };
  }, [dados, mapa, existentes]);

  async function importar() {
    const sb = getSupabase(); if (!sb || !analise.ok.length) return;
    setEnviando(true); setErro(""); setResultado("");
    let gravados = 0;
    for (let i = 0; i < analise.ok.length; i += 200) {
      const lote = analise.ok.slice(i, i + 200).map((r) => ({ ...r, origem, base: "novos", etapa: "novo", consentimento: false }));
      const { error } = await sb.from("clientes").insert(lote);
      if (error) { setErro(`Parou após ${gravados} clientes: ${error.message}`); setEnviando(false); return; }
      gravados += lote.length;
    }
    setEnviando(false); setResultado(`${gravados} clientes importados para a base Novos.`);
    setLinhas([]);
    setTimeout(onConcluido, 1200);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Importar clientes</h1>
        <p className="mt-1 text-sm text-muted">Envie uma planilha salva como <strong>CSV</strong> (no Excel: Arquivo → Salvar como → CSV). A primeira linha deve ter os nomes das colunas. O sistema valida os telefones e pula duplicados.</p>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gold/60 bg-white p-8 text-center hover:bg-gold/5">
        <Upload size={22} className="text-golddark" />
        <span className="text-sm font-medium text-ink">Escolher arquivo CSV</span>
        <input type="file" accept=".csv,text/csv,.txt" className="sr-only" onChange={(e) => e.target.files?.[0] && carregarArquivo(e.target.files[0])} />
      </label>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {resultado && <Aviso tipo="ok">{resultado}</Aviso>}

      {linhas.length > 0 && (
        <>
          <section className="rounded-lg border border-ink/10 bg-white p-4">
            <h2 className="mb-1 font-serif text-lg font-semibold">1. Conferir as colunas</h2>
            <p className="mb-3 text-xs text-muted">Reconheci as colunas abaixo. Ajuste se algo estiver trocado.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAMPOS.map((c) => (
                <label key={c.id}><span className="label">{c.rotulo}{c.id === "nome" ? " *" : ""}</span>
                  <select className="field" value={mapa[c.id] ?? ""} onChange={(e) => setMapa((m) => { const n = { ...m }; if (e.target.value === "") delete n[c.id]; else n[c.id] = Number(e.target.value); return n; })}>
                    <option value="">— não importar —</option>
                    {cabecalho.map((h, i) => <option key={i} value={i}>{h || `Coluna ${i + 1}`}</option>)}
                  </select></label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-ink/10 bg-white p-4">
            <h2 className="mb-3 font-serif text-lg font-semibold">2. Resultado da verificação</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted">Linhas no arquivo</dt><dd className="font-serif text-2xl">{dados.length}</dd></div>
              <div><dt className="text-xs text-muted">Prontas para importar</dt><dd className="font-serif text-2xl text-emerald-800">{analise.ok.length}</dd></div>
              <div><dt className="text-xs text-muted">Telefone inválido</dt><dd className="font-serif text-2xl text-red-700">{analise.invalidos.length}</dd></div>
              <div><dt className="text-xs text-muted">Duplicadas</dt><dd className="font-serif text-2xl text-amber-800">{analise.dupArquivo + analise.dupBanco}</dd></div>
            </dl>
            {analise.semNome > 0 && <p className="mt-2 text-xs text-muted">{analise.semNome} linhas sem nome foram ignoradas.</p>}
            {analise.dupBanco > 0 && <p className="mt-1 text-xs text-muted">{analise.dupBanco} já existem no CRM; {analise.dupArquivo} se repetem no arquivo.</p>}
            {analise.invalidos.length > 0 && (
              <details className="mt-3 text-xs"><summary className="cursor-pointer font-medium text-red-700">Ver telefones inválidos (primeiros 15)</summary>
                <ul className="mt-1 list-disc pl-5 text-muted">{analise.invalidos.slice(0, 15).map((x, i) => <li key={i}>{x}</li>)}</ul></details>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-white p-4">
            <h2 className="mb-3 font-serif text-lg font-semibold">3. Importar</h2>
            <label className="block max-w-xs"><span className="label">Origem dos contatos</span>
              <select className="field" value={origem} onChange={(e) => setOrigem(e.target.value)}>{["importacao", "indicacao", "evento", "facebook", "instagram", "google", "oferta_ativa", "outro"].map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 accent-[#C19A5B]" checked={autorizado} onChange={(e) => setAutorizado(e.target.checked)} />
              <span>Confirmo que tenho base legal (consentimento, relacionamento prévio ou legítimo interesse) para contatar estas pessoas, conforme a LGPD.</span>
            </label>
            <button className="btn btn-gold mt-4 disabled:opacity-50" disabled={!autorizado || enviando || mapa.nome === undefined || analise.ok.length === 0} onClick={importar}>
              {enviando ? "Importando…" : `Importar ${analise.ok.length} clientes`}
            </button>
            {mapa.nome === undefined && <p className="mt-2 text-xs text-red-700">Escolha qual coluna é o nome.</p>}
          </section>
        </>
      )}
    </div>
  );
}
