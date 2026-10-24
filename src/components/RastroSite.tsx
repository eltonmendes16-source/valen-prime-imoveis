"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrar } from "@/lib/comportamento";

export function RastroSite() {
  const caminho = usePathname() || "/";
  useEffect(() => { registrar({ tipo: "pagina", caminho }); }, [caminho]);
  return null;
}
