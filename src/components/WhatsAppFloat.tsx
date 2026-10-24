"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { getEmp, getCidade } from "@/lib/emp";

function mensagem(path: string) {
  const [, rota, id] = path.split("/");
  if ((rota === "empreendimentos" || rota === "escolha-sua-unidade") && id) {
    const e = getEmp(id);
    if (e) return `Olá, Mendes! Vim pelo site e quero saber mais sobre o ${e.nome} (${e.bairro ? `${e.bairro}, ` : ""}${e.cidade}).`;
  }
  if (rota === "lancamentos" && id) {
    const c = getCidade(id);
    if (c) return `Olá, Mendes! Vim pelo site e procuro apartamento na planta em ${c.nome}. Pode me ajudar?`;
  }
  if (rota === "simulador") return "Olá, Mendes! Fiz uma simulação de financiamento no site e gostaria de conversar.";
  if (rota === "blog") return "Olá, Mendes! Li um conteúdo do blog e gostaria de conversar.";
  return "Olá, Mendes! Vim pelo site da Valen Prime Imóveis.";
}

export function WhatsAppFloat() {
  const path = usePathname() || "/";
  return (
    <a href={whatsappLink(mensagem(path))} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-ink shadow-2xl transition hover:scale-105">
      <MessageCircle size={20} /> <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
