"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BarChart3, CalendarCheck, ExternalLink, FileSignature, LogOut, Plus, Upload, Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { Aviso } from "./ui";
import { Hoje } from "./Hoje";
import { Clientes } from "./Clientes";
import { Ficha } from "./Ficha";
import { Importar } from "./Importar";
import { Painel } from "./Painel";
import { Contratos } from "./Contratos";
import { ContratoDetalhe } from "./ContratoDetalhe";

type Aba = "hoje" | "clientes" | "contratos" | "painel" | "importar";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase(); if (!sb) return;
    setCarregando(true); setErro("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) setErro("E-mail ou senha incorretos.");
    setCarregando(false);
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
        <p className="eyebrow">{SITE.marca}</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Entrar no CRM</h1>
        <div className="mt-6 space-y-4">
          <label className="block"><span className="label">E-mail</span><input className="field" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="label">Senha</span><input className="field" type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
        </div>
        {erro && <div className="mt-4"><Aviso tipo="erro">{erro}</Aviso></div>}
        <button className="btn btn-gold mt-6 w-full disabled:opacity-60" disabled={carregando}>{carregando ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}

export function AdminApp() {
  const sb = getSupabase();
  const [sessao, setSessao] = useState<Session | null>(null);
  const [pronto, setPronto] = useState(false);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [aba, setAba] = useState<Aba>("hoje");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [fichaNovo, setFichaNovo] = useState(false);
  const [fichaClassificar, setFichaClassificar] = useState(false);
  const [contratoId, setContratoId] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!sb) { setPronto(true); return; }
    sb.auth.getSession().then(({ data }) => { setSessao(data.session); setPronto(true); });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!sb || !sessao) { setAdmin(null); return; }
    sb.rpc("is_admin").then(({ data }) => setAdmin(Boolean(data)));
  }, [sb, sessao]);

  const abrir = useCallback((id: string, classificar = false) => { setFichaNovo(false); setFichaClassificar(classificar); setFichaId(id); }, []);
  const fechar = useCallback(() => { setFichaId(null); setFichaNovo(false); setFichaClassificar(false); }, []);
  const mudou = useCallback(() => setVersao((v) => v + 1), []);

  if (!sb) return <div className="mx-auto max-w-lg p-8"><Aviso tipo="erro">O CRM ainda não está conectado ao banco. Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.</Aviso></div>;
  if (!pronto) return <div className="p-8 text-sm text-muted">Carregando…</div>;
  if (!sessao) return <Login />;
  if (admin === null) return <div className="p-8 text-sm text-muted">Verificando acesso…</div>;
  if (!admin) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8">
        <Aviso tipo="erro">Esta conta ({sessao.user.email}) não tem permissão para acessar o CRM.</Aviso>
        <button className="btn btn-line" onClick={() => sb.auth.signOut()}>Sair</button>
      </div>
    );
  }

  const abas: { id: Aba; nome: string; icone: React.ReactNode }[] = [
    { id: "hoje", nome: "Hoje", icone: <CalendarCheck size={16} /> },
    { id: "clientes", nome: "Clientes", icone: <Users size={16} /> },
    { id: "contratos", nome: "Contratos", icone: <FileSignature size={16} /> },
    { id: "painel", nome: "Painel", icone: <BarChart3 size={16} /> },
    { id: "importar", nome: "Importar", icone: <Upload size={16} /> },
  ];

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-snow/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-2"><p className="font-serif text-lg font-semibold leading-none text-ink">{SITE.marca}</p><p className="eyebrow mt-1">CRM</p></div>
          <nav className="flex gap-1" aria-label="Seções do CRM">
            {abas.map((a) => (
              <button key={a.id} onClick={() => setAba(a.id)} aria-current={aba === a.id ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition ${aba === a.id ? "bg-ink text-paper" : "text-ink hover:bg-gold/15"}`}>
                {a.icone}{a.nome}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn btn-gold !px-4 !py-2" onClick={() => { setFichaId(null); setFichaNovo(true); }}><Plus size={16} /> Novo cliente</button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-line !px-3 !py-2" aria-label="Abrir o site em outra aba" title="Abrir o site"><ExternalLink size={16} /><span className="ml-1 hidden sm:inline">Ver site</span></a>
            <button className="btn btn-line !px-3 !py-2" onClick={() => sb.auth.signOut()} aria-label="Sair"><LogOut size={16} /></button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {aba === "hoje" && <Hoje versao={versao} abrir={abrir} abrirContrato={setContratoId} />}
        {aba === "contratos" && <Contratos versao={versao} abrirContrato={setContratoId} />}
        {aba === "clientes" && <Clientes versao={versao} abrir={abrir} />}
        {aba === "painel" && <Painel versao={versao} />}
        {aba === "importar" && <Importar onConcluido={() => { mudou(); setAba("clientes"); }} />}
      </div>
      {(fichaId || fichaNovo) && <Ficha id={fichaId} novo={fichaNovo} classificarAberto={fichaClassificar} onClose={fechar} onChanged={mudou} onAbrir={(id) => abrir(id)} onAbrirContrato={(id) => { setFichaId(null); setContratoId(id); }} />}
      {contratoId && <ContratoDetalhe id={contratoId} onClose={() => setContratoId(null)} onChanged={mudou} onAbrirCliente={(cid) => { setContratoId(null); abrir(cid); }} />}
    </div>
  );
}
