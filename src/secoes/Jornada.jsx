import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, ScrollTrigger, useGSAP } from '../lib/animacao'
import { revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import CenaAcompanhamento, { animar as animarAcompanhamento } from './jornada/CenaAcompanhamento'
import CenaInscricao, { animar as animarInscricao } from './jornada/CenaInscricao'
import CenaParceria, { animar as animarParceria } from './jornada/CenaParceria'
import CenaPrestacao, { animar as animarPrestacao } from './jornada/CenaPrestacao'
import { ALTURA_RESERVADA, PALCO } from './jornada/reserva'
import './Jornada.css'

const ETAPAS = [
  {
    numero: '01',
    rotulo: 'Inscrição',
    titulo: 'INSCRIÇÃO',
    texto: 'A instituição apresenta sua necessidade e as informações do projeto.',
    itens: ['Dados da instituição', 'A necessidade de energia', 'As informações do projeto'],
    Cena: CenaInscricao,
    animar: animarInscricao,
  },
  {
    numero: '02',
    rotulo: 'Parceria',
    titulo: 'PARCERIA',
    texto: 'Após avaliação, o projeto pode ser apresentado a potenciais patrocinadores.',
    itens: ['Avaliação do projeto', 'Apresentação a empresas interessadas', 'Acordo entre as partes'],
    Cena: CenaParceria,
    animar: animarParceria,
  },
  {
    numero: '03',
    rotulo: 'Acompanhamento',
    titulo: 'ACOMPANHAMENTO',
    texto: 'Os envolvidos acompanham etapas, atualizações e indicadores disponíveis.',
    itens: ['Etapas e atualizações do projeto', 'Indicadores de geração de energia', 'Informação aberta a todos os envolvidos'],
    Cena: CenaAcompanhamento,
    animar: animarAcompanhamento,
  },
  {
    numero: '04',
    rotulo: 'Prestação de contas',
    titulo: 'PRESTAÇÃO DE CONTAS',
    texto: 'Os resultados chegam organizados em relatórios, para dar clareza a quem apoia e a quem recebe.',
    itens: ['Relatórios com fonte, período e metodologia', 'Estimativas sempre identificadas', 'Prestação de contas para todos'],
    Cena: CenaPrestacao,
    animar: animarPrestacao,
  },
]

/*
  A jornada em slides. O palco fica FIXO na tela (sticky scroll, `position: sticky` do CSS) enquanto a
  rolagem troca de etapa: o texto e a ilustração alternam de lado (texto à esquerda, depois à direita…) e
  cada ilustração é uma pequena animação feita em código (src/secoes/jornada/Cena*.jsx) que toca quando
  o slide aparece. A seção reserva a própria altura em CSS (ver jornada/reserva.js), então o layout é o
  mesmo antes e depois de o JavaScript montar a animação.

  Sem movimento (prefers-reduced-motion) não há palco nem animação: as quatro etapas ficam empilhadas,
  cada uma com a ilustração já completa. A classe `is-palco` é o que liga o modo fixo (CSS + JS).
  Não há "encaixe magnético" na rolagem de propósito (SmoothScroll explica por quê): quem avança é o
  visitante, rolando ou tocando num ponto da trilha.
*/
export default function Jornada() {
  const raiz = useRef(null)
  // a classe nasce no primeiro render: o layout já é o do palco antes do JS montar a animação
  const [palco] = useState(() => typeof window !== 'undefined' && !window.matchMedia(MIDIA.reduzido).matches)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const copia = r.querySelector('.journey-copy')
        const slides = gsap.utils.toArray('.journey-slide', r)
        const textos = slides.map((s) => s.querySelector('.journey-texto'))
        const artes = slides.map((s) => s.querySelector('.journey-arte'))
        const pontos = gsap.utils.toArray('.journey-ponto', r)
        const n = slides.length

        revelarRotulos(r)
        revelarLinhas(copia.querySelector('h2'), { gatilho: copia })

        // as cenas (uma linha do tempo "intro" que conta a história + um "ambiente" que fica em laço)
        const cenas = slides.map((s, i) => ETAPAS[i].animar(s.querySelector('.cena')))
        gsap.set(slides, { autoAlpha: 0 })
        slides.forEach((s) => {
          s.inert = true
          s.setAttribute('aria-hidden', 'true')
        })

        let ativo = -1
        let visivel = false
        const todos = [...slides, ...textos, ...artes]
        // fora da tela as ilustrações dormem: o laço das cenas (nuvens, raios, ondas) não gasta CPU à toa.
        // `paused()` retoma de onde parou, sem reiniciar a história que a pessoa estava vendo.
        function dormir(dorme) {
          if (ativo < 0) return
          cenas[ativo].intro.paused(dorme)
          cenas[ativo].ambiente.paused(dorme)
        }
        function trocar(para, dir) {
          const de = ativo
          ativo = para
          gsap.killTweensOf(todos)
          slides.forEach((s, i) => {
            if (i === para || i === de) return
            gsap.set([s, textos[i], artes[i]], { autoAlpha: 0 })
            cenas[i].intro.pause()
            cenas[i].ambiente.pause()
            s.inert = true
            s.setAttribute('aria-hidden', 'true')
          })
          pontos.forEach((p, i) => p.setAttribute('aria-current', i === para ? 'step' : 'false'))

          if (de >= 0) {
            // quem sai: o texto e a arte escorregam para o lado de onde a pessoa veio
            cenas[de].intro.pause()
            cenas[de].ambiente.pause()
            slides[de].inert = true
            slides[de].setAttribute('aria-hidden', 'true')
            gsap.to(textos[de], { x: -dir * 70, autoAlpha: 0, duration: 0.4, ease: 'power2.in' })
            gsap.to(artes[de], { x: -dir * 50, scale: 0.95, autoAlpha: 0, duration: 0.4, ease: 'power2.in' })
            gsap.set(slides[de], { autoAlpha: 0, delay: 0.45 })
          }

          const espera = de >= 0 ? 0.3 : 0
          slides[para].inert = false
          slides[para].removeAttribute('aria-hidden')
          gsap.set(slides[para], { autoAlpha: 1 })
          gsap.fromTo(textos[para], { x: dir * 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', delay: espera })
          gsap.fromTo(artes[para], { x: dir * 50, scale: 0.95, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: espera })
          // a cena começa a contar a história quando o slide já está chegando
          gsap.delayedCall(espera + 0.2, () => {
            if (ativo !== para) return
            cenas[para].intro.restart()
            cenas[para].ambiente.restart()
            if (!visivel) dormir(true)
          })
        }

        // criado antes dos outros gatilhos: numa rolagem longa (âncora do menu) ele atualiza primeiro
        ScrollTrigger.create({
          trigger: r,
          start: 'top bottom',
          end: 'bottom top',
          onToggle(self) {
            visivel = self.isActive
            dormir(!visivel)
          },
        })

        // o progresso vai de 0 a 1 enquanto o palco está grudado (topo da seção na tela → base da seção na tela).
        // Vai direto na barrinha: uma propriedade CSS escrita na seção invalidaria o estilo de todas as ilustrações
        // (centenas de elementos SVG) a cada quadro da rolagem.
        const barra = r.querySelector('.journey-progresso b')
        ScrollTrigger.create({
          trigger: r,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate(self) {
            barra.style.transform = `scaleX(${self.progress.toFixed(3)})`
            const i = Math.min(n - 1, Math.floor(self.progress * n))
            if (i !== ativo) trocar(i, i >= ativo ? 1 : -1)
          },
        })

        // o primeiro slide já conta a história quando a seção está chegando (antes de fixar)
        ScrollTrigger.create({
          trigger: r,
          start: 'top 75%',
          once: true,
          onEnter: () => ativo < 0 && trocar(0, 1),
        })

        return () => {
          gsap.killTweensOf(todos)
          slides.forEach((s) => {
            s.inert = false
            s.removeAttribute('aria-hidden')
          })
          barra.style.transform = ''
        }
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} id="jornada" className={'journey' + (palco ? ' is-palco' : '')} style={palco ? { '--reserva': ALTURA_RESERVADA } : undefined} aria-labelledby="journey-titulo">
      {/* marcadores invisíveis no meio do trecho de cada slide: os pontos da trilha são âncoras para eles,
          e a rolagem animada fica por conta do SmoothScroll (o relógio do Lenis só acorda por lá) */}
      {palco &&
        ETAPAS.map((e, i) => (
          <span key={e.numero} id={`jornada-etapa-${i + 1}`} className="journey-marcador" style={{ top: `calc((${ALTURA_RESERVADA} - ${PALCO}) * ${(i + 0.5) / ETAPAS.length})` }} />
        ))}
      <div className="journey-palco">
        <div className="page-frame journey-topo">
          <div className="journey-copy">
            <span className="section-label"><i /> A JORNADA DO PROJETO</span>
            <h2 id="journey-titulo">
              DA IDEIA À <span className="acento">PRESTAÇÃO DE CONTAS.</span>
            </h2>
          </div>
          <nav className="journey-trilha" aria-label="Etapas da jornada">
            <ol>
              {ETAPAS.map((e, i) => (
                <li key={e.numero}>
                  <a className="journey-ponto" href={`#jornada-etapa-${i + 1}`} aria-current={i === 0 ? 'step' : 'false'}>
                    <b>{e.numero}</b>
                    <span>{e.rotulo}</span>
                  </a>
                </li>
              ))}
            </ol>
            <i className="journey-progresso" aria-hidden="true"><b /></i>
          </nav>
        </div>

        <div className="page-frame journey-slides">
          {ETAPAS.map((e, i) => (
            <article key={e.numero} className={'journey-slide' + (i % 2 ? ' inverso' : '')} aria-labelledby={`journey-${e.numero}`}>
              <div className="journey-texto">
                <span className="journey-numero">
                  {e.numero}
                  <small>/ 0{ETAPAS.length}</small>
                </span>
                <h3 id={`journey-${e.numero}`}>{e.titulo}</h3>
                <p>{e.texto}</p>
                <ul>
                  {e.itens.map((item) => (
                    <li key={item}>
                      <Check size={16} strokeWidth={2.6} aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="journey-arte">
                {/* as ilustrações (centenas de elementos SVG) só são montadas quando a seção está perto; até lá o quadro
                    já ocupa o lugar delas (proporção fixa), então nada se mexe */}
                <div className="journey-moldura">{perto ? <e.Cena /> : null}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
