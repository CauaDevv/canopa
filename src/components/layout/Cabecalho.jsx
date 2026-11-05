import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Flow from '../ui/Flow'
import Logo from '../ui/Logo'
import useSecaoAtiva from '../../hooks/useSecaoAtiva'
import { gsap, MIDIA, useGSAP } from '../../lib/animacao'
import { ligarImas } from '../../lib/interacao'

const LINKS = [
  { href: '#sobre', rotulo: 'Sobre' },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#impacto', rotulo: 'Impacto' },
  { href: '#contato', rotulo: 'Contato' },
]
const HREFS = LINKS.map((l) => l.href)

export default function Cabecalho({ menu, setMenu, aoEntrar }) {
  const raiz = useRef(null)
  const [rolado, setRolado] = useState(false)
  const ativa = useSecaoAtiva(HREFS)

  useEffect(() => {
    let quadro = 0
    const medir = () => {
      quadro = 0
      setRolado(window.scrollY > 80)
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      window.removeEventListener('scroll', aoRolar)
      cancelAnimationFrame(quadro)
    }
  }, [])

  // Esc fecha o menu do celular (teclado precisa de saída)
  useEffect(() => {
    if (!menu) return
    const aoTeclar = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [menu, setMenu])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        // a barra de progresso é a "luz do dia" da página: enche conforme se lê
        gsap.fromTo(
          r.querySelector('.scroll-progress'),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
          },
        )
        // abertura: o cabeçalho desce junto com o nascer do sol do hero
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.logo', { autoAlpha: 0, y: -18, duration: 0.9 }, 0.1)
          .from('.navigation a', { autoAlpha: 0, y: -14, duration: 0.7, stagger: 0.07, clearProps: 'opacity,visibility,transform' }, 0.25)
          .from('.header-actions > *', { autoAlpha: 0, y: -14, duration: 0.7, stagger: 0.08 }, 0.4)
      })

      mm.add(`${MIDIA.movimento} and ${MIDIA.ponteiroFino}`, () => ligarImas(raiz.current.querySelectorAll('[data-ima]'), { forca: 0.28 }))
    },
    { scope: raiz },
  )

  const fechar = () => setMenu(false)

  return (
    <header ref={raiz} className={'header ' + (rolado ? 'is-scrolled' : '')}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="header-inner">
        <Logo />
        <nav className={menu ? 'navigation open' : 'navigation'} aria-label="Navegação principal">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={fechar}
              className={ativa === l.href ? 'is-active' : undefined}
              aria-current={ativa === l.href ? 'location' : undefined}
            >
              {l.rotulo}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="enter" onClick={aoEntrar}>Entrar</button>
          <Flow href="#contato" magnetico>Quero participar</Flow>
        </div>
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menu}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
