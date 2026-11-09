# Registro — Refatoração · Desempenho · Página

- Data: 2026-11-09
- Agente: Claude (Sonnet 5.5)
- Estado: concluído

## Resumo

A página ficou pesada por causa dos componentes (10 seções animando na carga, o túnel WebGL, fontes de terceiros,
fotos sempre em tamanho grande). Foi medida com o **Lighthouse** (o mesmo motor do painel Lighthouse do
DevTools) e com o **Chrome DevTools Protocol** (perfil de CPU, contadores de layout) e otimizada **sem mudar o
visual** (conferido por regressão visual, ver abaixo).

> O MCP `chrome-devtools` **não estava conectado** nesta sessão (só o `magnific` aparecia). Foram usados o
> Lighthouse da pasta de auditoria da Virtron e o CDP via Playwright, que são o mesmo motor por baixo.

## O que a medição mostrou (celular emulado, CPU 4×, 4G lenta, WebGL por software)

| | antes | depois |
| --- | --- | --- |
| Layouts forçados na carga | 441 (1,56 s) | ~180–220 |
| Recálculos de estilo | 1.140 | ~340–530 |
| Execução de JS | 5,6–5,9 s | 2–3 s |
| FCP | 3,4–4,2 s | ~1,9 s |
| LCP | 5,8–6,8 s | 3,1–3,4 s |
| Peso transferido | 1.092 KB | 619 KB |
| Nota de desempenho (várias execuções) | 32–44 | 59–74 |
| CLS (desktop) | 0,045 | 0 |

No desktop: nota 69–86 → 75–99; LCP 1,33–1,47 s → 0,64–0,72 s.
**As notas variam bastante nesta máquina** (WebGL por software, outros processos): baseline mobile entre 32 e 44,
final entre 59 e 74. O que se repetiu em todas as execuções foi a direção e os números mais estáveis (FCP, LCP, peso,
layouts). Em celular real, com GPU, o túnel custa menos que no laboratório.

## O que foi feito

1. **Animação de cada seção só quando ela chega perto da tela** (`hooks/useQuandoPerto.js`, 8 seções). Era a maior
   causa: cada `gsap.from()` lê estilo calculado e forçava layout, e as 10 seções criavam tudo na carga
   (`_getComputedProperty` ~1 s de CPU, `_refresh100vh` ~320 ms). A margem de 1200 px garante que o visitante nunca
   vê o estado "ainda não preparado".
2. **Túnel WebGL (three.js) fora do caminho crítico:** só é baixado depois da carga, com o navegador ocioso, e
   nem é baixado com movimento reduzido. Materiais compartilhados (um por foto, antes um por plano, o que
   recalculava os parâmetros do shader a cada segmento reciclado).
3. **Ondas do hero:** `pathLength="1"` + GSAP animando só o `stroke-dashoffset` (sem o `getTotalLength()` do DrawSVG
   em 76 caminhos). Tentei CSS puro e **piorou** (77 animações "não compostas"), por isso foi revertido.
4. **Fontes próprias** (woff2 latin, `styles/fontes.css`): saem o Google Fonts (2 domínios + CSS bloqueante) e o TTF de
   81 KB; Barlow Condensed 400/500/600 (o 700 não era usado) e DM Sans variável; preload das da primeira tela.
   Isso eliminou o deslocamento de layout do hero (troca de fonte no meio do carregamento).
5. **Imagens:** logo 56 → 20 KB (WebP 480 px; era exibido a 140–190 px); texturas do túnel 182 → 90 KB (WebP); fotos com
   `srcset` 480/800/original (o celular baixa 14–83 KB em vez de 175–250 KB).
6. **Formulário fora da carga** (janela sob demanda, ver o outro registro de hoje).

## Limpeza (arquivos e código que não eram necessários)

- `CampoMagnetico.jsx` (439 linhas, componente + motor de canvas) → componente de 88 linhas + `lib/campo.js` (motor).
- `HeroTunnel.tsx`: removidos o caminho padrão de fotos de outro projeto (`/images/tunel/moda-*.avif`, inexistente),
  comentários e código do fade por plano → 437 → 384 linhas.
- `flow-button.css`: removidas as regras de outro projeto (`catalog-story`, `pricing-card`, `nav-mobile`, `cta--dark`…),
  nenhuma usada. `Icon.tsx`: 13 ícones de outro projeto → só a seta usada.
- Removidos: `src/assets/barlow-condensed-500.ttf`, `public/images/canopa-logo.png`, `canopa-simbolo.png`,
  `solar-1..3.jpg` (substituídos pelas versões otimizadas), `Accounts.jsx` e `TextoRevelado.jsx` (em registros anteriores).
- `package.json`: removidos `typescript` e `@vitejs/plugin-react` (nada os usa: o `vite.config.js` não tem
  plugin e o Vite transpila TSX sozinho); `vite` foi para `devDependencies`; todas as versões **fixadas** nas que
  estavam instaladas (antes `latest`). `npm ci --dry-run` confere com o lockfile.

## Verificação

- **Regressão visual** (movimento reduzido, código de antes × depois): 1440 px, mesma altura e só 2 de 175 faixas
  diferem (o logo do rodapé, agora WebP); 390 px, mesma altura e só diferem as faixas das fotos (versões
  recomprimidas, imperceptível lado a lado).
- Comportamento: rolagem completa sem nenhum elemento preso escondido fora do hero e com os títulos/fotos animados;
  âncoras, menu mobile, janela do formulário, painel admin → cliente; produção com 0 erros, 0 requisições falhas,
  0 imagens quebradas (desktop, celular e movimento reduzido).

## Pendências

1. O túnel continua sendo o maior custo isolado (`three` ~134 KB gzip). Reduzi o que ele faz, mas ele existe. Se o
   desempenho em celulares fracos importar mais que o efeito, a opção seguinte é desligá-lo em telas pequenas
   (**muda o visual**, por isso não foi feito sem sua decisão).
2. O LCP no celular (~3,2 s) é dominado pelo tempo até o React e o GSAP montarem o hero. Reduzir mais exige
   pré-renderizar o HTML do hero (SSG), que é uma mudança de arquitetura.
3. Testar em aparelhos reais e em Safari/Firefox.
