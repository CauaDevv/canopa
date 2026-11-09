import { useRef } from 'react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { ligarSpotlight } from '../lib/interacao'
import { parallaxFoto, revelarBlocos, revelarRotulos } from '../lib/revelar'
import './DuasPontas.css'

const CARTOES = [
  {
    rotulo: '01 / PARA EMPRESAS',
    titulo: ['APOIE PROJETOS', 'COM PROPÓSITO.'],
    texto: 'Conheça iniciativas que buscam apoio e acompanhe suas etapas e informações de impacto.',
    foto: 'paineis-campo',
    largura: 1200,
    maior: 1200,
    altura: 798,
    alt: 'Painéis solares',
  },
  {
    rotulo: '02 / PARA INSTITUIÇÕES',
    titulo: ['MAIS ESPAÇO PARA', 'FAZER A DIFERENÇA.'],
    texto: 'Escolas e ONGs podem apresentar suas necessidades e buscar parceiros para projetos de energia solar.',
    foto: 'paineis-aerea',
    largura: 1000,
    maior: 1000,
    altura: 749,
    alt: 'Paisagem com painéis solares',
  },
]

/*
  "Duas pontas, um propósito": o título se parte em duas metades que chegam de
  lados opostos e se encontram no centro, presas à rolagem; os dois cartões
  repetem o gesto, cada um vindo do seu lado. A forma conta a ideia.
*/
export default function DuasPontas() {
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
        const cartoes = gsap.utils.toArray('.showcase-card', r)
        const cabecalho = r.querySelector('.section-heading')
        const grade = r.querySelector('.showcase-grid')

        revelarRotulos(r)
        revelarBlocos(cabecalho.querySelector('p'), { gatilho: cabecalho, atraso: 0.2, y: 16 })

        // as duas metades do título convergem enquanto a seção sobe até a leitura
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: cabecalho, start: 'top 92%', end: 'top 48%', scrub: 0.6 },
          })
          .from('.ponta--a', { xPercent: desktop ? -28 : -16, autoAlpha: 0 }, 0)
          .from('.ponta--b', { xPercent: desktop ? 28 : 16, autoAlpha: 0 }, 0)

        cartoes.forEach((cartao, i) => {
          const moldura = cartao.querySelector('.showcase-foto')
          const foto = moldura.querySelector('img')
          const lado = i === 0 ? -1 : 1
          // desktop: lado a lado, cada um vem do seu extremo; mobile: empilhados, cada um na sua vez
          const gatilho = desktop ? grade : cartao
          gsap
            .timeline({ scrollTrigger: { trigger: gatilho, start: 'top 82%', once: true } })
            .from(cartao, { x: desktop ? lado * 90 : 0, y: desktop ? 0 : 50, autoAlpha: 0, duration: 1.1, ease: 'power3.out' }, 0)
            .from(moldura, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' }, 0.15)
            .from(foto, { scale: 1.25, duration: 1.5, ease: 'power2.out' }, 0.15)
            .from(
              cartao.querySelectorAll('.showcase-texto > *'),
              { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1 },
              0.65,
            )
          parallaxFoto(foto, moldura, 5)
        })
      })

      mm.add(`${MIDIA.movimento} and ${MIDIA.ponteiroFino}`, () =>
        ligarSpotlight(raiz.current.querySelectorAll('.showcase-card')),
      )
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} className="showcase section">
      <div className="page-frame showcase-inner">
        <div className="section-heading">
          <span className="section-label"><i /> ENERGIA QUE FAZ A DIFERENÇA</span>
          <h2>
            <span className="ponta ponta--a">DUAS PONTAS.</span> <span className="ponta ponta--b">UM PROPÓSITO.</span>
          </h2>
          <p>Empresas e instituições têm necessidades diferentes. O CANOPA quer aproximá-las em torno de um objetivo comum.</p>
        </div>
        <div className="showcase-grid">
          {CARTOES.map((c) => (
            <article key={c.rotulo} className="showcase-card spot">
              <div className="showcase-foto">
                <img
                  loading="lazy"
                  decoding="async"
                  src={`${import.meta.env.BASE_URL}images/fotos/${c.foto}.webp`}
                  srcSet={`${import.meta.env.BASE_URL}images/fotos/${c.foto}-480.webp 480w, ${import.meta.env.BASE_URL}images/fotos/${c.foto}-800.webp 800w, ${import.meta.env.BASE_URL}images/fotos/${c.foto}.webp ${c.maior}w`}
                  sizes="(max-width: 700px) 92vw, 44vw"
                  width={c.largura}
                  height={c.altura}
                  alt={c.alt}
                />
              </div>
              <div className="showcase-texto">
                <span>{c.rotulo}</span>
                <h3>
                  {c.titulo[0]}
                  <br />
                  {c.titulo[1]}
                </h3>
                <p>{c.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
