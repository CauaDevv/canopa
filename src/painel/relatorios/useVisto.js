import { useEffect, useState } from 'react'

/* Vira `true` quando o elemento aparece na tela (uma vez só): é o gatilho das animações de entrada dos blocos. */
export default function useVisto(ref) {
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || visto) return
    if (!('IntersectionObserver' in window)) {
      setVisto(true)
      return
    }
    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setVisto(true)
        observador.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref, visto])
  return visto
}
