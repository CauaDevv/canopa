import { useRef } from 'react'
import { ArrowUpRight, Sun } from 'lucide-react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { acenderPalavras, nascerFoto, parallaxFoto, revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import './Sobre.css'

export default function Sobre() {
  const raiz = useRef(null)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const $ = (sel) => r.querySelector(sel)
        const foto = $('.about-photo')
        const imagem = $('.about-photo img')

        // a foto nasce de baixo para cima e depois desliza dentro da moldura
        nascerFoto(foto, imagem, { inicio: 'top 82%' })
        parallaxFoto(imagem, foto, 6)
        gsap.from('.photo-tag', {
          xPercent: -101,
          duration: 0.9,
          delay: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: foto, start: 'top 82%', once: true },
        })

        revelarRotulos(r)
        revelarLinhas($('h2'), { gatilho: $('.about-copy') })
        acenderPalavras($('.lead'), { gatilho: $('.about-copy'), atraso: 0.45 })
        revelarBlocos(r.querySelectorAll('.about-copy p:not(.lead), .link-arrow'), {
          gatilho: $('.about-copy'),
          atraso: 0.7,
          y: 18,
          stagger: 0.14,
        })
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} id="sobre" className="about section">
      <div className="page-frame content-grid">
        <div className="about-photo">
          <img
            loading="lazy"
            decoding="async"
            src={`${import.meta.env.BASE_URL}images/fotos/paineis-campo.webp`}
            srcSet={`${import.meta.env.BASE_URL}images/fotos/paineis-campo-480.webp 480w, ${import.meta.env.BASE_URL}images/fotos/paineis-campo-800.webp 800w, ${import.meta.env.BASE_URL}images/fotos/paineis-campo.webp 1200w`}
            sizes="(max-width: 900px) 92vw, 46vw"
            width="1200"
            height="798"
            alt="Painéis solares sob o céu"
          />
          <div className="photo-tag">
            <Sun size={21} /> UM FUTURO MAIS SOLAR
          </div>
        </div>
        <div className="about-copy">
          <span className="section-label"><i /> CONHEÇA O CANOPA</span>
          <h2>O QUE É O CANOPA?</h2>
          <p className="lead">Boas parcerias podem levar a energia do sol mais longe.</p>
          <p>O CANOPA é uma proposta de plataforma digital que aproxima empresas patrocinadoras de escolas, ONGs e outras instituições que buscam acesso à energia solar.</p>
          <p>A ideia é reunir informações, documentos e etapas dos projetos em um só lugar, para que todos possam acompanhar o caminho e compreender os resultados.</p>
          <a href="#como-funciona" className="link-arrow">
            ENTENDA COMO FUNCIONA <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  )
}
