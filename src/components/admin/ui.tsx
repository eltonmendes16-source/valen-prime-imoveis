"use client";
import { baseCor, baseNome, etapaNome, tempCor, type Cliente } from "@/lib/crm";

export function Campo({ rotulo, children, className = "", dica }: { rotulo: string; children: React.ReactNode; className?: string; dica?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-[11px] text-muted">{dica}</span>}
    </label>
  );
}

export function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>;
}

export const ChipBase = ({ base }: { base: string }) => <Chip className={baseCor(base)}>{baseNome(base)}</Chip>;
export const ChipTemp = ({ t }: { t: string }) => <Chip className={tempCor(t)}>{t[0].toUpperCase() + t.slice(1)}</Chip>;
export const ChipEtapa = ({ e }: { e: string }) => <Chip className="bg-white text-ink ring-1 ring-ink/15">{etapaNome(e)}</Chip>;

export function corAtraso(dias: number) {
  if (dias < 7) return "border-l-yellow-400";
  if (dias < 14) return "border-l-violet-500";
  if (dias < 30) return "border-l-red-600";
  return "border-l-black";
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-8 text-center text-sm text-muted">{children}</div>;
}

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "erro" | "ok"; children: React.ReactNode }) {
  const cor = tipo === "erro" ? "border-red-300 bg-red-50 text-red-800" : tipo === "ok" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-gold/40 bg-goldsoft/30 text-ink";
  return <div role={tipo === "erro" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${cor}`}>{children}</div>;
}

export const nomeCurto = (c: Pick<Cliente, "nome">) => c.nome;
