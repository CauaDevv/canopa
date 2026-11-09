import { useEffect } from 'react'

/*
  Dica de movimento: quando o controle aparece na tela, ele desliza sozinho uma vez
  (inicial → pontos → inicial) para mostrar que dá para mexer. Para na primeira
  interação (`tocou.current`) e não roda para quem pediu menos movimento.
*/
export default function useDicaDeslizar(ref, { inicial, pontos, aplicar, tocou }) {
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let quadro = 0
    let timer = 0
    const trajeto = [inicial, ...pontos, inicial]
    let i = 0

    const proximo = () => {
      if (tocou.current || i >= trajeto.length - 1) return
      const de = trajeto[i]
      const ate = trajeto[i + 1]
      const inicio = performance.now()
      i += 1
      const passo = (agora) => {
        if (tocou.current) return
        const k = Math.min(1, (agora - inicio) / 900)
        const suave = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
        aplicar(de + (ate - de) * suave)
        if (k < 1) quadro = requestAnimationFrame(passo)
        else timer = window.setTimeout(proximo, 350)
      }
      quadro = requestAnimationFrame(passo)
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        observador.disconnect()
        timer = window.setTimeout(proximo, 900)
      },
      { threshold: 0.4 },
    )
    observador.observe(el)

    return () => {
      observador.disconnect()
      cancelAnimationFrame(quadro)
      clearTimeout(timer)
    }
  }, [ref, inicial, pontos, aplicar, tocou])
}
