import { useRef } from 'react'
import { HandHeart, Leaf, Sun } from 'lucide-react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { ligarSpotlight } from '../lib/interacao'
import { desenharIcone, revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import './ComoFunciona.css'

const PASSOS = [
  { numero: '01', Icone: HandHeart, titulo: ['CADASTRO E', 'AVALIAÇÃO'], texto: 'Instituições apresentam suas necessidades e documentos para análise.' },
  { numero: '02', Icone: Sun, titulo: ['CONEXÃO COM', 'PATROCINADORES'], texto: 'Empresas podem conhecer oportunidades aprovadas e demonstrar interesse em apoiá-las.' },
  { numero: '03', Icone: Leaf, titulo: ['ACOMPANHAMENTO', 'DOS PROJETOS'], texto: 'A proposta inclui atualizações, indicadores e relatórios para dar visibilidade ao andamento.' },
]

export default function ComoFunciona() {
  const raiz = useRef(null)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()

      mm.add({ movimento: MIDIA.movimento, desktop: MIDIA.desktop }, (ctx) => {
        if (!ctx.conditions.movimento) return
        const { desktop } = ctx.conditions
        const r = raiz.current
        const cabecalho = r.querySelector('.section-heading')
        const grade = r.querySelector('.steps')
        const passos = gsap.utils.toArray('.step', r)

        revelarRotulos(r)
        revelarLinhas(cabecalho.querySelector('h2'), { gatilho: cabecalho })
        revelarBlocos(cabecalho.querySelector('p'), { gatilho: cabecalho, atraso: 0.35, y: 16 })

        // os raios de fundo giram devagar presos à rolagem: o sol atravessa a seção
        gsap.fromTo(
          r.querySelector('.process-raios'),
          { rotation: -14 },
          {
            rotation: 26,
            ease: 'none',
            scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )

        // cada passo abre como uma cortina de cima para baixo; o ícone se desenha logo depois
        passos.forEach((passo, i) => {
          const gatilho = desktop ? grade : passo
          const atraso = desktop ? i * 0.2 : 0
          gsap
            .timeline({ delay: atraso, scrollTrigger: { trigger: gatilho, start: 'top 80%', once: true } })
            .from(passo, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
            .from(passo.querySelectorAll('.number, h3, p'), { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.09 }, 0.45)
          desenharIcone(passo.querySelector('svg'), { gatilho, atraso: atraso + 0.5 })
        })

        revelarBlocos(r.querySelector('.process-note'), { gatilho: grade, atraso: 0.9, y: 10, inicio: 'top 75%' })
      })

      mm.add(`${MIDIA.movimento} and ${MIDIA.ponteiroFino}`, () =>
        ligarSpotlight(raiz.current.querySelectorAll('.step')),
      )
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} id="como-funciona" className="process section">
      <div className="process-raios" aria-hidden="true" />
      <div className="page-frame process-inner">
        <div className="section-heading">
          <span className="section-label"><i /> CONEXÃO COM TRANSPARÊNCIA</span>
          <h2>COMO FUNCIONA?</h2>
          <p>A plataforma está em desenvolvimento para apoiar cada etapa dessa jornada.</p>
        </div>
        <div className="steps">
          {PASSOS.map(({ numero, Icone, titulo, texto }) => (
            <article key={numero} className="step spot">
              <span className="number">{numero}</span>
              <Icone />
              <h3>
                {titulo[0]}
                <br />
                {titulo[1]}
              </h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
        <p className="process-note">
          A seleção, a viabilidade técnica e a execução dependem de avaliação, recursos, parceiros e das condições de cada projeto.
        </p>
      </div>
    </section>
  )
}
