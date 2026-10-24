"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function CancelarBoletim() {
  const token = useSearchParams().get("t") || "";
  const [estado, setEstado] = useState<"" | "ok" | "erro">("");
  const valido = /^[0-9a-f-]{36}$/i.test(token);
  async function cancelar() {
    const sb = getSupabase(); if (!sb) { setEstado("erro"); return; }
    const { error } = await sb.rpc("cancelar_boletim", { p_token: token });
    setEstado(error ? "erro" : "ok");
  }
  if (estado === "ok") return <p className="rounded-md border border-ink/10 bg-sand p-6 text-charcoal" role="status">Pronto, sua inscrição foi cancelada. Você não receberá mais o boletim.</p>;
  if (!valido) return <p className="rounded-md border border-ink/10 bg-sand p-6 text-charcoal">Link de cancelamento inválido. Use o link que vem no final do e-mail do boletim ou fale com a gente pelo WhatsApp.</p>;
  return (
    <div className="rounded-md border border-ink/10 bg-sand p-6">
      <p className="text-charcoal">Quer mesmo parar de receber o boletim?</p>
      <button className="btn btn-gold mt-4" onClick={cancelar}>Sim, cancelar inscrição</button>
      {estado === "erro" && <p role="alert" className="mt-3 text-sm text-red-700">Não consegui cancelar agora. Tente de novo em instantes.</p>}
    </div>
  );
}
