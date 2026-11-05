import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

/*
  Ponto único de entrada do GSAP: registra os plugins uma vez e define o "tom"
  do movimento da página inteira. Seções importam daqui, nunca de "gsap".

  Tom do CANOPA: o sol nasce. Entradas decididas e suaves (power3.out), sem
  quique — nada de back/elastic, que é ruído para uma plataforma que promete
  transparência.
*/
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP)

gsap.defaults({ ease: 'power3.out', duration: 0.9 })
// o resize da barra de endereço do celular não pode disparar refresh e dar tranco
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * Consultas para gsap.matchMedia. Toda animação mora dentro de MIDIA.movimento:
 * quem pediu menos movimento recebe a página no estado final, sem nada escondido
 * por CSS esperando o JavaScript (o estado inicial dos reveals nasce no GSAP).
 */
export const MIDIA = {
  movimento: '(prefers-reduced-motion: no-preference)',
  reduzido: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 1024px)',
  mobile: '(max-width: 1023px)',
  // tilt, ímã e spotlight só fazem sentido com mouse: no toque o hover "gruda"
  ponteiroFino: '(hover: hover) and (pointer: fine)',
}

/** Onde o gatilho de scroll dispara: quando o topo do alvo passa de 85% da tela. */
export const INICIO_PADRAO = 'top 85%'

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP }
