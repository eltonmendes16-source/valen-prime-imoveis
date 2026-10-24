// Service worker mínimo do CRM: permite instalar o app. Não guarda dados de clientes (privacidade/LGPD).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><body style='font-family:sans-serif;padding:2rem;text-align:center'><h2>Sem conexão</h2><p>O CRM precisa de internet para abrir. Confira o sinal e tente de novo.</p>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
