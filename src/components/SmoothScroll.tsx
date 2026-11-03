import { useEffect, useMemo, useRef } from 'react'
import { useMediaQuery } from './use-media-query'
import type { ReactNode } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'

/**
 * Rolagem com inércia para a página inteira.
 *
 * `root` põe a instância no window em vez de num wrapper: o Lenis continua
 * rolando o documento de verdade e disparando eventos `scroll` nativos. Isso
 * importa muito aqui — o `ScrollProgress` (framer `useScroll`) e o `HeroTunnel`
 * (que anda com a câmera conforme `window.scrollY`) ouvem scroll no documento,
 * e um wrapper com rolagem própria mataria os dois de uma vez.
 *
 * Três coisas que o componente resolve além de ligar a biblioteca:
 *
 *   1. movimento reduzido — `lerp: 1` e `smoothWheel: false` devolvem a
 *      rolagem nativa a quem pediu menos animação;
 *   2. a cortina de abertura — `body { overflow: hidden }` não segura o Lenis,
 *      porque a rolagem deixou de ser do navegador; quem para de verdade é o
 *      `lenis.stop()` daqui;
 *   3. as âncoras — `scroll-behavior: smooth` saiu do CSS (conflita com o
 *      Lenis), e sem isto todo `href="#..."` viraria um salto seco.
 *
 * O QUE NÃO EXISTE MAIS, e não deve voltar: o encaixe magnético entre seções.
 * Quando a rolagem parava, ele procurava a seção mais próxima do topo e puxava
 * a página até ela — e puxar a página por conta própria é exatamente o que o
 * dono pediu para tirar. A rolagem agora para onde o visitante soltou. (O
 * `scroll-snap` do CSS também não serve como substituto: ele espera rolagem
 * nativa e briga com o Lenis, que anima `scrollTop` por JavaScript.)
 */

/** Quanto tempo o alvo da âncora leva para chegar, em segundos. */
const DURACAO_ANCORA = 1.1

const PREFERE_MENOS_MOVIMENTO = '(prefers-reduced-motion: reduce)'

/**
 * `true` quando o sistema pede menos animação.
 *
 * O corpo saiu daqui para `./use-media-query`. Havia duas leituras de
 * media query no projeto, esta e a do `LandingHeader`, e elas divergiam: a de lá
 * relia o valor na montagem para cobrir a janela entre render e efeito, esta não
 * — então uma mudança nesse intervalo era perdida aqui. O hook comum usa
 * `useSyncExternalStore`, onde essa janela não existe.
 */
function useMovimentoReduzido() {
  return useMediaQuery(PREFERE_MENOS_MOVIMENTO)
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null)
  const acordarRafRef = useRef<() => void>(() => undefined)
  const reduzido = useMovimentoReduzido()

  /*
   * `useMemo` não é preciosismo: `options` é comparado por identidade, e um
   * objeto novo a cada render faria o ReactLenis recriar a instância — o que
   * zera a posição interna e engasga a rolagem.
   */
  const opcoes = useMemo(
    () => ({
      autoRaf: false,
      lerp: reduzido ? 1 : 0.1,
      duration: 1.2,
      smoothWheel: !reduzido,
    }),
    [reduzido],
  )

  /* ---------- relógio sob demanda ---------- */
  useEffect(() => {
    /*
     * O wrapper React do Lenis liga `autoRaf` por padrão, mantendo a página em
     * 60 fps mesmo quando ninguém está rolando. Aqui o relógio acorda somente
     * diante de uma entrada de rolagem e se desliga assim que a interpolação
     * termina. O acesso pelo ref dentro do quadro também cobre uma eventual
     * recriação da instância ao alternar `prefers-reduced-motion`.
     */
    let quadro: number | null = null

    const animar = (tempo: number) => {
      quadro = null

      const lenis = ref.current?.lenis
      if (!lenis) return

      lenis.raf(tempo)
      if (lenis.isScrolling === 'smooth') {
        quadro = window.requestAnimationFrame(animar)
      }
    }

    const acordar = () => {
      if (quadro !== null) return

      /*
       * O relógio interno guarda o instante do último quadro. Sem realinhá-lo,
       * o primeiro quadro depois de uma pausa contabilizaria todo o tempo
       * ocioso e concluiria a rolagem de uma vez, como um salto.
       */
      const lenis = ref.current?.lenis
      if (lenis) lenis.time = performance.now()
      quadro = window.requestAnimationFrame(animar)
    }

    acordarRafRef.current = acordar
    window.addEventListener('wheel', acordar, { passive: true })
    window.addEventListener('touchmove', acordar, { passive: true })
    window.addEventListener('touchend', acordar, { passive: true })

    return () => {
      acordarRafRef.current = () => undefined
      window.removeEventListener('wheel', acordar)
      window.removeEventListener('touchmove', acordar)
      window.removeEventListener('touchend', acordar)
      if (quadro !== null) window.cancelAnimationFrame(quadro)
    }
  }, [])

  /* ---------- a cortina de abertura ---------- */
  useEffect(() => {
    /*
     * O `LandingIntroOverlay` travava a página com `body.style.overflow`. Sob o
     * Lenis isso não trava nada: a rolagem deixou de ser do navegador e virou
     * um número animado por JavaScript, que `overflow` não governa. O resultado
     * era rolar por trás da cortina durante os 2,4s de abertura.
     *
     * O overlay agora marca `intro-ativo` no <html> e quem para de verdade é o
     * `lenis.stop()` daqui. O observador é necessário porque o overlay monta e
     * desmonta a classe fora do ciclo de render deste componente.
     */
    const raiz = document.documentElement

    const sincronizar = () => {
      const lenis = ref.current?.lenis
      if (!lenis) return
      if (raiz.classList.contains('intro-ativo')) lenis.stop()
      else lenis.start()
    }

    sincronizar()
    const observador = new MutationObserver(sincronizar)
    observador.observe(raiz, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])

  /* ---------- âncoras ---------- */
  useEffect(() => {
    /*
     * Um só ouvinte delegado, em vez de mexer no cabeçalho, no painel mobile e
     * no rodapé. Qualquer âncora criada depois já entra coberta — inclusive as
     * das seções que ainda vão ser reescritas.
     */
    const aoClicar = (evento: MouseEvent) => {
      // Deixa passar clique do meio, com modificador e botão que não o principal
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return

      const alvo = (evento.target as Element | null)?.closest?.('a[href^="#"]')
      if (!(alvo instanceof HTMLAnchorElement)) return
      if (alvo.target && alvo.target !== '_self') return

      const id = alvo.getAttribute('href')
      if (!id || id === '#') return

      const destino = document.querySelector(id)
      if (!(destino instanceof HTMLElement)) return

      const lenis = ref.current?.lenis
      if (!lenis) return

      evento.preventDefault()

      /*
       * Sem `offset`, de propósito.
       *
       * O Lenis já lê `scroll-padding-top` do scrollport e `scroll-margin-top`
       * do alvo, exatamente como o navegador faria. Passar um offset "para
       * compensar o cabeçalho" somaria um terceiro desconto e jogaria o alvo
       * para baixo demais. A folga já está declarada no CSS
       * (`scroll-padding-top: 5rem` no html) e é de lá que ela deve sair.
       */
      lenis.scrollTo(destino, { duration: reduzido ? 0 : DURACAO_ANCORA })
      acordarRafRef.current()

      /*
       * Rolagem sequestrada move a página mas NÃO move o foco — quem navega por
       * teclado continuaria de onde estava. `preventScroll` evita que o foco
       * brigue com a animação do Lenis.
       */
      if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1')
      destino.focus({ preventScroll: true })

      // Mantém a URL coerente sem provocar o salto nativo do hash
      history.pushState(null, '', id)
    }

    document.addEventListener('click', aoClicar)
    return () => document.removeEventListener('click', aoClicar)
  }, [reduzido])

  return (
    <ReactLenis root ref={ref} options={opcoes}>
      {children}
    </ReactLenis>
  )
}
