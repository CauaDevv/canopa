import { useCallback, useSyncExternalStore } from 'react'

/**
 * Responde a uma media query, e re-renderiza quando ela vira.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * POR QUE ESTE ARQUIVO EXISTE. A mesma ideia estava escrita duas vezes —
 * `useCompactViewport` em `LandingHeader.tsx` e `useMovimentoReduzido` em
 * `smooth-scroll.tsx` — e as duas cópias divergiam: a do header chamava
 * `setCompact(mq.matches)` dentro do efeito para cobrir a janela entre o
 * primeiro render e a montagem; a do smooth-scroll não, e por isso perdia uma
 * mudança que acontecesse exatamente nesse intervalo.
 *
 * Duas cópias de uma regra é como uma delas fica errada sem ninguém notar.
 *
 * POR QUE `useSyncExternalStore` E NÃO `useState` + `useEffect`. Esta é a API
 * que o React expõe justamente para ler de uma fonte externa (aqui, o
 * `MediaQueryList` do navegador). Ela resolve de uma vez três coisas que a
 * versão com efeito tinha de resolver na mão:
 *
 *   1. O valor do PRIMEIRO render sai de `getSnapshot`, não de um estado
 *      inicial que depois precisa ser corrigido. Some o `setState` síncrono
 *      dentro do efeito — que era o que o `react-hooks/set-state-in-effect`
 *      apontava e o que fazia o `npm run lint` do projeto falhar.
 *   2. A janela entre render e montagem deixa de existir: o React relê o
 *      snapshot ao assinar. Nada a "cobrir na mão".
 *   3. Uma re-renderização a menos na carga, porque não há mais o par
 *      render-inicial → efeito → setState → render-de-novo.
 *
 * `SUPORTA` guarda o caso de `matchMedia` não existir (SSR, ou um ambiente de
 * teste sem DOM): ali o hook devolve `false` em vez de explodir.
 */
const SUPORTA = typeof window !== 'undefined' && typeof window.matchMedia === 'function'

export function useMediaQuery(consulta: string): boolean {
  const assinar = useCallback(
    (aoMudar: () => void) => {
      if (!SUPORTA) return () => {}
      const mq = window.matchMedia(consulta)
      mq.addEventListener('change', aoMudar)
      return () => mq.removeEventListener('change', aoMudar)
    },
    [consulta],
  )

  const ler = useCallback(() => (SUPORTA ? window.matchMedia(consulta).matches : false), [consulta])

  /* O terceiro argumento é o snapshot do servidor. Este app é 100% cliente, mas
     passá-lo evita um aviso caso alguém experimente pré-renderizar. */
  return useSyncExternalStore(assinar, ler, () => false)
}

export default useMediaQuery
