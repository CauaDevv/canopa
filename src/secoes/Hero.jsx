import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Flow from '../components/ui/Flow'
import LinhasOnduladas from '../components/ui/LinhasOnduladas'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { ligarImas } from '../lib/interacao'
import { revelarLinhas } from '../lib/revelar'
import { desenharSol } from '../lib/traco'
import './Hero.css'

// three.js é a parte mais pesada da página (~130 KB gzip + compilar shaders): só desce depois da
// carga, com o navegador ocioso, e nem desce para quem pediu movimento reduzido. O hero já está
// legível sem ele; quando chega, o túnel aparece com um fade (o visual final é o mesmo).
const HeroTunnel = lazy(() => import('../components/HeroTunnel').then((m) => ({ default: m.HeroTunnel })))
const fotosTunel = ['solar-1.webp', 'solar-2.webp', 'solar-3.webp'].map(
  (nome) => `${import.meta.env.BASE_URL}images/solar/${nome}`,
)

/*
  Tese visual do hero: o sol nasce. O símbolo da marca é um sol sobre o horizonte,
  então a abertura é ele se desenhando — horizonte, disco, raios, haste — e o
  título subindo de dentro de uma máscara logo depois. Depois da abertura nada
  se mexe sozinho: a luz acompanha o ponteiro e a rolagem leva o hero embora.
*/
export default function Hero() {
  const raiz = useRef(null)
  const [tunel, setTunel] = useState(false)

  useEffect(() => {
    if (window.matchMedia(MIDIA.reduzido).matches) return
    let espera
    let ocioso
    const iniciar = () => {
      espera = window.setTimeout(() => {
        const comecar = () => setTunel(true)
        if (window.requestIdleCallback) ocioso = window.requestIdleCallback(comecar, { timeout: 3000 })
        else comecar()
      }, 1200)
    }
    if (document.readyState === 'complete') iniciar()
    else window.addEventListener('load', iniciar, { once: true })
    return () => {
      window.removeEventListener('load', iniciar)
      window.clearTimeout(espera)
      if (ocioso && window.cancelIdleCallback) window.cancelIdleCallback(ocioso)
    }
  }, [])

  useGSAP(
    () => {
      const r = raiz.current
      const $ = (sel) => r.querySelector(sel)
      const mm = gsap.matchMedia()

      // ---------- abertura + rolagem ----------
      mm.add(MIDIA.movimento, () => {
        const sol = $('.hero-sun')
        desenharSol(sol, { atraso: 0.2 })

        // as ondas de luz se riscam do centro para fora (pathLength=1: ver LinhasOnduladas)
        gsap.fromTo(
          r.querySelectorAll('.hero-lines path'),
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 2.4,
            ease: 'power2.out',
            stagger: { each: 0.03, from: 'center' },
            delay: 0.3,
            clearProps: 'strokeDasharray,strokeDashoffset',
          },
        )

        gsap
          .timeline()
          .from('.hero-kicker', { autoAlpha: 0, y: 12, duration: 0.9 }, 0.55)
          .from('.hero-buttons > *', { autoAlpha: 0, y: 22, duration: 0.9, stagger: 0.12 }, 1.35)
          .from('.scroll-cue', { autoAlpha: 0, duration: 1.2 }, 1.9)
        revelarLinhas($('.hero h1'), { semScroll: true, atraso: 0.65, stagger: 0.15, duracao: 1.25 })
        revelarLinhas($('.hero-content p'), { semScroll: true, atraso: 1.05, stagger: 0.1, duracao: 1 })

        // ao sair, o conteúdo desce mais devagar que a página (parallax) e some;
        // o sol cresce, como se a câmera subisse. Em scroll 0 tudo é o layout.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: r, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          })
          .to('.hero-alvo', { y: () => r.offsetHeight * 0.23, duration: 1 }, 0)
          .to('.hero-content', { autoAlpha: 0, scale: 0.94, duration: 0.55 }, 0.12)
          .to('.hero-sol', { scale: 1.22, yPercent: -6, duration: 1 }, 0)
      })

      // ---------- ponteiro: a luz segue o mouse, o sol ganha profundidade ----------
      mm.add(`${MIDIA.movimento} and ${MIDIA.ponteiroFino}`, () => {
        const sol = $('.hero-sun')
        const luz = $('.hero-luz')
        const solX = gsap.quickTo(sol, 'x', { duration: 1, ease: 'power3' })
        const solY = gsap.quickTo(sol, 'y', { duration: 1, ease: 'power3' })
        const luzX = gsap.quickTo(luz, 'x', { duration: 0.8, ease: 'power3' })
        const luzY = gsap.quickTo(luz, 'y', { duration: 0.8, ease: 'power3' })
        let visivel = false

        const mover = (e) => {
          const caixa = r.getBoundingClientRect()
          const px = (e.clientX - caixa.left) / caixa.width - 0.5
          const py = (e.clientY - caixa.top) / caixa.height - 0.5
          solX(px * 30)
          solY(py * 22)
          luzX(e.clientX - caixa.left)
          luzY(e.clientY - caixa.top)
          if (!visivel) {
            visivel = true
            gsap.to(luz, { autoAlpha: 1, duration: 0.8 })
          }
        }
        const sair = () => {
          visivel = false
          solX(0)
          solY(0)
          gsap.to(luz, { autoAlpha: 0, duration: 0.8 })
        }
        r.addEventListener('pointermove', mover, { passive: true })
        r.addEventListener('pointerleave', sair)

        const soltarImas = ligarImas(r.querySelectorAll('[data-ima]'), { forca: 0.3 })
        return () => {
          r.removeEventListener('pointermove', mover)
          r.removeEventListener('pointerleave', sair)
          soltarImas()
        }
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} className="hero">
      <div className="hero-lines" aria-hidden="true">
        <LinhasOnduladas side="left" risca />
        <LinhasOnduladas side="right" risca />
      </div>
      <div className="hero-depth" aria-hidden="true">
        {tunel && (
          <Suspense fallback={null}>
            <HeroTunnel images={fotosTunel} />
          </Suspense>
        )}
      </div>
      <span className="hero-luz" aria-hidden="true" />
      <div className="page-frame hero-frame">
        <div className="hero-alvo">
          <div className="hero-center">
            <div className="hero-sol" aria-hidden="true">
              <SimboloSol className="hero-sun" />
            </div>
            <div className="hero-content">
              <span className="hero-kicker">ENERGIA SOLAR, PARCERIAS E IMPACTO SOCIAL</span>
              <h1>
                <span>ENERGIA QUE CONECTA,</span>
                <br />
                <span className="hero-accent">IMPACTO QUE ILUMINA.</span>
              </h1>
              <p>Conectamos empresas e instituições para apoiar projetos de energia solar com acompanhamento e transparência.</p>
              <div className="hero-buttons">
                <Flow href="#como-funciona" magnetico>Conheça o CANOPA</Flow>
                <a className="hero-link" href="#sobre">
                  SAIBA MAIS <span>↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#sobre">
          <span>DESLIZE PARA DESCOBRIR</span>
          <i />
        </a>
      </div>
    </section>
  )
}
