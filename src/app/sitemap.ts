import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { EMPS, AMBIENTES } from "@/lib/emp";
import { POSTS } from "@/lib/blog";
export default function sitemap(): MetadataRoute.Sitemap {
  const hoje = new Date();
  const base = SITE.url.replace(/\/$/, "");
  const fixas = ["", "/imoveis", "/servicos", "/simulador", "/blog", "/parceiros", "/sobre", "/privacidade", "/termos"];
  return [
    ...fixas.map((p) => ({ url: base + p, lastModified: hoje })),
    ...AMBIENTES.map((a) => ({ url: `${base}/ambientes/${a.slug}`, lastModified: hoje })),
    ...EMPS.map((e) => ({ url: `${base}/empreendimentos/${e.id}`, lastModified: hoje })),
    ...POSTS.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.data) })),
  ];
}
