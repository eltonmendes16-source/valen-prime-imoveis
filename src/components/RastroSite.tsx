"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrar } from "@/lib/comportamento";
import { contarVisita } from "@/lib/visitas";
import { registrarToque } from "@/lib/origem";

export function RastroSite() {
  const caminho = usePathname() || "/";
  useEffect(() => { registrarToque(); registrar({ tipo: "pagina", caminho }); contarVisita(caminho); }, [caminho]);
  return null;
}
