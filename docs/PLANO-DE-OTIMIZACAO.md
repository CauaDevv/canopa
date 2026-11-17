# Plano de otimização — fluidez da página (Jornada)

**Data:** 2026-11-17 · **Escopo:** página pública (`src/secoes/Jornada.jsx`) · **Regra:** o visual não muda.

## Diagnóstico (com evidência)

Ambiente de medição: Chromium headless com GL por software, CPU limitada a 4× (CDP `Emulation.setCPUThrottlingRate`), celular 390×844, rolagem constante de 10 px por quadro atravessando a Jornada inteira, mediana de 3 rodadas. Os números valem **entre si** (antes × depois), não como valor absoluto de um aparelho real.

| Achado | Evidência | Decisão |
| --- | --- | --- |
| **P1 — `--progresso` escrito na seção a cada quadro** invalida o estilo de todas as ilustrações (centenas de elementos SVG) | recálculo de estilo: **~11,6 a 12,1 s** em ~1780 recálculos na travessia; quadro mediano **67 ms** (17 ms fora da seção) | corrigido (E1) |
| **P2 — laços das cenas continuam rodando fora da tela** | no rodapé, depois de visitar o slide 2: script **~380–394 ms** por 4 s contra **~163–215 ms** sem visita; ~100 quadros contra ~140 | corrigido (E3) |
| **P3 — `getPointAtLength` a cada quadro** nos laços dos slides 2 (moedas) e 3 (pontos de dado) | 21% e 17% de todo o tempo amostrado (**~1311 ms e ~931 ms por 4 s**, CPU 4×) | **não aplicado** (ver Pendências) |

Medidos e **mantidos de propósito** (sem ganho comprovado, ou com risco): `backdrop-filter`, animações CSS, `will-change`, `content-visibility` (teste A/B sem ganho; arrisca âncoras e ScrollTrigger), desenho do canvas do CTA (JS é 1,9% do tempo; o custo é rasterização por software do ambiente de teste), primeira leitura de layout do cabeçalho (inevitável). O JS não usado dos pacotes `index` e do túnel é código de biblioteca (≈53 KB cada), sem corte seguro.

## Plano

1. **E1** — escrever o progresso direto na barrinha, sem propriedade CSS na seção.
2. **E3** — pausar a cena ativa quando a seção sai da tela e retomar de onde parou na volta.
3. **E2** — trocar `getPointAtLength` por tabela pré-calculada e escrita direta de atributos (pulada a pedido, vira recomendação).

## Alterações

| Item | Estado | Onde |
| --- | --- | --- |
| E1 — barra de progresso sem `--progresso` | **APLICADO** | `src/secoes/Jornada.jsx` (`barra.style.transform`), `src/secoes/Jornada.css` (`scaleX(0)` como estado inicial) |
| E3 — cena dorme fora da tela e retoma sem reiniciar | **APLICADO** | `src/secoes/Jornada.jsx` (`dormir()` + `ScrollTrigger` de visibilidade, criado antes dos demais) |
| E2 — tabela no lugar de `getPointAtLength` nos laços | **RECOMENDADO** | `src/secoes/jornada/CenaParceria.jsx` e `CenaAcompanhamento.jsx` (drivers `onUpdate`), helper em `src/lib/cena.js` |

Nenhum documento foi apagado ou renomeado; só este arquivo foi criado e uma linha foi acrescentada ao índice (`docs/relatorio.md`).

## Resultados (medidos)

Travessia da Jornada, celular, CPU 4×, mediana de 3 rodadas:

| Métrica | Antes | Depois |
| --- | --- | --- |
| Quadro mediano dentro da Jornada | 67 ms (slide 3: 83 ms) | **17 ms** |
| Quadros lentos (> 33 ms) | 287–291 de ~369 | **16–17** de ~369 |
| Recálculo de estilo | 11,6–12,1 s | **1,2 s** |
| Tarefas totais da thread principal | ~21–22 s | **~8,1–8,3 s** |

Desktop (1440×900, CPU 4×): quadro mediano **50 → 17 ms**, quadros lentos **279 → 11**, recálculo de estilo **11,0 → 1,3 s**.

Fora da tela (E3), rodapé depois de visitar o slide 2: script **~380–394 → ~221–256 ms** por 4 s (sem visita: ~190–207 ms, então o que sobra está na faixa do ruído). A cena fica congelada fora da tela e continua de onde parou na volta, sem refazer a história (teste automatizado em desktop e celular).

Validação: build sem erros; suítes `jornada-teste`, `jornada-dorme` (nova), `jornada-espaco`, `smoke-site`, `rel-teste`, `projeto-teste` e `rosca-toque` sem falhas e sem erros de console; `login-medir` sem rolagem lateral.

## Pendências e limites

- **E2 (recomendado):** com a página parada dentro dos slides 2 e 3, os laços ainda custam ~1000 e ~890 ms de script a cada 4 s (CPU 4×) contra ~100 ms com o GSAP pausado, e o quadro vai a 33 ms nesses slides. `getPointAtLength` é o maior item individual. Fica para uma próxima rodada.
- Não testado em aparelho físico, Safari ou Firefox. O ambiente de medição usa GL por software, então rasterização e composição pesam mais do que em um celular real.
- Uma rodada isolada de medição saiu ruidosa (a própria máquina de teste); foi repetida e a repetição concorda com as anteriores.
- Não foi feita comparação Lighthouse desta rodada; nenhum ganho de carga inicial é afirmado aqui. As mudanças só afetam a rolagem dentro da Jornada.
