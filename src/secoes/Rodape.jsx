import { useRef } from 'react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import './Rodape.css'

export default function Rodape({ aoAcessar }) {
  const raiz = useRef(null)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const marca = r.querySelector('.footer-brand')

        // o sol sobe atrás do rodapé enquanto ele entra na tela
        gsap.fromTo(
          r.querySelector('.footer-rays'),
          { yPercent: -16, autoAlpha: 0.15 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: r, start: 'top bottom', end: 'top 35%', scrub: 0.6 },
          },
        )

        gsap.from(marca.children, {
          autoAlpha: 0,
          y: 26,
          duration: 1,
          stagger: 0.14,
          scrollTrigger: { trigger: r, start: 'top 78%', once: true },
        })
        gsap.from(r.querySelectorAll('.footer-columns > div'), {
          autoAlpha: 0,
          y: 22,
          duration: 0.9,
          stagger: 0.1,
          delay: 0.35,
          scrollTrigger: { trigger: r.querySelector('.footer-columns'), start: 'top 92%', once: true },
        })
        gsap.from(r.querySelector('.footer-copyright'), {
          autoAlpha: 0,
          duration: 1,
          delay: 0.6,
          scrollTrigger: { trigger: r.querySelector('.footer-columns'), start: 'top 92%', once: true },
        })
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <footer ref={raiz} className="site-footer">
      <div className="footer-rays" aria-hidden="true" />
      <div className="footer-shell">
        <div className="footer-brand">
          <img className="footer-logo" src={`${import.meta.env.BASE_URL}images/canopa-logo-480.webp`} width="480" height="184" alt="CANOPA" />
          <span>CALIBRANDO O IMPACTO, ILUMINANDO O FUTURO</span>
          <p>Conectando pessoas e projetos por um futuro mais solar.</p>
        </div>
        <div className="footer-columns">
          <div>
            <h3>CONHEÇA</h3>
            <a href="#sobre">O projeto</a>
            <a href="#impacto">Impacto pretendido</a>
          </div>
          <div>
            <h3>PARTICIPE</h3>
            <a href="#como-funciona">Como funciona</a>
            <a href="#contato">Fale com a gente</a>
          </div>
          <div>
            <h3>ACESSO</h3>
            <button onClick={aoAcessar}>Acesso administrativo</button>
          </div>
          <div>
            <h3>CANOPA</h3>
            <a href="#inicio">Voltar ao início ↑</a>
          </div>
        </div>
        <p className="footer-copyright">© {new Date().getFullYear()} CANOPA. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
