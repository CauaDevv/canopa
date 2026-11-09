import { useEffect, useState } from 'react'

/*
  Vira `true` quando o elemento chega a `margem` px da tela e nunca mais volta a `false`.

  Por que existe: cada seção cria dezenas de tweens e ScrollTriggers, e cada `gsap.from()`
  lê o estilo calculado (força layout). Criar tudo na carga custava ~440 layouts e ~1,5 s de
  thread principal no celular. Com este hook a animação de uma seção só é montada quando
  ela está a ~1200px de aparecer — longe o bastante para o visitante nunca ver o estado
  "ainda não preparado", e a carga fica só com o que está na primeira tela.
*/
export default function useQuandoPerto(ref, margem = 1200) {
  const [perto, setPerto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || perto) return
    if (!('IntersectionObserver' in window)) {
      setPerto(true)
      return
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setPerto(true)
          observador.disconnect()
        }
      },
      { rootMargin: `${margem}px 0px` },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref, margem, perto])

  return perto
}
