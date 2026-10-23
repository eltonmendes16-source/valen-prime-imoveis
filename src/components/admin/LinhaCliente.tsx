"use client";
import { MessageCircle, Phone, Tags } from "lucide-react";
import { MODELOS, fmtData, numeroPrincipal, numeroWhats, type Cliente } from "@/lib/crm";
import { formatarTelefone, linkWhatsApp } from "@/lib/telefone";
import { ChipBase, ChipEtapa, ChipTemp } from "./ui";

export function LinhaCliente({ c, abrir, destaque = "", mostrarProximo = true }: {
  c: Cliente; abrir: (id: string, classificar?: boolean) => void; destaque?: string; mostrarProximo?: boolean;
}) {
  const bloqueado = c.base === "bloqueados" || c.tags?.includes("nao_contatar");
  const tel = numeroPrincipal(c);
  const wa = numeroWhats(c);
  const modelo = c.base === "novos" ? MODELOS[0] : MODELOS[4];
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg border border-l-4 border-ink/10 bg-white p-3 shadow-sm ${destaque || "border-l-gold"}`}>
      <button onClick={() => abrir(c.id)} className="min-w-0 flex-1 basis-56 text-left">
        <p className="truncate font-semibold text-ink">{c.nome}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {[c.empreendimento_interesse, c.origem, tel ? formatarTelefone(tel) : null].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <ChipBase base={c.base} /><ChipEtapa e={c.etapa} /><ChipTemp t={c.temperatura} />
          {c.tags?.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-muted"><Tags size={11} />{c.tags.join(", ")}</span>}
        </div>
      </button>
      {mostrarProximo && <div className="w-28 text-xs text-muted"><p>Próximo contato</p><p className="font-medium text-ink">{fmtData(c.proximo_contato)}</p></div>}
      <div className="flex items-center gap-1.5">
        {tel && !bloqueado && <a href={`tel:+55${tel}`} className="btn btn-line !px-3 !py-2" aria-label={`Ligar para ${c.nome}`}><Phone size={15} /></a>}
        {wa && !bloqueado && <a href={linkWhatsApp(wa, modelo.texto(c))} target="_blank" rel="noopener noreferrer" className="btn !bg-[#25D366] !px-3 !py-2 text-ink" aria-label={`WhatsApp para ${c.nome}`}><MessageCircle size={15} /></a>}
        <button onClick={() => abrir(c.id, true)} className="btn btn-ink !px-3 !py-2">Classificar</button>
      </div>
    </div>
  );
}
