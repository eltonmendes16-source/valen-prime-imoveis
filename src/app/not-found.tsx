import Link from "next/link";
export default function NotFound() {
  return (<section className="bg-snow py-32"><div className="container-page text-center"><p className="eyebrow">Erro 404</p><h1 className="h-display mt-4 text-5xl">Página não <em>encontrada</em></h1><Link href="/" className="btn btn-gold mt-8">Voltar ao início</Link></div></section>);
}
