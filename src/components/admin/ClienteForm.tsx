"use client";
import { useState } from "react";
import emps from "@/data/empreendimentos.json";
import { getSupabase } from "@/lib/supabase";
import { GENEROS, ORIGENS, PAGAMENTOS, RENDAS, TIPOS_IMOVEL, TEMPERATURAS, type Cliente } from "@/lib/crm";
import { formatarTelefone, limparTelefone, validarTelefone } from "@/lib/telefone";
import { Aviso, Campo } from "./ui";

const nomesEmp = (emps as { nome: string }[]).map((e) => e.nome);
type Form = Record<string, string | boolean>;

const vazio: Form = {
  nome: "", telefone: "", celular: "", hotfone: "celular", email: "", cep: "", endereco: "", bairro: "", cidade: "",
  idade: "", genero: "", profissao: "", renda_faixa: "", empreendimento_interesse: "", tipo_imovel: "", dormitorios: "",
  faixa_valor: "", forma_pagamento: "", prazo: "", origem: "manual", melhor_horario: "", temperatura: "morno", tags: "",
  observacoes: "", consentimento: false,
};

function deCliente(c: Cliente): Form {
  const f: Form = { ...vazio };
  (Object.keys(vazio) as string[]).forEach((k) => {
    const v = (c as unknown as Record<string, unknown>)[k];
    if (k === "tags") f.tags = (c.tags || []).join(", ");
    else if (k === "telefone" || k === "celular") f[k] = formatarTelefone(v as string | null);
    else if (k === "consentimento") f.consentimento = Boolean(v);
    else if (v !== null && v !== undefined) f[k] = String(v);
  });
  return f;
}

export function ClienteForm({ inicial, onSalvo, onCancelar, onAbrirExistente }: {
  inicial?: Cliente; onSalvo: (c: Cliente) => void; onCancelar?: () => void; onAbrirExistente?: (id: string) => void;
}) {
  const novo = !inicial;
  const [f, setF] = useState<Form>(inicial ? deCliente(inicial) : vazio);
  const [erros, setErros] = useState<string[]>([]);
  const [duplicado, setDuplicado] = useState<{ id: string; nome: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: string, v: string | boolean) => setF((a) => ({ ...a, [k]: v }));
  const s = (k: string) => String(f[k] ?? "");

  async function buscarCep() {
    const cep = s("cep").replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) setF((a) => ({ ...a, endereco: a.endereco || [d.logradouro, d.complemento].filter(Boolean).join(", "), bairro: a.bairro || d.bairro || "", cidade: a.cidade || d.localidade || "" }));
    } catch { /* o preenchimento é opcional */ }
  }

  async function salvar(ignorarDuplicado = false) {
    const sb = getSupabase(); if (!sb) return;
    const problemas: string[] = [];
    const nome = s("nome").trim();
    if (nome.length < 2) problemas.push("Informe o nome.");
    const tel = s("telefone").trim() ? validarTelefone(s("telefone")) : null;
    const cel = s("celular").trim() ? validarTelefone(s("celular")) : null;
    if (tel && !tel.valido) problemas.push(`Telefone: ${tel.motivo}.`);
    else if (tel && tel.tipo === "celular") problemas.push("O campo Telefone é para número fixo. Coloque este número em Celular.");
    if (cel && !cel.valido) problemas.push(`Celular: ${cel.motivo}.`);
    else if (cel && cel.tipo === "fixo") problemas.push("O campo Celular precisa ter 9 dígitos após o DDD.");
    if (!tel && !cel) problemas.push("Informe pelo menos um telefone.");
    const email = s("email").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problemas.push("E-mail em formato inválido.");
    if (novo) {
      if (!tel) problemas.push("Telefone é obrigatório no cadastro novo.");
      if (!cel) problemas.push("Celular é obrigatório no cadastro novo.");
      if (!email) problemas.push("E-mail é obrigatório no cadastro novo.");
      if (!s("endereco").trim()) problemas.push("Endereço é obrigatório no cadastro novo.");
    }
    if (s("idade") && (Number(s("idade")) < 0 || Number(s("idade")) > 120 || Number.isNaN(Number(s("idade"))))) problemas.push("Idade inválida.");
    setErros(problemas);
    if (problemas.length) return;

    const dTel = tel?.digitos || null, dCel = cel?.digitos || null;
    if (novo && !ignorarDuplicado) {
      const filtros = [dCel && `celular.eq.${dCel}`, dTel && `telefone.eq.${dTel}`, dCel && `telefone.eq.${dCel}`, email && `email.eq.${email}`].filter(Boolean).join(",");
      const { data } = await sb.from("clientes").select("id,nome").or(filtros).limit(1);
      if (data && data.length) { setDuplicado(data[0] as { id: string; nome: string }); return; }
    }
    setDuplicado(null); setSalvando(true);
    const hot = s("hotfone") === "telefone" && dTel ? "telefone" : "celular";
    const dados: Record<string, unknown> = {
      nome, telefone: dTel, celular: dCel, hotfone: dCel ? hot : "telefone", telefone_valido: true, email: email || null,
      cep: s("cep").trim() || null, endereco: s("endereco").trim() || null, bairro: s("bairro").trim() || null, cidade: s("cidade").trim() || null,
      idade: s("idade") ? Number(s("idade")) : null, genero: s("genero") || null, profissao: s("profissao").trim() || null, renda_faixa: s("renda_faixa") || null,
      empreendimento_interesse: s("empreendimento_interesse").trim() || null, tipo_imovel: s("tipo_imovel") || null, dormitorios: s("dormitorios").trim() || null,
      faixa_valor: s("faixa_valor").trim() || null, forma_pagamento: s("forma_pagamento") || null, prazo: s("prazo").trim() || null,
      origem: s("origem"), melhor_horario: s("melhor_horario").trim() || null, temperatura: s("temperatura"),
      tags: s("tags").split(",").map((t) => t.trim()).filter(Boolean), observacoes: s("observacoes").trim() || null,
    };
    if (novo) {
      dados.consentimento = Boolean(f.consentimento);
      if (f.consentimento) { dados.consentimento_em = new Date().toISOString(); dados.consentimento_texto = "Registrado manualmente pelo corretor."; }
    }
    const q = novo ? sb.from("clientes").insert(dados).select("*").single() : sb.from("clientes").update(dados).eq("id", inicial!.id).select("*").single();
    const { data, error } = await q;
    setSalvando(false);
    if (error) { setErros([`Não foi possível salvar: ${error.message}`]); return; }
    setMsg("Salvo.");
    onSalvo(data as Cliente);
  }

  const obrig = novo ? " *" : "";
  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="eyebrow mb-1">Contato</legend>
        <Campo rotulo={`Nome${obrig || " *"}`}><input className="field" value={s("nome")} onChange={(e) => set("nome", e.target.value)} autoComplete="off" /></Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo={`Telefone (fixo)${obrig}`}><input className="field" inputMode="tel" placeholder="(11) 4000-0000" value={s("telefone")} onChange={(e) => set("telefone", e.target.value)} onBlur={() => s("telefone") && set("telefone", formatarTelefone(limparTelefone(s("telefone"))))} /></Campo>
          <Campo rotulo={`Celular / WhatsApp${obrig}`}><input className="field" inputMode="tel" placeholder="(11) 90000-0000" value={s("celular")} onChange={(e) => set("celular", e.target.value)} onBlur={() => s("celular") && set("celular", formatarTelefone(limparTelefone(s("celular"))))} /></Campo>
          <Campo rotulo="Telefone principal (hotfone)" dica="Número com mais chance de contato. É o que o botão Ligar usa."><select className="field" value={s("hotfone")} onChange={(e) => set("hotfone", e.target.value)}><option value="celular">Celular</option><option value="telefone">Telefone fixo</option></select></Campo>
          <Campo rotulo={`E-mail${obrig}`}><input className="field" type="email" value={s("email")} onChange={(e) => set("email", e.target.value)} /></Campo>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow mb-1">Endereço</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <Campo rotulo="CEP" dica="Ao sair do campo, preenche rua, bairro e cidade."><input className="field" inputMode="numeric" placeholder="00000-000" value={s("cep")} onChange={(e) => set("cep", e.target.value)} onBlur={buscarCep} /></Campo>
          <Campo rotulo={`Endereço completo${obrig}`} className="sm:col-span-2"><input className="field" placeholder="Rua, número, complemento" value={s("endereco")} onChange={(e) => set("endereco", e.target.value)} /></Campo>
          <Campo rotulo="Bairro"><input className="field" value={s("bairro")} onChange={(e) => set("bairro", e.target.value)} /></Campo>
          <Campo rotulo="Cidade"><input className="field" value={s("cidade")} onChange={(e) => set("cidade", e.target.value)} /></Campo>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow mb-1">Interesse</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Empreendimento"><input className="field" list="lista-emp" value={s("empreendimento_interesse")} onChange={(e) => set("empreendimento_interesse", e.target.value)} /><datalist id="lista-emp">{nomesEmp.map((n) => <option key={n} value={n} />)}</datalist></Campo>
          <Campo rotulo="Tipo de imóvel"><select className="field" value={s("tipo_imovel")} onChange={(e) => set("tipo_imovel", e.target.value)}>{TIPOS_IMOVEL.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo rotulo="Dormitórios"><input className="field" placeholder="2 ou 3" value={s("dormitorios")} onChange={(e) => set("dormitorios", e.target.value)} /></Campo>
          <Campo rotulo="Faixa de valor"><input className="field" placeholder="até R$ 800 mil" value={s("faixa_valor")} onChange={(e) => set("faixa_valor", e.target.value)} /></Campo>
          <Campo rotulo="Forma de pagamento"><select className="field" value={s("forma_pagamento")} onChange={(e) => set("forma_pagamento", e.target.value)}>{PAGAMENTOS.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo rotulo="Prazo para decidir"><input className="field" placeholder="3 meses" value={s("prazo")} onChange={(e) => set("prazo", e.target.value)} /></Campo>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow mb-1">Perfil (opcional)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Idade"><input className="field" inputMode="numeric" value={s("idade")} onChange={(e) => set("idade", e.target.value)} /></Campo>
          <Campo rotulo="Gênero"><select className="field" value={s("genero")} onChange={(e) => set("genero", e.target.value)}>{GENEROS.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo rotulo="Profissão"><input className="field" value={s("profissao")} onChange={(e) => set("profissao", e.target.value)} /></Campo>
          <Campo rotulo="Renda mensal (faixa)"><select className="field" value={s("renda_faixa")} onChange={(e) => set("renda_faixa", e.target.value)}>{RENDAS.map((t) => <option key={t}>{t}</option>)}</select></Campo>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow mb-1">Relacionamento</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Origem"><select className="field" value={s("origem")} onChange={(e) => set("origem", e.target.value)}>{ORIGENS.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo rotulo="Temperatura"><select className="field" value={s("temperatura")} onChange={(e) => set("temperatura", e.target.value)}>{TEMPERATURAS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></Campo>
          <Campo rotulo="Melhor horário para contato" dica="Se o cliente informou. Vale mais que o cálculo do sistema."><input className="field" placeholder="depois das 18h" value={s("melhor_horario")} onChange={(e) => set("melhor_horario", e.target.value)} /></Campo>
          <Campo rotulo="Etiquetas" dica="Separe por vírgula."><input className="field" placeholder="investidor, indicação" value={s("tags")} onChange={(e) => set("tags", e.target.value)} /></Campo>
        </div>
        <Campo rotulo="Observações"><textarea rows={3} className="field" value={s("observacoes")} onChange={(e) => set("observacoes", e.target.value)} /></Campo>
        {novo && (
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" className="mt-1 accent-[#C19A5B]" checked={Boolean(f.consentimento)} onChange={(e) => set("consentimento", e.target.checked)} />
            <span>O cliente autorizou ser contatado (LGPD). A data fica registrada.</span>
          </label>
        )}
      </fieldset>

      {erros.length > 0 && <Aviso tipo="erro"><ul className="list-disc pl-4">{erros.map((e) => <li key={e}>{e}</li>)}</ul></Aviso>}
      {duplicado && (
        <Aviso>
          Já existe um cliente com este telefone ou e-mail: <strong>{duplicado.nome}</strong>.
          <div className="mt-2 flex gap-2">
            {onAbrirExistente && <button type="button" className="btn btn-ink !px-3 !py-1.5" onClick={() => onAbrirExistente(duplicado.id)}>Abrir o existente</button>}
            <button type="button" className="btn btn-line !px-3 !py-1.5" onClick={() => salvar(true)}>Cadastrar mesmo assim</button>
          </div>
        </Aviso>
      )}
      {msg && <Aviso tipo="ok">{msg}</Aviso>}
      <div className="flex gap-2">
        <button className="btn btn-gold disabled:opacity-60" disabled={salvando}>{salvando ? "Salvando…" : novo ? "Cadastrar cliente" : "Salvar alterações"}</button>
        {onCancelar && <button type="button" className="btn btn-line" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}
