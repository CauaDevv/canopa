import { gsap } from './animacao'

/*
  Interações de ponteiro. Todas devolvem a função de limpeza e só devem ser
  chamadas dentro de gsap.matchMedia(MIDIA.ponteiroFino): no toque o "hover"
  fica preso depois do dedo sair.
*/

/**
 * Ímã: o elemento acompanha o ponteiro quando ele chega perto. O deslocamento
 * é limitado (`maximo`, 10px): acima disso o botão parece fugir do clique.
 */
export function ligarImas(elementos, { forca = 0.3, alcance = 60, maximo = 10 } = {}) {
  const limpezas = gsap.utils.toArray(elementos).map((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const mover = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dentro =
        Math.abs(dx) < r.width / 2 + alcance && Math.abs(dy) < r.height / 2 + alcance
      // teto em px: a força é proporcional à distância, e num botão largo isso passaria de 30px
      x(dentro ? gsap.utils.clamp(-maximo, maximo, dx * forca) : 0)
      y(dentro ? gsap.utils.clamp(-maximo * 0.6, maximo * 0.6, dy * forca) : 0)
    }
    const soltar = () => {
      x(0)
      y(0)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerleave', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', soltar)
      gsap.set(el, { clearProps: 'x,y' })
    }
  })
  return () => limpezas.forEach((l) => l())
}

/**
 * Spotlight: a luz segue o ponteiro dentro do card. Só grava duas variáveis CSS
 * (`--mx`, `--my`); quem desenha o brilho é o CSS (`.spot::after`).
 */
export function ligarSpotlight(cards) {
  const limpezas = gsap.utils.toArray(cards).map((card) => {
    const mover = (e) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    card.addEventListener('pointermove', mover, { passive: true })
    return () => {
      card.removeEventListener('pointermove', mover)
      card.style.removeProperty('--mx')
      card.style.removeProperty('--my')
    }
  })
  return () => limpezas.forEach((l) => l())
}

/** Tilt 3D leve. Acima de ~6° o card começa a parecer brinquedo. */
export function ligarTilt(cards, { max = 5 } = {}) {
  const limpezas = gsap.utils.toArray(cards).map((card) => {
    gsap.set(card, { transformPerspective: 1000 })
    const girarX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const girarY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const mover = (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      girarY(px * 2 * max)
      girarX(-py * 2 * max * 0.75)
    }
    const sair = () => {
      girarX(0)
      girarY(0)
    }
    card.addEventListener('pointermove', mover, { passive: true })
    card.addEventListener('pointerleave', sair)
    return () => {
      card.removeEventListener('pointermove', mover)
      card.removeEventListener('pointerleave', sair)
      gsap.set(card, { clearProps: 'transform' })
    }
  })
  return () => limpezas.forEach((l) => l())
}
