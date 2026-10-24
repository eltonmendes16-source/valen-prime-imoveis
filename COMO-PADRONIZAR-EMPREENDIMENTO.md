# Como padronizar um empreendimento no modelo do Ilha de Murano

Material necessário de cada empreendimento (enviado pelo corretor/incorporadora):
1. **Tabela de preços / espelho de vendas** atual (PDF ou Excel) com: unidade, andar, final, área, vagas, valores de cada parcela e total; datas e condições de pagamento; validade.
2. **Passeio 360° e/ou vídeo do decorado** (links; vídeo em YouTube "não listado" ou arquivo .mp4).
3. **Autorização** de uso de imagens, marca e valores, dada pela incorporadora.

Passos técnicos:
1. Criar `src/data/tabelas/<id>.json` no mesmo formato do `ilha-de-murano.json` (`tour360` e `videoDecorado` são opcionais).
2. Registrar o arquivo em `src/lib/tabelas.ts` (objeto `TABELAS`).
3. Incluir o `id` em `COM_TABELA` (`src/lib/emp.ts`).
4. Rodar `node scripts/validar-tabelas.mjs`: confere as somas de cada unidade, a validade e se a lista está de acordo.
5. Conferir a página `/escolha-sua-unidade/<id>` e `/empreendimentos/<id>`; publicar.

Lembrete: a tabela vence na data de validade; o aviso padrão de "confirme valores com a incorporadora" já aparece nas páginas.
