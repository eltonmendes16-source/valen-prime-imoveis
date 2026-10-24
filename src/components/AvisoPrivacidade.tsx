"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { gravarEscolha, lerEscolha } from "@/lib/comportamento";

/** Aviso de privacidade: explica o que o site guarda no navegador e deixa o visitante recusar. */
export function AvisoPrivacidade() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => { setAberto(lerEscolha() === null); }, []);
  if (!aberto) return null;
  const escolher = (v: "ok" | "recusado") => { gravarEscolha(v); setAberto(false); };
  return (
    <div role="dialog" aria-label="Aviso de privacidade" className="fixed inset-x-3 bottom-3 z-[60] rounded-lg border border-ink/10 bg-white p-4 text-sm text-charcoal shadow-xl sm:left-4 sm:right-auto sm:max-w-md">
      <p className="font-semibold text-ink">Sua privacidade</p>
      <p className="mt-1 text-muted">
        Este site não usa cookies de anúncios nem rastreadores de terceiros. Para mostrar o que mais combina com você, ele guarda <b>no seu próprio aparelho</b> quais páginas você viu. Essa informação só é enviada a nós se você preencher um formulário e concordar. Veja a <Link href="/privacidade" className="underline">Política de Privacidade</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-gold" onClick={() => escolher("ok")}>Entendi</button>
        <button className="btn btn-line" onClick={() => escolher("recusado")}>Não guardar minha navegação</button>
      </div>
    </div>
  );
}
