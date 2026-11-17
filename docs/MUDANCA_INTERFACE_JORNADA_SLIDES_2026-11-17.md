# Registro — Mudança · Interface · Jornada em slides (sticky scroll) com ilustrações animadas

- Data: 2026-11-17
- Agente: Claude (Sonnet 5.5)
- Estado: concluído localmente (não publicado)

## Resumo

A seção "Da ideia à prestação de contas" (de três etapas em lista) virou um **palco fixo com quatro slides**.
Enquanto a pessoa rola, a seção fica grudada na tela e troca de slide: o texto fica à esquerda e a ilustração à
direita, depois o inverso, e assim por diante. Cada ilustração é uma **animação desenhada em código** (SVG +
GSAP), que toca quando o slide aparece. Entrou a quarta etapa, "Prestação de contas", que o título já prometia.

## As quatro cenas

| Slide | Cena |
| --- | --- |
| 01 · Inscrição | O sol nasce atrás da escola; um formulário voa para dentro, um lápis escreve os três campos (texto digitado em passos) e cada um é confirmado; o botão vira "Enviado" e um aviãozinho de papel parte deixando rastro |
| 02 · Parceria | A empresa (torre com janelas que acendem) e a escola ligadas por um fio de energia; moedas viajam pelo fio, o aperto de mãos acende no meio, o termo é assinado e selado e, no fim, os painéis solares nascem no telhado da escola |
| 03 · Acompanhamento | A escola com painéis recebendo a luz do sol; a energia vira dado e viaja até o painel de acompanhamento: contador (128 kWh), barras dos 7 dias e CO₂ evitado de 4,9 kg (o mesmo fator do simulador, 38,5 g por kWh) |
| 04 · Prestação de contas | O cartão "Como lemos os dados" confere **fonte, período e metodologia** (as promessas do site); o relatório se monta (rosca por tipo com as cores do painel, barras de geração); o selo é carimbado com confete e a etiqueta PDF cai por cima |

Cada cena tem uma linha do tempo de entrada (conta a história, ~6–9 s) e um laço leve (nuvens, raios do sol,
bandeira, fluxo do fio, moedas, pontos de dado) que só roda enquanto o slide está ativo.

## Arquitetura

- `secoes/Jornada.jsx|css` — o palco, a troca de slides, a trilha de pontos e a barra de progresso.
- `secoes/jornada/Pecas.jsx` — céu, sol, nuvens, colinas, escola e árvore compartilhados; `Cena*.jsx` — as quatro cenas
  (cada uma exporta o desenho e `animar()`); `lib/cena.js` — percorrer um caminho e contar números.
- **Sticky em CSS, não pino do ScrollTrigger.** A seção reserva a própria altura em CSS desde o primeiro quadro
  (`jornada/reserva.js`: um palco de uma tela + 0,85 tela por slide) e o palco usa `position: sticky`. O pino do
  ScrollTrigger criava o espaço só quando a seção chegava perto, e a altura da página mudava no meio de uma rolagem
  animada: quem clicava em "Impacto" no menu caía no meio da Jornada. Testado: a altura da página não muda antes e
  depois de a seção carregar, e "Impacto" chega ao lugar certo (75 px do topo).
- **Sem encaixe magnético:** a regra do projeto (ver `SmoothScroll`) é que a página nunca é puxada sozinha. Quem avança é
  a pessoa: rolando ou usando a trilha.
- **Trilha de pontos:** são links para marcadores invisíveis no meio do trecho de cada slide. Chamar `lenis.scrollTo`
  direto não funciona aqui (o Lenis do projeto roda com o relógio sob demanda, `autoRaf: false`, e só o ouvinte de
  âncoras o acorda); com links, a rolagem animada, o teclado (Enter) e o foco vêm de graça.
- **Acessibilidade:** só um slide fica acessível por vez (`inert` + `aria-hidden` nos outros); a trilha marca a etapa
  com `aria-current="step"`; as ilustrações têm texto alternativo; os alvos têm 44 px ou mais.
- **Movimento reduzido:** sem palco fixo nem animação; as quatro etapas ficam empilhadas, com as ilustrações completas.
- **Desempenho:** a seção é um bloco à parte (`lazy`, 11 KB gzip + 1,7 KB de CSS) pedido só com o navegador ocioso
  (`lazy` sozinho o pede no primeiro render, na frente do que pinta a tela), as ilustrações só são montadas
  quando a seção chega perto da tela, e os laços pausam nos slides inativos. Lighthouse (celular, 4 rodadas
  alternadas contra a versão publicada): nota 62,5 contra 63; FCP 1,9 s nos dois; LCP 3,38 contra 3,45 s.
  O pacote principal não cresceu (142 KB gzip). Uma primeira versão (pino + `lazy` direto) custou 0,6 s de FCP e
  foi corrigida por essas medições.

## Espaço entre a Jornada e a seção seguinte (pedido do dono)

A ilustração do último slide encostava na seção seguinte. Causa: a linha da grade do slide crescia até a altura do
texto, e a ilustração herdava essa altura (e passava da borda do palco em telas baixas). Correção: a linha tem a
altura do slide; o slide para 24–52 px acima da borda; a ilustração mede o espaço disponível por *container query*
(a maior com proporção 640×460 que cabe); o texto encolhe em telas baixas; e a seção termina com 36–80 px de respiro.
Medido em 7 tamanhos (1365×640, 1365×768, 1280×600, 1440×900, 1920×1080, 390×844, 360×640): folga de pelo menos
30 px até a base do palco e de 72 px a 344 px até a seção seguinte.

## Verificação

Chromium (Playwright): estrutura sticky; altura da página estável; menu "Impacto"; slides 1→4 e de volta; texto à
esquerda no slide 1 e à direita no 2; pontos por clique e teclado; só um slide acessível; celular (390×844) com o texto
cabendo e alvos de 44 px; movimento reduzido; 0 erros e 0 requisições falhas. Capturas de cada cena em vários
momentos da animação (revisão visual achou e corrigiu 7 defeitos: sobreposições de texto, uma barra que sumia por
conflito de animações, a nuvem sobre a antena, o terceiro campo encostando no botão).

## Pendências

1. Os textos dos slides são do site; os itens de cada etapa são **ilustrativos** (a plataforma está em desenvolvimento):
   confirmar com o dono antes de tratar como regra de negócio.
2. Sem teste em aparelho físico, Safari ou Firefox (`container-type`, `inert`, `position: sticky` em pais com
   `overflow`: o `main` não tem, conferido).
3. Em celulares muito baixos (≤ 700 px) o número grande do slide é omitido para o conteúdo caber.
