"use client";
import { useSyncExternalStore } from "react";

// Favoritos ficam só no aparelho do visitante (localStorage). Nada é enviado ao servidor.
const CHAVE = "vp_favoritos";
const MAX = 12;
const EVENTO = "vp-favoritos";
let cache: string[] = [];
let lido = false;

function ler(): string[] {
  try { const v = JSON.parse(localStorage.getItem(CHAVE) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX) : []; } catch { return []; }
}
function atual(): string[] {
  if (!lido) { cache = ler(); lido = true; }
  return cache;
}
function gravar(l: string[]) {
  cache = l; lido = true;
  try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch { /* ignora */ }
  window.dispatchEvent(new Event(EVENTO));
}
function assinar(cb: () => void) {
  const fora = (e: StorageEvent) => { if (e.key === CHAVE) { lido = false; cb(); } };
  window.addEventListener(EVENTO, cb); window.addEventListener("storage", fora);
  return () => { window.removeEventListener(EVENTO, cb); window.removeEventListener("storage", fora); };
}
const vazio: string[] = [];

export function useFavoritos() {
  const ids = useSyncExternalStore(assinar, atual, () => vazio);
  return {
    ids,
    tem: (id: string) => ids.includes(id),
    alternar: (id: string) => gravar(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-MAX)),
    limpar: () => gravar([]),
  };
}
