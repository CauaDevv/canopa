import { gsap } from './animacao'

/*
  Desenho que se traça sozinho (skill traco-animado): o contorno é riscado e
  depois o preenchimento acende, grupo a grupo — horizonte, disco, raios, haste.
  O sol "nasce" em vez de aparecer.

  Termina exatamente no estado estático do SVG (preenchido, sem traço): o traço
  é só um andaime que sai de cena. `clearProps` remove o que o DrawSVG deixa em
  `style`; os atributos que mexemos são devolvidos ao valor final de propósito.
*/
export function desenharSol(svg, { atraso = 0, duracao = 1.5, escalonar = 0.2, ...extra } = {}) {
  const formas = gsap.utils.toArray(svg.querySelectorAll('path'))
  // traço fino em proporção ao viewBox (1068 de largura): ~0,5% da largura
  gsap.set(formas, { attr: { 'stroke-width': 5, 'fill-opacity': 0 } })

  const tl = gsap.timeline({ delay: atraso, ...extra })
  formas.forEach((forma) => {
    const t = Number(forma.dataset.grupo || 0) * escalonar
    tl.fromTo(forma, { drawSVG: '0%' }, { drawSVG: '100%', duration: duracao, ease: 'power2.inOut' }, t)
      .to(forma, { attr: { 'fill-opacity': 1 }, duration: 0.8, ease: 'power1.out' }, t + duracao * 0.62)
      .to(forma, { attr: { 'stroke-width': 0 }, duration: 0.7, ease: 'power1.inOut' }, t + duracao * 0.85)
  })
  tl.set(formas, { clearProps: 'strokeDasharray,strokeDashoffset' })
  return tl
}
