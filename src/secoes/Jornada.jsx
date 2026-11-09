import { useRef } from 'react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, ScrollTrigger, useGSAP } from '../lib/animacao'
import { revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import './Jornada.css'

const ETAPAS = [
  { numero: '01', titulo: 'INSCRIÇÃO', texto: 'A instituição apresenta sua necessidade e as informações do projeto.' },
  { numero: '02', titulo: 'PARCERIA', texto: 'Após avaliação, o projeto pode ser apresentado a potenciais patrocinadores.' },
  { numero: '03', titulo: 'ACOMPANHAMENTO', texto: 'Os envolvidos acompanham etapas, atualizações e indicadores disponíveis.' },
]

/*
  A jornada é um caminho, então ela é desenhada como um: um fio de luz desce pelo
  trilho conforme a pessoa rola, e cada etapa acende quando o fio chega nela.
  O estado "apagado" nasce no JavaScript (classe `is-apagado`); com movimento
  reduzido, ou sem JS, as três etapas já estão acesas e o fio inteiro.
*/
export default function Jornada() {
  const raiz = useRef(null)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const trilho = r.querySelector('.journey-track')
        const etapas = gsap.utils.toArray('.journey-track article', r)
        const copia = r.querySelector('.journey-copy')

        revelarRotulos(r)
        revelarLinhas(copia.querySelector('h2'), { gatilho: copia })
        revelarBlocos(copia.querySelector('p'), { gatilho: copia, atraso: 0.5, y: 16 })

        // o fio enche com a rolagem; a cabeça dele fica perto de 63% da altura da tela
        gsap.fromTo(
          r.querySelector('.journey-fio i'),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: trilho, start: 'top 66%', end: 'bottom 60%', scrub: 0.4 },
          },
        )

        etapas.forEach((etapa) => {
          etapa.classList.add('is-apagado')
          ScrollTrigger.create({
            trigger: etapa,
            start: 'top 64%',
            onEnter: () => {
              etapa.classList.remove('is-apagado')
              etapa.classList.add('is-aceso')
            },
            onLeaveBack: () => {
              etapa.classList.add('is-apagado')
              etapa.classList.remove('is-aceso')
            },
          })
        })

        return () => etapas.forEach((etapa) => etapa.classList.remove('is-apagado', 'is-aceso'))
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} className="journey">
      <div className="page-frame journey-inner">
        <div className="journey-copy">
          <span className="section-label"><i /> A JORNADA DO PROJETO</span>
          <h2>
            DA IDEIA À<br />
            <span className="acento">PRESTAÇÃO DE CONTAS.</span>
          </h2>
          <p>Uma visão do caminho que o CANOPA pretende organizar, da inscrição ao acompanhamento dos resultados.</p>
        </div>
        <div className="journey-track">
          <span className="journey-fio" aria-hidden="true"><i /></span>
          {ETAPAS.map((e) => (
            <article key={e.numero}>
              <span>{e.numero}</span>
              <h3>{e.titulo}</h3>
              <p>{e.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
