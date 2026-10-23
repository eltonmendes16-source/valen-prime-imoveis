// Validação de telefones brasileiros (sem serviços externos).
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92,
  93, 94, 95, 96, 97, 98, 99,
]);

export type Tel = { digitos: string; tipo: "celular" | "fixo" | "invalido"; valido: boolean; motivo?: string };

/** Mantém só números, remove +55 e zero de operadora. */
export function limparTelefone(bruto: string): string {
  let d = (bruto || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith("0") && d.length >= 11) d = d.slice(1);
  return d;
}

export function validarTelefone(bruto: string): Tel {
  const d = limparTelefone(bruto);
  if (!d) return { digitos: "", tipo: "invalido", valido: false, motivo: "vazio" };
  if (d.length !== 10 && d.length !== 11) return { digitos: d, tipo: "invalido", valido: false, motivo: "tamanho incorreto" };
  if (!DDDS.has(Number(d.slice(0, 2)))) return { digitos: d, tipo: "invalido", valido: false, motivo: "DDD inexistente" };
  const numero = d.slice(2);
  if (/^(\d)\1+$/.test(numero)) return { digitos: d, tipo: "invalido", valido: false, motivo: "número repetido" };
  if (numero === "123456789" || numero === "12345678" || numero === "987654321") return { digitos: d, tipo: "invalido", valido: false, motivo: "número falso" };
  if (d.length === 11) {
    if (numero[0] !== "9") return { digitos: d, tipo: "invalido", valido: false, motivo: "celular deve começar com 9" };
    return { digitos: d, tipo: "celular", valido: true };
  }
  if (!/[2-5]/.test(numero[0])) return { digitos: d, tipo: "invalido", valido: false, motivo: "fixo deve começar com 2 a 5" };
  return { digitos: d, tipo: "fixo", valido: true };
}

export function formatarTelefone(digitos?: string | null): string {
  const d = (digitos || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

export const linkWhatsApp = (digitos: string, mensagem?: string) =>
  `https://wa.me/55${digitos}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
