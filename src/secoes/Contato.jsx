import { useRef } from 'react'
import { ContactForm } from '../components/Accounts'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import { desenharSol } from '../lib/traco'
import './Contato.css'

/*
  O fechamento: a faixa de convite abre da esquerda para a direita com uma
  varredura de luz, o símbolo se desenha dentro dela, e os campos do formulário
  entram em sequência. Nada se mexe no formulário enquanto a pessoa digita.
*/
export default function Contato() {
  const raiz = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const $ = (sel) => r.querySelector(sel)
        const faixa = $('.contact-band')
        const form = $('.form-area')

        revelarRotulos(r)
        revelarLinhas($('.contact-title h2'), { gatilho: $('.contact-title') })

        gsap
          .timeline({ scrollTrigger: { trigger: faixa, start: 'top 82%', once: true } })
          .from(faixa, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
          .from(faixa.querySelectorAll('div > *, a'), { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.7)
          .fromTo($('.contact-brilho'), { xPercent: -120 }, { xPercent: 120, duration: 1.6, ease: 'power2.inOut' }, 0.75)
        desenharSol($('.contact-band .brand-mark'), {
          atraso: 0.3,
          scrollTrigger: { trigger: faixa, start: 'top 82%', once: true },
        })

        revelarLinhas($('.form-area h2'), { gatilho: form })
        revelarBlocos($('.form-area > div > p'), { gatilho: form, atraso: 0.3, y: 14 })
        revelarBlocos(r.querySelectorAll('form label, form button'), {
          gatilho: $('form'),
          inicio: 'top 88%',
          atraso: 0.2,
          y: 26,
          stagger: 0.09,
        })
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} id="contato" className="contact">
      <div className="page-frame">
        <div className="contact-title">
          <span className="section-label"><i /> VAMOS CONVERSAR</span>
          <h2>CONTATO</h2>
        </div>
        <div className="contact-band">
          <span className="contact-brilho" aria-hidden="true" />
          <SimboloSol className="brand-mark" />
          <div>
            <span>VAMOS COMEÇAR?</span>
            <h3>O FUTURO PODE SER MAIS SOLAR.</h3>
            <p>Conte se você representa uma empresa, instituição ou possível parceiro e como gostaria de participar.</p>
          </div>
          <a href="#formulario">PREENCHER FORMULÁRIO ↗</a>
        </div>
        <div className="form-area" id="formulario">
          <div>
            <h2>FORMULÁRIO</h2>
            <p>O CANOPA é um projeto em desenvolvimento. Deixe sua mensagem para conhecer a proposta ou demonstrar interesse.</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
