# Registro — Mudança · Interface · Painel (admin e visão do cliente) em vidro

- Data: 2026-11-17
- Agente: Claude (Sonnet 5.5)
- Estado: concluído localmente (não publicado)

## Resumo

O painel (a área admin e a visão do cliente, que compartilham a mesma casca) deixou de ser claro com barra lateral
sólida e passou para **vidro**: a estética do painel do **Acelera Pages**, adaptada à paleta do CANOPA. A fonte foi
lida só para leitura em `Acelera Pages/apps/web/src/acelera/` (`vidro.css`, `TrilhoDeVidro.tsx`,
`trilho-de-vidro.css`); nada daquele projeto foi alterado.

> O CANOPA só tem **uma** conta administrativa e a "visão do cliente" (um modo de visualização dentro dela). Não
> existe perfil superadmin: o vidro foi aplicado aos dois modos que existem.

## O que veio do Acelera Pages (e como virou CANOPA)

| Técnica do original | No CANOPA |
| --- | --- |
| Fundo escuro com luz de marca numa **camada própria** (laranja subindo da base, azul no alto) | Verde-petróleo; o **sol dourado** sobe pela base e turquesa no alto (`.pn::before`), pintado uma vez |
| Barra lateral **flutuante** com `backdrop-filter: blur(26px) saturate(170%)` e brilho quente na base | Igual, com a base em dourado; vira gaveta quase opaca no celular |
| Cartões de **vidro líquido**: reflexo diagonal, tinta translúcida, **aro de luz em degradê** feito por máscara (forte nos cantos superior esquerdo e inferior direito) | Mesma construção (`--vidro-face`, `--vidro-tinta`, `--vidro-aro`) em métricas, cartões, projetos, mensagens, relatórios |
| **Poços** afundados para campos e números | Busca, cabeçalho de tabela, usuário e notas |
| **Lente de vidro** (TrilhoDeVidro): pílula que desliza até o item ativo e, no Chromium, refrata o que está embaixo (mapa de deslocamento SVG) | Portada para JSX (`painel/TrilhoDeVidro.jsx`): mesma geometria, mapa gerado uma vez por tamanho, refração desligada durante o trajeto, sem movimento com `prefers-reduced-motion` |
| Barras de rolagem de vidro | Igual (fina, gradiente branco → dourado) |
| Sem `backdrop-filter` nas superfícies que rolam (custava um recálculo por quadro) | Mesma regra: só a barra lateral, o topo e a lente usam desfoque |
| `prefers-reduced-transparency`, `forced-colors`, `@supports` sem backdrop-filter | Os três tratados |

## Mudanças

- `painel/painel.css` — reescrito com o vidro (tokens `--vidro-*` e `--pn-*`).
- `painel/TrilhoDeVidro.jsx` — a lente; `PainelShell.jsx` envolve o menu nela (`data-lente` nos itens).
- `painel/relatorios/relatorios.css` — os relatórios passam para o vidro. As cores que dependem do tema (calendário,
  rampa da barra segmentada, fundos) viraram variáveis.
- **PDF continua claro:** na impressão as variáveis voltam para um tema de papel (menos tinta, melhor leitura),
  então "Salvar em PDF" não gera páginas escuras. Conferido numa captura em largura de A4.
- Cores de gráficos para fundo escuro: as séries "geração" e "com energia solar" passaram de `#0a7480` (contraste
  2,6:1 no vidro) para `#2bc4d3` (6,7:1); "sem energia solar" de `#bcdcdb` para `#5d8c92`. As cores das categorias
  da rosca (`#0589a3`, `#e19b00`, `#3f9d6e`) ficam: 3,4:1, 6,0:1 e 4,2:1 sobre o vidro.
- Rosca: o trilho cinza virou classe (`.pn-rosca-trilho`).
- O texto do calendário ("Quanto mais forte a cor…") ficou neutro ao tema.

## Contraste (medido)

Texto principal (#eaf7f6) sobre o vidro: 8,8 a 12,8:1; texto auxiliar (#a9cfd1): 5,8 a 8,4:1 (o pior caso é o
vidro com luz dourada); ouro (#f9ca78): 6,3 a 9,2:1; botão ouro (texto #07404a): 7,5:1.
**A skill de validação de paletas (dataviz) não estava disponível nesta sessão:** a separação para daltônicos do
trio de categorias não foi recalculada; ele é o mesmo já validado antes (luminosidade e croma na faixa), e
o contraste e os rótulos visíveis na legenda cobrem a leitura sem cor.

## Verificação

Capturas de admin, visão geral, projetos, lista e leitor de relatório e fichas, no desktop (1440) e no celular
(390); a lente se move até o item ativo (e, no Chromium, refrata); menu em gaveta no celular; relatórios, projetos e
rosca passam nas suítes; impressão em tema de papel.

## Pendências

1. A refração da lente só renderiza no Chromium (como no original); em Safari/Firefox ela é só a pílula de vidro.
2. Sem teste em aparelho físico.
3. A tela de login (acesso admin) continua clara, como o site; só o painel recebeu o vidro.
