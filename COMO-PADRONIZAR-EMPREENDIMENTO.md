# Como incluir e padronizar empreendimentos

Todo empreendimento tem um arquivo em `src/data/tabelas/<id>.json` com: tabela de preços por unidade, `tour360` e `videoDecorado`.
Enquanto a tabela estiver vazia, o site mostra "em breve" nos botões certos. Preencher o arquivo libera o recurso (o resumo é gerado sozinho no build).

## Incluir a tabela, o tour 360° ou o vídeo de um empreendimento que já existe
1. Material: tabela/espelho de vendas (PDF ou Excel), link do passeio 360°, link ou arquivo do vídeo do decorado. Autorização de uso já confirmada pelo dono do projeto.
2. Preencher `src/data/tabelas/<id>.json` no formato do `ilha-de-murano.json` (`tour360` e `videoDecorado` são links `https://...` ou arquivos em `public/`).
3. Rodar `node scripts/validar-tabelas.mjs`: confere as somas de cada unidade, a validade e os links.
4. Publicar (git push). Aparecem sozinhos: botão "Ver tabela de preços", "Tour 360°" e "Vídeo do decorado".

## Criar um empreendimento novo
`node scripts/novo-empreendimento.mjs id="meu-emp" nome="Meu Emp" cidade="Santo André" bairro="Jardim" incorporadora="Fulana" segmento=medio quartos="2 e 3" vagas="1 ou 2" entrega=2029-06`
Cria a ficha e o arquivo-modelo. Depois: completar metragens, lazer etc. em `src/data/empreendimentos.json`, colocar fotos em `public/empreendimentos/<id>/` e seguir o passo anterior.

Lembrete: a tabela vence na data de validade; o aviso padrão de "confirme valores com a incorporadora" já aparece nas páginas.
