"use client";
import { Heart } from "lucide-react";
import { useFavoritos } from "@/lib/favoritos";

export function BotaoFavorito({ id, nome, className = "", comTexto = false }: { id: string; nome: string; className?: string; comTexto?: boolean }) {
  const f = useFavoritos();
  const on = f.tem(id);
  return (
    <button type="button" onClick={() => f.alternar(id)} aria-pressed={on} aria-label={on ? `Remover ${nome} dos favoritos` : `Salvar ${nome} nos favoritos`}
      className={`inline-flex items-center gap-1.5 ${comTexto ? "btn btn-line" : "grid h-9 w-9 place-items-center rounded-full bg-snow/90 shadow"} ${className}`}>
      <Heart size={16} className={on ? "fill-red-600 text-red-600" : "text-ink"} />
      {comTexto && (on ? "Salvo nos favoritos" : "Salvar nos favoritos")}
    </button>
  );
}
