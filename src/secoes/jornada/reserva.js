/*
  A altura que a Jornada ocupa na página: um palco de uma tela (fica grudado com `position: sticky`)
  mais a rolagem que troca os slides (0,85 tela por slide × 4). É CSS puro e vale desde o primeiro
  quadro: a página nunca muda de tamanho quando a seção carrega ou a animação monta. Era assim que
  o pino do ScrollTrigger se comportava (só criava o espaço quando a seção chegava perto), e quem
  clicava em "Impacto" no menu caía no meio da Jornada, porque o alvo mudava de lugar durante a rolagem.
*/
export const SLIDES = 4
export const TELAS_POR_SLIDE = 0.85
export const PALCO = 'max(100svh, 620px)'
export const ALTURA_RESERVADA = `calc(${PALCO} + ${(SLIDES * TELAS_POR_SLIDE).toFixed(2)} * 100svh)`
