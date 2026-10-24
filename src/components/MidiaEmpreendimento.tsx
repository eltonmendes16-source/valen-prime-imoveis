import { Eye, Video } from "lucide-react";

/** Passeio virtual 360° e vídeo do decorado. Só aparecem quando o empreendimento tem o link. */
export function MidiaEmpreendimento({ nome, tour360, videoDecorado, videoPoster }: { nome: string; tour360?: string; videoDecorado?: string; videoPoster?: string }) {
  if (!tour360 && !videoDecorado) return null;
  const mp4 = !!videoDecorado && /\.mp4(\?|$)/i.test(videoDecorado);
  return (
    <section aria-label="Passeio virtual e decorado" className="bg-paper py-14 text-ink">
      <div className="container-page grid gap-6 md:grid-cols-2">
        {tour360 && (
          <div id="tour" className="scroll-mt-24 rounded-md border border-ink/10 bg-white p-6">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Eye size={20} /> Tour 360°</h2>
            <p className="mt-1 text-sm text-mutedink">Veja a vista e circule pelo ambiente.</p>
            <div className="mt-4 aspect-video overflow-hidden rounded bg-sand">
              <iframe src={tour360} title={`Passeio virtual 360° do ${nome}`} className="h-full w-full" allow="fullscreen; gyroscope; accelerometer" loading="lazy" />
            </div>
            <a href={tour360} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-golddark underline">Abrir em tela cheia</a>
          </div>
        )}
        {videoDecorado && (
          <div id="video" className="scroll-mt-24 rounded-md border border-ink/10 bg-white p-6">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Video size={20} /> Vídeo do decorado</h2>
            <p className="mt-1 text-sm text-mutedink">Conheça o apartamento decorado.</p>
            <div className="mt-4 aspect-video overflow-hidden rounded bg-black">
              {mp4
                ? <video src={videoDecorado} poster={videoPoster || undefined} controls preload="metadata" playsInline className="h-full w-full" />
                : <iframe src={videoDecorado} title={`Vídeo do decorado do ${nome}`} className="h-full w-full" allow="fullscreen; picture-in-picture" loading="lazy" />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
