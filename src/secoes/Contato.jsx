import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import FormularioContato from '../components/FormularioContato'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { chamarFormulario } from '../lib/formulario'
import { revelarLinhas } from '../lib/revelar'
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

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/*
  Janela do formulário: NÃO faz parte do fluxo da página, só aparece por cima dela quando
  alguém clica no botão final (ou em um link para o contato). Continua montada depois de
  aberta pela primeira vez, então fechar e reabrir não perde o que foi digitado.
  Cada etapa concluída acende uma parte do símbolo do sol (perfil = horizonte, nome =
  disco, contato = raios, mensagem = haste); o painel só reage ao estado do formulário.
*/
export default function Contato({ aberto, aoFechar }) {
  const raiz = useRef(null)
  const [p, setP] = useState({ perfil: false, nome: false, contato: false, mensagem: false, total: 0 })

  // Esc fecha; Tab não escapa da janela (aria-modal)
  useEffect(() => {
    if (!aberto) return
    const el = raiz.current
    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        aoFechar()
        return
      }
      if (e.key !== 'Tab') return
      const itens = [...el.querySelectorAll(FOCAVEIS)].filter((n) => n.getClientRects().length > 0)
      if (!itens.length) return
      const primeiro = itens[0]
      const ultimo = itens[itens.length - 1]
      const dentro = el.contains(document.activeElement)
      if (e.shiftKey && (!dentro || document.activeElement === primeiro)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (!dentro || document.activeElement === ultimo)) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar])

  // a janela abriu: o formulário acende e o foco vai para o primeiro campo pendente
  useEffect(() => (aberto ? chamarFormulario() : undefined), [aberto])

  // entrada a cada abertura (sem ScrollTrigger: a janela é fixa, não rola com a página)
  useGSAP(
    () => {
      if (!aberto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const $ = (sel) => r.querySelector(sel)
        const painel = $('.contato-painel')
        gsap.from(painel, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' })
        gsap.from($('.contato-painel .section-label i'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, delay: 0.3, ease: 'power3.inOut' })
        revelarLinhas($('.contato-painel h2'), { semScroll: true, atraso: 0.45 })
        gsap.from(painel.querySelectorAll('.contato-painel-in > p, .contato-sol'), { autoAlpha: 0, y: 18, duration: 0.8, delay: 0.8, stagger: 0.12, clearProps: 'transform' })
        // só opacidade (não autoAlpha): visibility:hidden impediria o foco no primeiro campo
        gsap.from(r.querySelectorAll('.cc-reveal'), { opacity: 0, y: 22, duration: 0.8, delay: 0.4, stagger: 0.08, clearProps: 'transform' })
      })
    },
    { scope: raiz, dependencies: [aberto], revertOnUpdate: true },
  )

  return (
    <div ref={raiz} id="contato-janela" className="contato-janela" role="dialog" aria-modal="true" aria-labelledby="contato-titulo" hidden={!aberto} data-lenis-prevent>
      <div className="contato-barra">
        <button type="button" className="contato-fechar" onClick={aoFechar} aria-label="Fechar formulário">
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="contato-grid">
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
    </div>
  )
}
