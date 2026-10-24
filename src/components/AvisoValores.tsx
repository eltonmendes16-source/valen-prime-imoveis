import Link from "next/link";
import { Info } from "lucide-react";

// Aviso padrão para qualquer tela que mostre preço ou condição de pagamento.
export function AvisoValores({ className = "", comLink = true }: { className?: string; comLink?: boolean }) {
  return (
    <div className={`flex gap-3 rounded border border-gold/40 bg-gold/10 p-4 text-sm text-ink ${className}`} role="note">
      <Info size={18} className="mt-0.5 shrink-0 text-golddark" aria-hidden="true" />
      <p>
        <b>Confirme antes de decidir.</b> Valores, tabelas e disponibilidade vêm do incorporador e <b>podem mudar sem aviso prévio</b>. Eles precisam ser confirmados com o incorporador, e as condições só ficam garantidas com o contrato assinado.
        {comLink && <> Veja o histórico em <Link href="/atualizacoes" className="underline">Últimas atualizações</Link>.</>}
      </p>
    </div>
  );
}
