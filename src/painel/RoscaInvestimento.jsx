import { useCallback, useMemo, useRef, useState } from 'react'
import { Leaf } from 'lucide-react'
import useToqueFora from '../hooks/useToqueFora'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { decimal, moeda, percentual } from '../lib/formatos'

// geometria (viewBox 220): anel de 26 de espessura; vão de 3 unidades entre fatias
const C = 110
const R = 82
const VAO = 3 / R
const METADE = 13 // metade da espessura do anel
const FOLGA_TOQUE = 5 // o dedo é impreciso: aceita um pouco além do anel, mas nunca o miolo nem a área de fora

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
  const svg = useRef(null)
  const teclado = useRef(false)
  const [ativo, setAtivo] = useState(null)
  const limpar = useCallback(() => setAtivo(null), [])
  useToqueFora(raiz, ativo, limpar)

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

  /*
    Qual fatia está sob o ponto? Calculado pela geometria (distância ao centro e ângulo desde as
    12h) em vez de depender de qual <path> o navegador achou: no toque, o alvo "fatia" pegava o
    que estava ao redor e o miolo. Fora do anel não é nenhuma fatia (e toque ali limpa a seleção).
  */
  const fatiaNoPonto = (e, folga = 0) => {
    const caixa = svg.current.getBoundingClientRect()
    const k = 220 / caixa.width
    const x = (e.clientX - caixa.left) * k - C
    const y = (e.clientY - caixa.top) * k - C
    if (Math.abs(Math.hypot(x, y) - R) > METADE + folga) return null
    const angulo = ((Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)
    let acumulado = 0
    for (const f of fatias) {
      acumulado += f.fracao
      if (angulo <= acumulado) return f.tipo
    }
    return fatias[fatias.length - 1].tipo
  }
  const aoMover = (e) => e.pointerType === 'mouse' && setAtivo(fatiaNoPonto(e))
  const aoSoltar = (e) => {
    if (e.pointerType === 'mouse') return // o mouse já selecionou por hover
    const tipo = fatiaNoPonto(e, FOLGA_TOQUE)
    setAtivo((atual) => (tipo && tipo !== atual ? tipo : null)) // tocar de novo na mesma fatia desmarca
  }
  const aoAlternar = (tipo) => (e) => {
    if (e.pointerType === 'mouse') return
    setAtivo((atual) => (atual === tipo ? null : tipo))
  }

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

      <div className="pn-rosca-corpo" onPointerUp={(e) => e.pointerType !== 'mouse' && !e.target.closest('svg, button') && setAtivo(null)}>
        <div className="pn-rosca-grafico">
          <svg ref={svg} viewBox="0 0 220 220" role="img" onPointerMove={aoMover} onPointerLeave={(e) => e.pointerType === 'mouse' && setAtivo(null)} onPointerUp={aoSoltar} aria-label={`Investimento por tipo de beneficiário: ${descricao}.`}>
            <circle className="pn-rosca-trilho" cx={C} cy={C} r={R} />
            {fatias.map((f) => (
              <path
                key={f.tipo}
                className="pn-fatia"
                d={f.caminho}
                fill="none"
                stroke={f.cor}
                strokeWidth={ativo === f.tipo ? 31 : 26}
                style={{ opacity: ativo && ativo !== f.tipo ? 0.32 : 1 }}
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
                aria-pressed={ativo === f.tipo}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setAtivo(f.tipo)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setAtivo(null)}
                onPointerUp={aoAlternar(f.tipo)}
                onFocus={(e) => {
                  // só o foco de teclado seleciona; o foco que o toque dá ao botão não conta
                  if (e.currentTarget.matches(':focus-visible')) {
                    teclado.current = true
                    setAtivo(f.tipo)
                  }
                }}
                onBlur={() => {
                  if (teclado.current) {
                    teclado.current = false
                    setAtivo(null)
                  }
                }}
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
