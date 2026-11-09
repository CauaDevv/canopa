import { useMemo, useRef, useState } from 'react'
import { Leaf } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { decimal, moeda, percentual } from '../lib/formatos'

// geometria (viewBox 220): anel de 26 de espessura; vão de 3 unidades entre fatias
const C = 110
const R = 82
const VAO = 3 / R

function arco(a0, a1) {
  const p = (a) => [C + R * Math.sin(a), C - R * Math.cos(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

/*
  Rosca de "para onde vai o investimento". Decisões (skill dataviz):
  - até 3 partes, a maior começa às 12h; a cor segue a categoria, não a posição;
  - a cor nunca fica sozinha: a legenda ao lado lista nome, valor e % (é também a
    alternativa em tabela para leitor de tela e para quem não distingue as cores);
  - o valor da parte aparece no centro ao passar o mouse ou focar na legenda.
*/
export default function RoscaInvestimento({ dados }) {
  const raiz = useRef(null)
  const [ativo, setAtivo] = useState(null)

  const total = useMemo(() => dados.reduce((s, d) => s + d.valor, 0), [dados])
  const fatias = useMemo(() => {
    let acumulado = 0
    return dados.map((d) => {
      const fracao = d.valor / total
      const a0 = acumulado * 2 * Math.PI + VAO / 2
      const a1 = (acumulado + fracao) * 2 * Math.PI - VAO / 2
      acumulado += fracao
      return { ...d, fracao, caminho: arco(a0, a1) }
    })
  }, [dados, total])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('.pn-fatia'), {
          drawSVG: '0%',
          duration: 1.3,
          delay: 0.4,
          ease: 'power2.inOut',
          stagger: 0.22,
          clearProps: 'strokeDasharray,strokeDashoffset',
        })
      })
    },
    { scope: raiz },
  )

  const sel = fatias.find((f) => f.tipo === ativo)
  const descricao = fatias.map((f) => `${f.rotulo} ${percentual(f.fracao * 100)}`).join(', ')

  return (
    <section ref={raiz} className="pn-cartao pn-rosca pn-revelar" aria-labelledby="pn-rosca-titulo">
      <header className="pn-cartao-topo">
        <div>
          <h2 id="pn-rosca-titulo">Painel de impacto</h2>
          <p>Investimento por tipo de beneficiário</p>
        </div>
        <Leaf size={20} aria-hidden="true" className="pn-cartao-icone" />
      </header>

      <div className="pn-rosca-corpo">
        <div className="pn-rosca-grafico">
          <svg viewBox="0 0 220 220" role="img" aria-label={`Investimento por tipo de beneficiário: ${descricao}.`}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="#e6f1f0" strokeWidth="26" />
            {fatias.map((f) => (
              <path
                key={f.tipo}
                className="pn-fatia"
                d={f.caminho}
                fill="none"
                stroke={f.cor}
                strokeWidth={ativo === f.tipo ? 31 : 26}
                style={{ opacity: ativo && ativo !== f.tipo ? 0.32 : 1 }}
                onPointerEnter={() => setAtivo(f.tipo)}
                onPointerLeave={() => setAtivo(null)}
              />
            ))}
          </svg>
          <div className="pn-rosca-centro" aria-live="polite">
            {sel ? (
              <>
                <small>{sel.rotulo}</small>
                <strong>{moeda(sel.valor)}</strong>
                <span>{percentual(sel.fracao * 100)} do total</span>
              </>
            ) : (
              <>
                <small>Total investido</small>
                <strong>{moeda(total)}</strong>
                <span>{decimal(dados.length, 0)} tipos de beneficiário</span>
              </>
            )}
          </div>
        </div>

        <ul className="pn-legenda">
          {fatias.map((f) => (
            <li key={f.tipo}>
              <button
                type="button"
                className={ativo === f.tipo ? 'ativo' : undefined}
                onPointerEnter={() => setAtivo(f.tipo)}
                onPointerLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(f.tipo)}
                onBlur={() => setAtivo(null)}
              >
                <i style={{ background: f.cor }} aria-hidden="true" />
                <span className="pn-legenda-nome">{f.rotulo}</span>
                <span className="pn-legenda-valor">{moeda(f.valor)}</span>
                <span className="pn-legenda-pct">{percentual(f.fracao * 100)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
