import { gsap } from './animacao'

/*
  Ferramentas das ilustrações animadas (seção Jornada). Sem MotionPathPlugin: o projeto só registra
  os plugins que usa, então o caminho é percorrido à mão, com getPointAtLength.
*/

/**
 * Faz `alvo` (um <g> posicionado em 0,0) percorrer `caminho` (no mesmo espaço de coordenadas).
 * `rotacionar` gira o alvo na direção da trajetória (o aviãozinho de papel).
 */
export function seguirCaminho(alvo, caminho, { duracao = 2, atraso = 0, de = 0, para = 1, ease = 'none', rotacionar = false, deslocamento = 0, ...extra } = {}) {
  const total = caminho.getTotalLength()
  const estado = { t: de }
  const posicionar = () => {
    const t = estado.t * total
    const p = caminho.getPointAtLength(t)
    const props = { x: p.x, y: p.y }
    if (rotacionar) {
      const q = caminho.getPointAtLength(Math.min(total, t + 1))
      props.rotation = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + deslocamento
    }
    gsap.set(alvo, props)
  }
  return gsap.to(estado, { t: para, duration: duracao, delay: atraso, ease, onUpdate: posicionar, onStart: posicionar, ...extra })
}

/** Faz um número "contar" até `para`, escrevendo no texto do elemento (SVG ou HTML). */
export function contar(el, para, { duracao = 1.4, ease = 'power2.out', formatar = (v) => String(Math.round(v)), atraso = 0 } = {}) {
  const estado = { v: 0 }
  el.textContent = formatar(0)
  return gsap.to(estado, { v: para, duration: duracao, delay: atraso, ease, onUpdate: () => (el.textContent = formatar(estado.v)), onComplete: () => (el.textContent = formatar(para)) })
}

/** Nuvens, raios do sol e outras coisas que nunca param: um laço leve, só enquanto a cena está na tela. */
export function ambienteBase(svg) {
  const $ = gsap.utils.selector(svg)
  const tl = gsap.timeline({ paused: true })
  $('.nuvem').forEach((n, i) => tl.to(n, { x: i % 2 ? -26 : 30, duration: 9 + i * 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0))
  $('.sol-raios').forEach((r) => tl.to(r, { rotation: 360, svgOrigin: '0 0', duration: 70, ease: 'none', repeat: -1 }, 0))
  $('.bandeira').forEach((b) => tl.to(b, { skewY: 7, scaleX: 0.93, transformOrigin: '0% 50%', duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0))
  $('.arvore').forEach((a, i) => tl.to(a, { rotation: 1.8, transformOrigin: '50% 100%', duration: 2.8 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0))
  $('.brilho').forEach((b, i) => tl.to(b, { scale: 0.4, autoAlpha: 0.4, transformOrigin: '50% 50%', duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i * 0.37) % 1.4 }, 0))
  return tl
}
