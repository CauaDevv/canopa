import { useRef } from 'react'
import SimboloSol from '../components/ui/SimboloSol'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, ScrollTrigger, useGSAP } from '../lib/animacao'
import { rolagem } from '../lib/rolagem'
import './Faixa.css'

/*
  Um item é o lema da marca + um sol. O trilho tem DUAS metades idênticas e anda
  exatamente metade da largura: ao completar, o desenho é igual ao do início e o
  laco não tem emenda. Cada metade precisa ser mais larga que a tela (ultrawide
  de 3440px): 6 itens de ~900px passam de 5000px.
*/
const ITENS_POR_METADE = 6
const metade = Array.from({ length: ITENS_POR_METADE })

function Trilho() {
  return (
    <div className="faixa__trilho">
      {[0, 1].map((m) => (
        <div key={m} className="faixa__metade">
          {metade.map((_, i) => (
            <span key={i} className="faixa__item">
              CALIBRANDO O IMPACTO <SimboloSol className="faixa__sol" /> ILUMINANDO O FUTURO <SimboloSol className="faixa__sol" />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/*
  Duas fitas cruzando em sentidos opostos entre a informação e o contato — o
  "convite" antes do formulário. A velocidade de cada uma acompanha o gesto de
  rolar (Lenis) e a fita se inclina na direção do movimento; parada, ela
  assenta no ritmo base. Pausa fora da tela. Com movimento reduzido ficam
  estáticas, só como faixa de marca.
*/
export default function Faixa() {
  const raiz = useRef(null)
  // a animação só é montada quando a seção chega perto da tela (ver useQuandoPerto)
  const perto = useQuandoPerto(raiz)

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const r = raiz.current
        const fitas = gsap.utils.toArray('.faixa', r)
        const trilhos = gsap.utils.toArray('.faixa__trilho', r)

        // entram de lados opostos e se assentam
        fitas.forEach((fita, i) => {
          gsap.from(fita, {
            xPercent: i === 0 ? -110 : 110,
            duration: 1.4,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: r, start: 'top 85%', once: true },
          })
        })

        // laco: a 1ª anda para a esquerda, a 2ª para a direita
        const lacos = trilhos.map((trilho, i) =>
          gsap.fromTo(
            trilho,
            { xPercent: i === 0 ? 0 : -50 },
            { xPercent: i === 0 ? -50 : 0, duration: 42, ease: 'none', repeat: -1, paused: true },
          ),
        )
        const direcao = [1, -1]
        const inclinar = fitas.map((fita) => gsap.quickTo(fita, 'skewX', { duration: 0.5, ease: 'power3.out' }))

        let escala = [1, 1]
        const aoTique = () => {
          // a velocidade do Lenis decai sozinha quando a rolagem para
          rolagem.velocidade *= 0.92
          const v = rolagem.velocidade
          const reforco = Math.min(Math.abs(v) * 0.12, 6)
          lacos.forEach((laco, i) => {
            const alvo = 1 + reforco
            escala[i] += (alvo - escala[i]) * 0.1
            laco.timeScale(escala[i])
          })
          const giro = gsap.utils.clamp(-7, 7, v * -0.28)
          inclinar.forEach((ir, i) => ir(giro * direcao[i]))
        }

        const gatilho = ScrollTrigger.create({
          trigger: r,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            lacos.forEach((laco) => (self.isActive ? laco.play() : laco.pause()))
            if (self.isActive) gsap.ticker.add(aoTique)
            else gsap.ticker.remove(aoTique)
          },
        })

        return () => {
          gsap.ticker.remove(aoTique)
          gatilho.kill()
          lacos.forEach((laco) => laco.kill())
        }
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <div ref={raiz} className="faixas" aria-hidden="true">
      <div className="faixa faixa--cheia">
        <Trilho />
      </div>
      <div className="faixa faixa--contorno">
        <Trilho />
      </div>
    </div>
  )
}
