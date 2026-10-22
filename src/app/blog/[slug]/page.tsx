import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { POSTS, getPost } from "@/lib/blog";

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.titulo, description: p.resumo } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  return (
    <>
      <article className="bg-paper py-16 text-ink sm:py-24"><div className="container-page max-w-2xl">
        <Link href="/blog" className="text-sm text-golddark">← Blog</Link>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-golddark">{p.categoria} · {p.leitura} min · {new Date(p.data + "T12:00:00").toLocaleDateString("pt-BR")}</p>
        <h1 className="h-display mt-3 text-4xl !text-ink sm:text-5xl">{p.titulo}</h1>
        <div className="mt-10 space-y-5 text-lg leading-relaxed">
          {p.corpo.map((b, i) => <div key={i}>{b.h && <h2 className="mb-2 mt-6 font-serif text-2xl font-semibold">{b.h}</h2>}<p>{b.p}</p></div>)}
        </div>
      </div></article>
      <section className="bg-snow py-16"><div className="container-page max-w-2xl"><LeadForm titulo="Quer conversar sobre isso?" /></div></section>
    </>
  );
}
