import { useRef, useState } from 'react'
import FormularioContato from '../components/FormularioContato'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import './Contato.css'

const FALTAM = {
  perfil: 'seu perfil',
  nome: 'seu nome',
  contato: 'e-mail e telefone',
  mensagem: 'a mensagem',
}

function textoDoStatus(p) {
  if (p.enviado) return 'Mensagem enviada. O sol nasceu!'
  if (p.total === 4) return 'Tudo pronto. É só enviar!'
  if (p.total === 0) return 'Escolha seu perfil para o sol começar a nascer.'
  const faltam = Object.keys(FALTAM).filter((k) => !p[k]).map((k) => FALTAM[k])
  return `Falta: ${faltam.join(', ')}.`
}

/*
  Fechamento da página. O formulário e o painel conversam: cada etapa concluída
  acende uma parte do símbolo do sol (perfil = horizonte, nome = disco, contato =
  raios, mensagem = haste). O painel é só reação ao estado — quem manda é o formulário.
*/
export default function Contato() {
  const raiz = useRef(null)
  const [p, setP] = useState({ perfil: false, nome: false, contato: false, mensagem: false, total: 0 })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ movimento: MIDIA.movimento, desktop: MIDIA.desktop }, (ctx) => {
        if (!ctx.conditions.movimento) return
        const { desktop } = ctx.conditions
        const r = raiz.current
        const $ = (sel) => r.querySelector(sel)
        const grade = $('.contato-grid')
        const painel = $('.contato-painel')
        const cartao = $('.cc')
        const gatilho = { trigger: grade, start: 'top 80%', once: true }

        // o bloco inteiro abre da esquerda para a direita; o cartão vem logo atrás
        gsap.from(painel, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath', scrollTrigger: gatilho })
        // só no desktop o cartão entra de lado: no celular um deslocamento horizontal, mesmo antes de rolar até
        // ele, alarga a viewport do navegador (a página inteira "encolhe")
        gsap.from(cartao, { autoAlpha: 0, x: desktop ? 50 : 0, y: desktop ? 0 : 40, duration: 1.1, delay: 0.25, clearProps: 'transform', scrollTrigger: gatilho })

        revelarRotulos(painel)
        revelarLinhas($('.contato-painel h2'), { gatilho: grade, atraso: 0.4 })
        revelarBlocos(painel.querySelectorAll('.contato-painel-in > p, .contato-sol'), { gatilho: grade, atraso: 0.8, y: 18, stagger: 0.12 })
        revelarBlocos(r.querySelectorAll('.cc-reveal'), { gatilho: cartao, inicio: 'top 82%', atraso: 0.5, y: 22, stagger: 0.08 })
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} id="contato" className="contact" aria-labelledby="contato-titulo">
      <div className="page-frame contato-grid">
        <aside className="contato-painel">
          <div className="contato-raios" aria-hidden="true" />
          <div className="contato-painel-in">
            <span className="section-label"><i /> VAMOS CONVERSAR</span>
            <h2 id="contato-titulo">
              O FUTURO PODE SER <span className="acento">MAIS SOLAR.</span>
            </h2>
            <p>Conte se você representa uma empresa, instituição ou possível parceiro e como gostaria de participar.</p>
            <div
              className="contato-sol"
              data-g0={+p.perfil}
              data-g1={+p.nome}
              data-g2={+p.contato}
              data-g3={+p.mensagem}
              data-completo={+(p.total === 4)}
            >
              <SimboloSol />
            </div>
            <p className="contato-status" aria-live="polite">{textoDoStatus(p)}</p>
          </div>
        </aside>
        <FormularioContato onProgresso={setP} />
      </div>
    </section>
  )
}
