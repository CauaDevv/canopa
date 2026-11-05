import { useRef } from 'react'
import { HandHeart, Leaf, Sun } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { ligarSpotlight, ligarTilt } from '../lib/interacao'
import { desenharIcone, revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import './Confianca.css'

const RECURSOS = [
  { Icone: Sun, titulo: 'ETAPAS DO PROJETO', texto: 'Consulte o andamento e as atualizações de cada iniciativa.' },
  { Icone: HandHeart, titulo: 'INDICADORES CLAROS', texto: 'Dados disponíveis e estimativas identificadas por fonte, período e metodologia.' },
  { Icone: Leaf, titulo: 'RELATÓRIOS', texto: 'Informações organizadas para apoiar o acompanhamento e a prestação de contas.' },
]

export default function Confianca() {
  const raiz = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add({ movimento: MIDIA.movimento, desktop: MIDIA.desktop }, (ctx) => {
        if (!ctx.conditions.movimento) return
        const { desktop } = ctx.conditions
        const r = raiz.current
        const cabecalho = r.querySelector('.section-heading')
        const grade = r.querySelector('.resources-grid')
        const itens = gsap.utils.toArray('.recurso', r)

        revelarRotulos(r)
        revelarLinhas(cabecalho.querySelector('h2'), { gatilho: cabecalho })
        revelarBlocos(cabecalho.querySelector('p'), { gatilho: cabecalho, atraso: 0.35, y: 16 })

        // os cartões "viram" para a frente, como folhas de um relatório sendo abertas
        itens.forEach((item, i) => {
          const gatilho = desktop ? grade : item
          const atraso = desktop ? i * 0.15 : 0
          gsap.from(item, {
            rotationX: 24,
            y: 64,
            autoAlpha: 0,
            transformOrigin: '50% 100%',
            transformPerspective: 1100,
            duration: 1.15,
            delay: atraso,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: gatilho, start: 'top 84%', once: true },
          })
          desenharIcone(item.querySelector('svg'), { gatilho, inicio: 'top 84%', atraso: atraso + 0.4 })
        })
      })

      mm.add(`${MIDIA.movimento} and ${MIDIA.ponteiroFino}`, () => {
        const cartoes = raiz.current.querySelectorAll('.recurso > article')
        const soltarTilt = ligarTilt(cartoes, { max: 4.5 })
        const soltarSpot = ligarSpotlight(cartoes)
        return () => {
          soltarTilt()
          soltarSpot()
        }
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} className="resources">
      <div className="page-frame resources-inner">
        <div className="section-heading">
          <span className="section-label"><i /> ACOMPANHAR É PARTE DO CAMINHO</span>
          <h2>
            INFORMAÇÃO PARA <span className="acento">GERAR CONFIANÇA.</span>
          </h2>
          <p>O protótipo está sendo pensado para reunir informações que ajudem cada participante a entender o projeto.</p>
        </div>
        <div className="resources-grid">
          {RECURSOS.map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="recurso">
              <article className="spot">
                <Icone />
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
