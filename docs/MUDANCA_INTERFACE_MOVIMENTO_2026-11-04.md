# Registro — Mudança · Interface · Movimento

- Data: 2026-11-04
- Agente: Claude (Sonnet 5.5)
- Estado: concluído

## Resumo

A página ganhou um sistema de movimento preso à rolagem e ao ponteiro, no estilo da LP da Virtron
(GSAP + ScrollTrigger + SplitText + Lenis), com um conceito próprio: **o sol nasce**, porque o símbolo
do CANOPA é um sol sobre o horizonte. O `main.jsx` monolítico foi dividido em seções, e o CSS minificado
em uma linha foi reescrito por arquivo. **O visual estático não mudou**: com movimento reduzido, a página
nova é idêntica à anterior (conferido por regressão visual), exceto os pontos listados em "Decisões".

## Alterações

### Movimento (o que o visitante vê)

- **Hero** — o símbolo do sol se desenha sozinho (horizonte → disco → raios → haste); as ondas de luz são
  riscadas do centro para fora; o título sobe de dentro de uma máscara; uma luz dourada segue o mouse; o sol
  tem profundidade com o ponteiro; ao rolar, o conteúdo desce mais devagar, some e o sol cresce.
- **Cabeçalho** — barra de progresso de leitura, link da seção ativa com fio dourado, abertura animada,
  botão "Quero participar" magnético (desktop) e menu do celular que abre como cortina.
- **Sobre** — a foto "nasce" de baixo para cima e desliza dentro da moldura; a frase de destaque acende
  palavra a palavra.
- **Duas pontas** — as duas metades do título chegam de lados opostos e se encontram, presas à rolagem;
  cada cartão vem do seu lado. Hover: elevação, zoom da foto e brilho que segue o ponteiro.
- **Jornada** — um fio de luz enche o trilho conforme se rola e cada etapa acende quando ele chega.
- **Como funciona** — raios de sol giram atrás da seção presos ao scroll; cada passo abre como cortina e o
  ícone se desenha; hover com brilho, ícone que sobe e número dourado.
- **Impacto** — foto abre como um nascer do sol, luz dourada sobe pela base, o símbolo se desenha, as
  linhas dos três pontos são traçadas em cascata.
- **Informação** — cartões "viram" para a frente (perspectiva); hover com tilt 3D, brilho turquesa e fio
  dourado embaixo.
- **Fitas** (nova faixa de marca entre Informação e Contato) — duas fitas cruzadas com o lema, em sentidos
  opostos; aceleram e se inclinam com a velocidade da rolagem (Lenis); pausam fora da tela.
- **Contato** — a faixa de convite abre com varredura de luz e o símbolo se desenha; campos entram em
  sequência; foco com anel turquesa; estado inválido destacado.
- **Rodapé** — o sol sobe atrás dele ao entrar; raios com balanço lento.

### Código

- `src/lib/animacao.js` — registro único do GSAP e das consultas `MIDIA` (movimento, mobile, desktop, ponteiro fino).
- `src/lib/revelar.js` — primitivas de entrada (linhas em máscara, palavras que acendem, foto que nasce,
  rótulos, ícones traçados). Todas animam *de* um estado escondido *para* o layout estático.
- `src/lib/interacao.js` — ímã, spotlight e tilt (só com mouse). `src/lib/traco.js` — desenho do sol.
- `src/components/ui/SimboloSol.jsx` — **o símbolo reconstruído em SVG** a partir da geometria medida no PNG
  (precisa ser vetor para animar por traço); conferido por sobreposição, diferença de ~1px.
- `src/secoes/*.jsx|css` — uma seção por arquivo, cada uma com o próprio CSS. `src/styles/` — base,
  cabeçalho e acesso/admin. `src/style.css` removido (substituído, valores preservados).
- `src/components/SmoothScroll.tsx` — ponte Lenis → ScrollTrigger (`useLenis`), publica a velocidade para as fitas.
- `HeroTunnel.tsx` — `useReducedMotion` da lib `motion` trocado pelo hook `useMediaQuery` que já existia.
- Dependências: **+** `gsap`, `@gsap/react`; **−** `motion` (e `TextoRevelado.jsx`, que só ela usava).
- `index.html` — um único `<link>` de fontes (Barlow Condensed + DM Sans); removida a Manrope, que nada usava,
  e o `@import` de fonte que bloqueava a renderização.
- Fotos do Unsplash (hotlink, 4 requisições a terceiro) agora locais em `public/images/fotos/` (WebP, com `width`/`height`).

## Decisões

- **Sem números inventados.** Não foi criado contador de impacto: o site declara que dados virão "com fonte e
  premissas". Animar estatística falsa seria o oposto da promessa de transparência.
- **Identidade preservada.** Paleta, tipografia, logo e textos intactos. Nenhum copy foi alterado.
- **Cada seção tem vocabulário próprio** (a rubrica da skill `design-audit` marca fade-up em cascata em
  toda seção como antipadrão): máscara no título, convergência, fio de luz, cortina, perspectiva, fitas.
- **`prefers-reduced-motion`**: nenhuma animação do GSAP roda (sem scrub, sem reveals) e o Lenis fica sem inércia;
  o estado inicial dos reveals nasce no JS, então quem pediu menos movimento recebe a página inteira e legível.
- **Desvios deliberados do visual anterior** (únicos): (1) o título "DUAS PONTAS. / UM PROPÓSITO." quebra em
  duas linhas, uma por metade, no celular (antes quebrava no meio de "UM PROPÓSITO."); (2) fotos recomprimidas
  (WebP local no lugar do JPEG do Unsplash); (3) foco visível global (antes não havia) e áreas de toque
  ampliadas em links do hero, do rodapé e na faixa de contato, sem deslocar o texto.
- Acento de título é a classe `.acento` (antes era `h2 span`, que o SplitText transformaria em título inteiro turquesa).

## Verificação

- Regressão visual com movimento reduzido, HEAD × novo, 1440×900 e 390×844: seções com topo/altura idênticos;
  diferenças restantes só nas 3 fotos recomprimidas e na quebra de linha do título descrita acima.
- Chromium (Playwright), 0 erros de console/página em desktop e mobile; sem overflow horizontal (390 e 1440).
- Comportamento: frames da abertura do hero, hovers (cartão, passo, showcase), âncora do menu
  (seção para a 75px do topo, link ativo correto), menu mobile abre/fecha ao clicar.
- Fluidez de rolagem (rolagem real, 1440, WebGL por software): mediana 16,7 ms (60 fps) antes e depois;
  p95 33 ms nos dois.
- Bundle (gzip): JS principal 127 → 137 KB; CSS 6,4 → 7,4 KB; chunk lazy do túnel (three.js) inalterado.
- Não verificado: Safari/Firefox reais; dispositivo físico de toque; GPU real (o WebGL do teste é por software).

## Pendências (precisam de decisão de quem manda na marca)

Medidas com a razão WCAG real; todas já existiam antes desta mudança e **não foram alteradas** por serem identidade visual.

1. **Contraste do turquesa com texto branco ≈ 2,4:1** (mínimo AA é 4,5:1): seção "Como funciona", faixa de contato
   e o texto do botão "Quero participar". Opções: turquesa mais escuro só nas áreas com texto (ex.: `#078c9a`),
   ou texto escuro sobre o turquesa atual.
2. **Rótulos pequenos (10 px) em `#529298` sobre azul-claro: ≈ 3,0:1.** Escurecer o tom.
3. **Corpo de texto em 14–15 px** (a rubrica pede ≥ 16 px; no iOS campos abaixo disso dão zoom no foco).
4. `typescript`, `vite`, `react`, `react-dom`, `@vitejs/plugin-react`, `lucide-react` estão como `latest` no
   `package.json` (o lockfile protege o CI, mas um `npm install` novo pode mudar versões). Fixar.
5. A foto aérea pesa 254 KB; gerar `srcset` (600/1000 px) reduziria o mobile.
6. O `.github/workflows/pages.yml` publica a cada push na `main`: este commit vai ao ar.
