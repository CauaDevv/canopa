import { useEffect, useState } from 'react'

/**
 * Qual das âncoras do menu está "sob os olhos" agora. Uma faixa fina perto do
 * meio da tela decide: as seções são vizinhas, então no máximo uma cruza a faixa
 * por vez; no hero e nas seções fora do menu nenhuma fica ativa.
 * IntersectionObserver em vez de ScrollTrigger: funciona com ou sem Lenis e
 * também com movimento reduzido, porque indicar a seção não é animação.
 */
export default function useSecaoAtiva(hrefs) {
  const [ativa, setAtiva] = useState(null)
  const chave = hrefs.join('|')

  useEffect(() => {
    const ids = chave.split('|')
    const cruzando = new Map()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) cruzando.set(`#${e.target.id}`, e.isIntersecting)
        setAtiva(ids.find((h) => cruzando.get(h)) ?? null)
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    for (const h of ids) {
      const alvo = document.querySelector(h)
      if (alvo) observador.observe(alvo)
    }
    return () => observador.disconnect()
  }, [chave])

  return ativa
}
