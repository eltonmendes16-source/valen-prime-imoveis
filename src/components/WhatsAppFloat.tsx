import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
export function WhatsAppFloat() {
  return (
    <a href={whatsappLink("Olá, Mendes! Vim pelo site da Valen Prime Imóveis.")} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-ink shadow-2xl transition hover:scale-105">
      <MessageCircle size={20} /> <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
