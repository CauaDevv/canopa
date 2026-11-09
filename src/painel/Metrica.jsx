import { useRef } from 'react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'

/*
  Cartão de métrica (a "stat tile" da skill dataviz: o número é o gráfico). O texto já
  nasce com o valor final; com movimento permitido o número conta de 0 até ele. O
  valor final fica num <span class="sr-only"> para o leitor de tela não ouvir a contagem.
*/
export default function Metrica({ Icone, rotulo, valor, formatar, unidade, nota, destaque = false }) {
  const raiz = useRef(null)
  const numero = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const alvo = numero.current
        const estado = { v: 0 }
        alvo.textContent = formatar(0)
        gsap.to(estado, {
          v: valor,
          duration: 1.5,
          delay: 0.35,
          ease: 'power2.out',
          onUpdate: () => { alvo.textContent = formatar(estado.v) },
          onComplete: () => { alvo.textContent = formatar(valor) },
        })
        return () => { alvo.textContent = formatar(valor) }
      })
    },
    { scope: raiz, dependencies: [valor] },
  )

  return (
    <article ref={raiz} className={'pn-metrica pn-revelar' + (destaque ? ' pn-metrica--ouro' : '')}>
      <header>
        <h3>{rotulo}</h3>
        <span className="pn-metrica-icone" aria-hidden="true"><Icone size={20} strokeWidth={1.8} /></span>
      </header>
      <p className="pn-metrica-valor">
        <span ref={numero} aria-hidden="true">{formatar(valor)}</span>
        <span className="sr-only">{formatar(valor)}{unidade ? ` ${unidade}` : ''}</span>
        {unidade && <small aria-hidden="true">{unidade}</small>}
      </p>
      {nota && <p className="pn-metrica-nota">{nota}</p>}
    </article>
  )
}
