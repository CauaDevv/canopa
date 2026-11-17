import { useEffect } from 'react'

/*
  No toque não existe "o ponteiro saiu": o dedo levanta e o gráfico já perdeu o foco, então o
  valor mostrado sumia no mesmo instante. Aqui a seleção por toque fica até a pessoa tocar
  em outro lugar: um toque (ou caneta) fora de `ref` chama `aoFora`. O mouse não passa por
  aqui: ele continua selecionando por hover.
*/
export default function useToqueFora(ref, ativo, aoFora) {
  useEffect(() => {
    if (!ativo) return
    const aoTocar = (e) => {
      if (e.pointerType === 'mouse') return
      if (ref.current && !ref.current.contains(e.target)) aoFora()
    }
    document.addEventListener('pointerdown', aoTocar, true)
    return () => document.removeEventListener('pointerdown', aoTocar, true)
  }, [ref, ativo, aoFora])
}
