import { temCapa, type Emp } from "@/lib/emp";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rnd(seed: number) {
  let s = seed || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

// Capa do empreendimento: foto autorizada (public/empreendimentos/<id>/capa.jpg) ou arte em traço gerada a partir do nome.
export function Capa({ emp, className = "" }: { emp: Emp; className?: string }) {
  if (temCapa(emp.id)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/empreendimentos/${emp.id}/capa.jpg`} alt={`Fachada do ${emp.nome}`} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  const r = rnd(hash(emp.id));
  const n = 5 + Math.floor(r() * 3);
  let x = 20;
  const torres: { x: number; w: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const w = 46 + Math.floor(r() * 44);
    const h = 90 + Math.floor(r() * 150);
    torres.push({ x, w, h });
    x += w + 10 + Math.floor(r() * 14);
  }
  const larg = x + 10;
  const base = 250;
  const idp = `j${hash(emp.id)}`;
  return (
    <svg viewBox={`0 0 ${larg} 280`} preserveAspectRatio="xMidYMax slice" className={`h-full w-full text-golddark ${className}`} role="img" aria-label={`Ilustração do ${emp.nome}`}>
      <defs>
        <pattern id={idp} width="10" height="12" patternUnits="userSpaceOnUse"><rect x="2.5" y="2.5" width="4.5" height="6" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".55" /></pattern>
        <linearGradient id={`${idp}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".2" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${idp}c`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EFE8DA" /><stop offset="1" stopColor="#DDD2BC" /></linearGradient>
      </defs>
      <rect width={larg} height="280" fill={`url(#${idp}c)`} />
      {torres.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={base - t.h} width={t.w} height={t.h} fill={`url(#${idp}g)`} stroke="currentColor" strokeWidth=".9" />
          <rect x={t.x + 3} y={base - t.h + 5} width={t.w - 6} height={t.h - 10} fill={`url(#${idp})`} />
          <line x1={t.x} y1={base - t.h} x2={t.x + t.w} y2={base - t.h} stroke="currentColor" strokeWidth="2" />
        </g>
      ))}
      <line x1="0" y1={base} x2={larg} y2={base} stroke="currentColor" strokeWidth=".8" opacity=".7" />
    </svg>
  );
}
