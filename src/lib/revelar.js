import { gsap, INICIO_PADRAO, MIDIA, SplitText } from './animacao'

/*
  Primitivas de entrada usadas por todas as seções. Regras:
  - sempre animam DE um estado escondido PARA o estado do layout (gsap.from),
    então o fim da animação é exatamente o layout estático;
  - só transform/opacity/clip-path — nada que mexa em layout;
  - disparam uma vez (`once`): quem rola de volta não vê o texto sumir.
*/

/**
 * Text reveal: cada linha sobe de dentro de uma máscara.
 * - desktop: por linha (a linha visual é a que o navegador quebrou);
 * - mobile: por palavra — linhas estreitas quebram em lugares novos e dividir
 *   por linha criaria quebras que o layout não tem.
 * `autoSplit` refaz a divisão se a fonte carregar depois ou a largura mudar, e
 * devolver o tween no `onSplit` faz o SplitText manter o progresso.
 * Parte de 140% (não 110%): a máscara tem folga de .14em para os acentos das
 * maiúsculas (Ã, Ç, É) e, a 110%, o acento da linha escondida aparecia nela.
 */
export function revelarLinhas(alvo, opcoes = {}) {
  const {
    gatilho,
    inicio = INICIO_PADRAO,
    atraso = 0,
    stagger = 0.09,
    duracao = 1.05,
    semScroll = false,
  } = opcoes
  const porPalavra = window.matchMedia(MIDIA.mobile).matches
  const primeiro = Array.isArray(alvo) ? alvo[0] : alvo
  return SplitText.create(alvo, {
    type: porPalavra ? 'words' : 'lines',
    mask: porPalavra ? 'words' : 'lines',
    // as classes existem para o CSS dar folga à máscara (base.css, "Texto revelado")
    ...(porPalavra ? { wordsClass: 'palavra-split' } : { linesClass: 'linha-split' }),
    tag: 'span',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(porPalavra ? self.words : self.lines, {
        yPercent: 140,
        duration: duracao,
        delay: atraso,
        stagger: porPalavra ? stagger / 3 : stagger,
        ease: 'power4.out',
        scrollTrigger: semScroll
          ? undefined
          : { trigger: gatilho ?? primeiro, start: inicio, once: true },
      })
    },
  })
}

/**
 * Palavras "acendem" uma vez ao entrar, sem scrub: se a pessoa parar de rolar no
 * meio, o texto não pode ficar meio apagado. Só a opacidade muda, então cada
 * palavra termina exatamente como no layout.
 */
export function acenderPalavras(alvo, opcoes = {}) {
  const { gatilho, inicio = INICIO_PADRAO, atraso = 0.1, stagger = 0.028 } = opcoes
  return SplitText.create(alvo, {
    type: 'words',
    tag: 'span',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        opacity: 0.18,
        duration: 0.7,
        stagger,
        ease: 'power1.out',
        delay: atraso,
        scrollTrigger: { trigger: gatilho ?? alvo, start: inicio, once: true },
      }),
  })
}

/** Scroll reveal de blocos: sobem e aparecem, um depois do outro. */
export function revelarBlocos(alvos, opcoes = {}) {
  const { gatilho, inicio = INICIO_PADRAO, atraso = 0, stagger = 0.08, y = 28, x = 0, duracao = 0.9 } = opcoes
  const primeiro = gsap.utils.toArray(alvos)[0]
  return gsap.from(alvos, {
    autoAlpha: 0,
    y,
    x,
    duration: duracao,
    delay: atraso,
    stagger,
    scrollTrigger: { trigger: gatilho ?? primeiro, start: inicio, once: true },
  })
}

/**
 * Foto que "nasce": a moldura abre de baixo para cima (como o sol subindo) e a
 * imagem dentro assenta de uma escala maior. `clearProps` devolve o elemento sem
 * clip-path nenhum — o fim é o layout, não um "quase".
 */
export function nascerFoto(moldura, imagem, opcoes = {}) {
  const { gatilho = moldura, inicio = 'top 80%', atraso = 0, duracao = 1.5 } = opcoes
  return gsap
    .timeline({ delay: atraso, scrollTrigger: { trigger: gatilho, start: inicio, once: true } })
    .fromTo(
      moldura,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: duracao, ease: 'power3.inOut', clearProps: 'clipPath' },
      0,
    )
    .from(imagem, { scale: 1.3, duration: duracao * 1.25, ease: 'power2.out' }, 0)
}

/** Parallax interno de uma foto, preso ao scroll (a imagem desliza dentro da moldura). */
export function parallaxFoto(imagem, moldura, intensidade = 7) {
  return gsap.fromTo(
    imagem,
    { yPercent: -intensidade },
    {
      yPercent: intensidade,
      ease: 'none',
      scrollTrigger: { trigger: moldura, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}

/**
 * Rótulo de seção (traço dourado + texto): o traço se desenha da esquerda para a
 * direita e o texto acende junto. Vale para todo `.section-label` dentro do escopo.
 */
export function revelarRotulos(escopo) {
  gsap.utils.toArray('.section-label', escopo).forEach((rotulo) => {
    gsap
      .timeline({ scrollTrigger: { trigger: rotulo, start: INICIO_PADRAO, once: true } })
      .from(rotulo, { autoAlpha: 0, duration: 0.7 }, 0)
      .from(rotulo.querySelector('i'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power3.inOut' }, 0)
  })
}

/**
 * Desenha os traços dos ícones (Lucide são só contorno). Termina no ícone
 * normal; `clearProps` tira o tracejado que o DrawSVG deixa no elemento.
 */
export function desenharIcone(icone, opcoes = {}) {
  const { gatilho = icone, inicio = INICIO_PADRAO, atraso = 0, duracao = 1.3 } = opcoes
  const tracos = icone.querySelectorAll('path, circle, line, polyline, rect')
  return gsap.from(tracos, {
    drawSVG: '0%',
    duration: duracao,
    delay: atraso,
    ease: 'power2.inOut',
    stagger: 0.06,
    clearProps: 'strokeDasharray,strokeDashoffset',
    scrollTrigger: { trigger: gatilho, start: inicio, once: true },
  })
}
