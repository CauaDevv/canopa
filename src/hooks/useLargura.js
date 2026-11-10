import { useLayoutEffect, useState } from 'react'

/* Largura (px) de um elemento, atualizada quando ele muda de tamanho: os gráficos desenham em pixels reais. */
export default function useLargura(ref, padrao = 480) {
  const [largura, setLargura] = useState(padrao)
  useLayoutEffect(() => {
    const el = ref.current
    const medir = () => setLargura(Math.round(el.getBoundingClientRect().width) || padrao)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref, padrao])
  return largura
}
