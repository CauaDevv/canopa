# Registro — Adição · Interface · Relatórios no painel do cliente

- Data: 2026-11-10
- Agente: Claude (Sonnet 5.5)
- Estado: concluído (dados de demonstração)

## Resumo

A visão do cliente (aberta por "Ir ao painel de cliente", dentro da conta admin) ganhou a página
**Relatórios**, que antes aparecia como "em breve". São 5 relatórios de exemplo que **não parecem documentos de
Word**: cada um é uma sequência de blocos de cor (capa com arte, números que contam, gráficos, calendário de sol,
linha do tempo) com o sol da marca como fio condutor. Dá para ler no painel e **salvar em PDF**.

## O que existe

- **Lista** (`PaginaRelatorios.jsx`): cartões com capa própria por tipo, filtro por tipo e o mais recente em
  destaque. Cada cartão mostra 3 números-chave, a data de publicação e é todo clicável (e acessível por teclado).
- **Leitor** (`RelatorioLeitor.jsx`): capa, blocos em sequência, barra fixa com a saída, **progresso de leitura**
  (fio dourado) e "Salvar em PDF".
- **Aviso na Visão geral**: um cartão dourado leva direto ao relatório mais recente.
- **Menu**: "Relatórios" saiu do grupo "Em breve" e o caminho do topo ganha um terceiro nível
  (Painel do cliente / Relatórios / título do relatório).

### Os 5 relatórios de exemplo (`relatorios/dados.js`)

| Relatório | Tipo | Blocos |
| --- | --- | --- |
| Geração de energia · outubro/2026 (novo) | Geração | números, **calendário de calor** dos 31 dias, frase em destaque, barras por projeto |
| Prestação de contas · acumulado até out/2026 | Prestação de contas | números, **barra segmentada** "para onde foi cada real", frase em destaque, retorno por projeto |
| Creche Tia Maria · instalação (em andamento) | Instalação | **anel de andamento** (14 de 22 painéis), números, linha do tempo com etapas futuras |
| Impacto do 3º trimestre | Impacto | números, frase em destaque, **barras empilhadas** de crescimento, projetos |
| Escola Comunitária Viver Bem | Projeto | números, **antes e depois da conta de luz**, frase em destaque, jornada |

Todo relatório termina com "Como lemos estes dados" (metodologia em linguagem simples) e um botão "Falar com a
equipe" que abre a janela do formulário de contato.

## Estilo CANOPA, não Word

- **Capa com arte por tipo**: impacto e instalação/projeto usam as fotos dos painéis sob um véu verde-petróleo;
  geração usa ondas de luz; prestação de contas usa anéis dourados. A mesma arte vale para o cartão da lista.
- **Blocos de cor alternados** (verde-petróleo, branco, dourado, verde-água) e títulos em Barlow Condensed, como
  o site.
- **Movimento com propósito**: os números contam de 0 ao valor, as barras sobem, os quadrados do calendário
  acendem em cascata, a jornada desenha a linha, o anel completa o arco; tudo quando o bloco aparece na tela.
  Com movimento reduzido nada anima e tudo já está no valor final.
- **Uma frase por relatório** com os números que importam sublinhados em dourado.

## Gráficos (skill dataviz)

- Barras em SVG de pixels reais (o texto não encolhe no celular), topo arredondado de 4px, base reta, vão de
  2px entre segmentos, grade de 1px, eixo com números redondos; rótulos em tinta de texto, nunca na cor da série.
- Dois modos: **empilhado** (geração por tipo, cores validadas do painel: teal e verde) e **sobreposto** (antes ×
  depois da conta: a barra clara é "quanto seria", a escura "quanto foi").
- Uma série não leva legenda; duas ou mais levam legenda com a unidade.
- **Calendário** com uma cor só do claro ao escuro (5 tons), número do dia dentro do quadrado, valor ao passar o
  mouse ou focar, melhor dia marcado com sol e anel dourado.
- **Barra segmentada** (um todo em partes) com tom único por ordem de tamanho, percentual dentro do bloco quando cabe,
  valores na legenda, passar o mouse numa parte acende a da legenda.
- Todo gráfico tem **"Ver os dados em tabela"**, painel de valor ao passar o mouse/tocar/focar (setas e Tab) e
  `aria-label` por barra: nada depende só da cor ou do hover.

## Salvar em PDF

O botão abre a impressão do navegador ("Salvar como PDF"). Uma folha de estilo de impressão
(`relatorios.css`, final) esconde o site, o menu e a barra e deixa **só o relatório**, em A4, com as cores
preservadas, sem animações e com um rodapé "CANOPA · título · período · Dados de demonstração". Antes de
imprimir (botão ou Ctrl+P), tudo é revelado de uma vez e o PDF recebe o nome do relatório. Um PDF do relatório
de geração saiu com 4 páginas A4.

## Dados e coerência

Nada é real: os relatórios usam os **mesmos projetos fictícios** de `dados-demo.js`, e todo número sai deles
(investimento de R$ 145.000 na prestação de contas = investimento da Visão geral; a soma dos dias do calendário
fecha com a energia do mês; economia = energia × tarifa). A geração mensal usa sazonalidade do Sudeste e só conta
a partir do mês em que cada projeto entrou em operação (a creche, em instalação, ainda não gera). As
convenções estão na primeira nota de cada relatório. Quando houver backend, `dados.js` vira chamadas à API e as
telas não mudam (os relatórios são listas de blocos).

## Desempenho

- O painel do cliente virou um bloco próprio (`PainelCliente`), e os relatórios outro (`PaginaRelatorios`): o login
  e a visão admin **ficaram mais leves** (bloco de 29 KB → 13 KB; 9,0 → 4,7 KB gzip). Os relatórios custam 7,2 KB
  de JS + 5,7 KB de CSS (gzip) e só descem quando o cliente abre a página.
- A página pública não mudou (bloco principal +0,08 KB gzip: três formatadores novos).
- `formatos.js` ganhou `numero`, `compacto` e `tetoRedondo` (antes moravam no simulador) e há um hook
  `useLargura` compartilhado pelos gráficos. O teto do gráfico agora aceita 1,5, 3, 6 e 8 (antes só 1, 2, 4, 5, 10):
  as barras ocupam melhor a altura.

## Defeitos achados na revisão visual (e corrigidos)

1. O símbolo do sol dentro do anel herdou `rotate` e `100%` da regra do anel e ficou gigante → regra do anel só para o `svg` filho.
2. O cabeçalho do bloco "Projetos" quebrou em três colunas: a regra de `header` dos cartões pegou o do bloco.
3. As linhas da jornada nunca apareciam: o seletor da animação não casava (o `data-visto` está no próprio bloco).
4. As ondas da capa de geração cruzavam o título → ficam na metade de cima e esmaecem.
5. O título "A cada mês, mais energia" era contrariado pelo gráfico (sazonalidade) → "Cada projeto novo, mais energia".
6. No celular o caminho do topo ficava grudado ("RelatóriosGeração…").
7. **Só apareceu em produção:** as fotos das capas (projeto, instalação, impacto) davam 404 no site publicado. Eu as
   carregava com `background: var(--foto)`, e uma URL relativa dentro de variável de CSS é resolvida a partir da
   pasta do CSS (`assets/`), não da página; no servidor de desenvolvimento isso não aparecia. Agora são `<img>`
   com `srcset` (480/800/original) e `loading="lazy"` nos cartões. Lição: o teste agora também falha se qualquer
   requisição devolver erro, e roda na build de produção e no site publicado, não só em desenvolvimento.

## Verificação

Chromium (Playwright), com login e API simulados (nenhuma mensagem real é criada):
- menu, lista com 5 cartões, filtro por tipo, aviso da Visão geral abrindo o relatório, caminho de 3 níveis,
  foco no título, volta pelo menu;
- os 5 relatórios abrem com todos os blocos visíveis depois da rolagem;
- hover e teclado nas barras, hover no calendário, tabelas (31 linhas), soma dos dias = energia do mês;
- impressão: só o relatório, PDF gerado (4 páginas A4); captura em largura de A4 revisada;
- celular de 390 px: sem rolagem lateral, viewport estável, alvos de toque ≥ 44px;
- movimento reduzido: tudo visível e números no valor final; sem erros de console; nenhuma requisição falha (imagens, blocos, fontes); testes do simulador seguem passando. Tudo rodou em desenvolvimento, na build de produção e no site publicado.

## Pendências

1. **CO₂ está inconsistente entre o painel e o simulador.** Os valores de demonstração do painel (7,9 t por ano
   para a escola; 22,5 t no total, que vêm da imagem de referência) equivalem a ~0,56 kg de CO₂ por kWh; o
   simulador usa 0,0385 kg/kWh (média da rede brasileira, MCTI 2023), ~15 vezes menos. Os relatórios seguem o
   painel. Antes de usar dados reais é preciso escolher **uma metodologia** (média da rede, margem de operação
   ou outra) e aplicá-la nos dois lugares.
2. Os relatórios são de exemplo: o admin ainda não consegue publicar relatórios nem anexar arquivos.
3. O PDF sai da impressão do navegador; um PDF gerado no servidor (com paginação própria) fica para quando houver backend.
4. Não testado em aparelho físico, Safari ou Firefox (a impressão usa `:has()` e `print-color-adjust`).
