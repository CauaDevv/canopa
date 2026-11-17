import { useLayoutEffect, useState } from 'react'

/*
  Largura (px) de um elemento, atualizada quando ele muda de tamanho: os gráficos desenham em pixels reais.
  Nunca devolve menos que `minimo`: com o elemento ainda sem tamanho (ou espremido durante uma transição)
  as contas dos gráficos davam larguras negativas e o navegador reclamava de `<rect width="-8.5">`.
*/
export default function useLargura(ref, padrao = 480, minimo = 160) {
  const [largura, setLargura] = useState(padrao)
  useLayoutEffect(() => {
    const el = ref.current
    const medir = () => setLargura(Math.max(minimo, Math.round(el.getBoundingClientRect().width) || padrao))
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref, padrao, minimo])
  return largura
}
