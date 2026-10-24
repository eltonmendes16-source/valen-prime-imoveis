import Link from "next/link";
import { BedDouble, Car, Ruler } from "lucide-react";
import { Capa } from "./Capa";
import { BotaoFavorito } from "./BotaoFavorito";
import { COM_TABELA, brl, entregaTexto, faixaArea, localizacao, SEGMENTO_LABEL, type Emp } from "@/lib/emp";

export function EmpCard({ emp, claro = false }: { emp: Emp; claro?: boolean }) {
  const ent = entregaTexto(emp.entrega);
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-md border transition duration-300 hover:-translate-y-1 ${claro ? "border-ink/10 bg-white text-ink hover:shadow-xl" : "border-ink/10 bg-sand text-charcoal hover:border-gold/50"}`}>
      <Link href={`/empreendimentos/${emp.id}`} className="relative block aspect-[16/10] overflow-hidden bg-coal2" aria-label={`Ver ${emp.nome}`}>
        <div className="h-full w-full transition duration-500 group-hover:scale-[1.04]"><Capa emp={emp} /></div>
        <span className="absolute left-3 top-3 rounded-sm bg-snow/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-golddark">{SEGMENTO_LABEL[emp.segmento]}</span>
      </Link>
      <BotaoFavorito id={emp.id} nome={emp.nome} className="absolute right-3 top-3" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-xl font-semibold leading-tight">
            <Link href={`/empreendimentos/${emp.id}`} className="hover:text-golddark">{emp.nome}</Link>
          </h3>
          <p className={`mt-1 text-sm ${claro ? "text-mutedink" : "text-muted"}`}>{localizacao(emp)}</p>
        </div>
        <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-[13px] ${claro ? "text-mutedink" : "text-muted"}`}>
          <li className="inline-flex items-center gap-1.5"><Ruler size={14} className="text-golddark" /> {faixaArea(emp)}</li>
          <li className="inline-flex items-center gap-1.5"><BedDouble size={14} className="text-golddark" /> {emp.quartos} dorm.</li>
          <li className="inline-flex items-center gap-1.5"><Car size={14} className="text-golddark" /> {emp.vagas} vaga(s)</li>
        </ul>
        <div className={`mt-auto flex items-end justify-between border-t pt-4 ${claro ? "border-ink/10" : "border-ink/10"}`}>
          <div>
            <p className={`text-[11px] uppercase tracking-wider ${claro ? "text-mutedink" : "text-muted"}`}>{emp.precoAPartir ? "A partir de" : "Valores"}</p>
            <p className="font-serif text-lg font-semibold text-golddark">{emp.precoAPartir ? brl(emp.precoAPartir) : COM_TABELA.includes(emp.id) ? "Ver tabela de preços →" : "Sob consulta"}</p>
          </div>
          {ent && <p className={`text-right text-xs ${claro ? "text-mutedink" : "text-muted"}`}>Entrega prevista<br /><b className="font-semibold">{ent}</b></p>}
        </div>
      </div>
    </article>
  );
}
