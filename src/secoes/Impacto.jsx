import { useRef } from 'react'
import { HandHeart, Leaf, Sun } from 'lucide-react'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { acenderPalavras, desenharIcone, nascerFoto, parallaxFoto, revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import { desenharSol } from '../lib/traco'
import './Impacto.css'

const PONTOS = [
  { Icone: Sun, rotulo: 'ENERGIA RENOVÁVEL' },
  { Icone: Leaf, rotulo: 'RESULTADOS COM CONTEXTO' },
  { Icone: HandHeart, rotulo: 'CONSTRUÍDO EM PARCERIA' },
]

/*
  "O sol nasce para todos": aqui a metáfora do hero volta em escala de seção. A
  foto abre de baixo para cima como um nascer do sol, uma luz dourada sobe pela
  base da imagem presa à rolagem, e o símbolo se desenha sobre ela.
*/
export default function Impacto() {
  const raiz = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const $ = (sel) => r.querySelector(sel)
        const foto = $('.impact-photo')
        const imagem = $('.impact-photo img')
        const copia = $('.impact-copy')

        nascerFoto(foto, imagem, { inicio: 'top 80%', duracao: 1.7 })
        parallaxFoto(imagem, foto, 6)

        // o amanhecer: a luz dourada sobe pela base da foto enquanto a seção cruza a tela
        gsap.fromTo(
          $('.impact-amanhecer'),
          { yPercent: 55, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: foto, start: 'top 85%', end: 'center 45%', scrub: 0.6 },
          },
        )

        // o símbolo nasce quando a foto termina de abrir
        desenharSol($('.impact-photo .brand-mark'), {
          atraso: 0,
          scrollTrigger: { trigger: foto, start: 'top 70%', once: true },
        })

        revelarRotulos(r)
        revelarLinhas($('h2'), { gatilho: copia })
        acenderPalavras($('.lead'), { gatilho: copia, atraso: 0.45 })
        revelarBlocos($('.lead + p'), { gatilho: copia, atraso: 0.8, y: 16 })

        // cada ponto traça sua linha divisória e desenha o ícone, em cascata
        gsap.utils.toArray('.impact-points span', r).forEach((ponto, i) => {
          const gatilho = $('.impact-points')
          const atraso = 0.2 + i * 0.16
          gsap.fromTo(
            ponto,
            { '--linha': 0 },
            { '--linha': 1, duration: 1, delay: atraso, ease: 'power3.inOut', scrollTrigger: { trigger: gatilho, start: 'top 88%', once: true } },
          )
          gsap.from(ponto.querySelector('b'), {
            autoAlpha: 0,
            x: -14,
            duration: 0.8,
            delay: atraso + 0.25,
            scrollTrigger: { trigger: gatilho, start: 'top 88%', once: true },
          })
          desenharIcone(ponto.querySelector('svg'), { gatilho, inicio: 'top 88%', atraso: atraso + 0.15 })
        })
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} id="impacto" className="impact section">
      <div className="page-frame impact-grid">
        <div className="impact-copy">
          <span className="section-label"><i /> ENERGIA QUE GERA IMPACTO</span>
          <h2>
            O SOL NASCE PARA <span className="acento">TODOS.</span>
          </h2>
          <p className="lead">O impacto começa com parcerias e precisa ser acompanhado com clareza.</p>
          <p>
            Projetos viáveis podem ajudar instituições a reduzir despesas com eletricidade e direcionar mais recursos às suas atividades. O CANOPA pretende apresentar dados de geração e estimativas com suas fontes e premissas.
          </p>
          <div className="impact-points">
            {PONTOS.map(({ Icone, rotulo }) => (
              <span key={rotulo}>
                <Icone /> <b>{rotulo}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="impact-photo">
          <img
            loading="lazy"
            decoding="async"
            src={`${import.meta.env.BASE_URL}images/fotos/paineis-aerea.webp`}
            width="1000"
            height="749"
            alt="Painéis solares em uma paisagem aberta"
          />
          <span className="impact-amanhecer" aria-hidden="true" />
          <SimboloSol className="brand-mark" />
        </div>
      </div>
    </section>
  )
}
