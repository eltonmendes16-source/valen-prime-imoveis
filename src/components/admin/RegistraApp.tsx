"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type EventoInstalar = Event & { prompt: () => Promise<void> };

/** Registra o service worker do CRM e oferece "Instalar app" quando o celular permite. */
export function RegistraApp() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => {});
    const antes = (e: Event) => { e.preventDefault(); setEvento(e as EventoInstalar); };
    const instalado = () => setEvento(null);
    window.addEventListener("beforeinstallprompt", antes);
    window.addEventListener("appinstalled", instalado);
    return () => { window.removeEventListener("beforeinstallprompt", antes); window.removeEventListener("appinstalled", instalado); };
  }, []);
  if (!evento) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-lg bg-ink p-3 text-sm text-white shadow-lg sm:left-auto sm:max-w-sm">
      <Download size={18} className="shrink-0 text-gold" />
      <span className="flex-1">Instale o CRM no celular para abrir como aplicativo.</span>
      <button className="rounded bg-gold px-3 py-1.5 font-semibold text-ink" onClick={async () => { await evento.prompt(); setEvento(null); }}>Instalar</button>
      <button aria-label="Fechar" onClick={() => setEvento(null)}><X size={16} /></button>
    </div>
  );
}
