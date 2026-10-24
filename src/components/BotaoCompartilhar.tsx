"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";

/** Compartilha o link do empreendimento: menu do celular quando existe, senão copia o link. */
export function BotaoCompartilhar({ titulo, texto, caminho }: { titulo: string; texto: string; caminho: string }) {
  const [msg, setMsg] = useState("");
  async function compartilhar() {
    const url = `${window.location.origin}${caminho}`;
    try {
      if (navigator.share) { await navigator.share({ title: titulo, text: texto, url }); return; }
      await navigator.clipboard.writeText(url); setMsg("Link copiado!"); setTimeout(() => setMsg(""), 2500);
    } catch { /* cancelado pelo usuário */ }
  }
  return <button type="button" className="btn btn-line" onClick={compartilhar}><Share2 size={16} /> {msg || "Compartilhar"}</button>;
}
