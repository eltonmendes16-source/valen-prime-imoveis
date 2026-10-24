"use client";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ShieldCheck } from "lucide-react";
import { Aviso } from "./ui";

type Fase = "carregando" | "ok" | "verificar" | "cadastrar";

/** Exige o segundo fator (código do app autenticador) antes de abrir o CRM. */
export function Mfa({ sb, children }: { sb: SupabaseClient; children: React.ReactNode }) {
  const [fase, setFase] = useState<Fase>("carregando");
  const [fator, setFator] = useState("");
  const [qr, setQr] = useState("");
  const [segredo, setSegredo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);

  const checar = useCallback(async () => {
    setErro("");
    const { data, error } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) { setErro(error?.message || "Não consegui verificar a segurança da conta."); return; }
    if (data.currentLevel === "aal2") { setFase("ok"); return; }
    const { data: lista } = await sb.auth.mfa.listFactors();
    const verificado = lista?.totp?.find((f) => f.status === "verified");
    if (verificado) { setFator(verificado.id); setFase("verificar"); return; }
    // limpa tentativas anteriores não concluídas e cria um novo cadastro
    for (const f of lista?.all || []) if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data: novo, error: e2 } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `Celular ${new Date().toISOString().slice(0, 16)}` });
    if (e2 || !novo) { setErro(e2?.message || "Não consegui iniciar o cadastro do código."); return; }
    setFator(novo.id); setQr(novo.totp.qr_code); setSegredo(novo.totp.secret); setFase("cadastrar");
  }, [sb]);
  useEffect(() => { checar(); }, [checar]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErro("");
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: fator, code: codigo.replace(/\s/g, "") });
    if (error) { setBusy(false); setErro("Código incorreto ou vencido. Confira o app e tente de novo."); setCodigo(""); return; }
    await sb.auth.refreshSession();
    setBusy(false); setFase("ok");
  }

  if (fase === "ok") return <>{children}</>;
  return (
    <div className="mx-auto max-w-md p-6 sm:p-10">
      <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink"><ShieldCheck size={22} /> Verificação em dois passos</p>
        {fase === "carregando" && !erro && <p className="mt-4 text-sm text-muted">Verificando…</p>}
        {fase === "cadastrar" && (
          <div className="mt-3 space-y-3 text-sm text-charcoal/80">
            <p>Para proteger os dados dos clientes, o CRM passa a pedir um código do celular. Faça uma vez só:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Instale um aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou Authy).</li>
              <li>No app, escolha adicionar conta e leia o QR code abaixo.</li>
              <li>Digite aqui o código de 6 números que o app mostrar.</li>
            </ol>
            {qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="QR code para o aplicativo autenticador" className="mx-auto h-44 w-44" />}
            <p className="break-all text-xs text-muted">Sem câmera? Digite esta chave no app: <b className="select-all text-ink">{segredo}</b></p>
          </div>
        )}
        {fase === "verificar" && <p className="mt-3 text-sm text-charcoal/80">Digite o código de 6 números do seu aplicativo autenticador.</p>}
        {(fase === "cadastrar" || fase === "verificar") && (
          <form onSubmit={confirmar} className="mt-4 space-y-3">
            <div><label htmlFor="mfa-codigo" className="label">Código</label><input id="mfa-codigo" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required value={codigo} onChange={(e) => setCodigo(e.target.value)} className="field text-center text-xl tracking-widest" placeholder="000000" autoFocus /></div>
            <button className="btn btn-gold w-full disabled:opacity-60" disabled={busy}>{busy ? "Verificando…" : fase === "cadastrar" ? "Ativar e entrar" : "Entrar"}</button>
          </form>
        )}
        {erro && <div className="mt-3"><Aviso tipo="erro">{erro}</Aviso></div>}
        <button className="mt-4 text-xs underline" onClick={() => sb.auth.signOut()}>Sair</button>
      </div>
    </div>
  );
}
