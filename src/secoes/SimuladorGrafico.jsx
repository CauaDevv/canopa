import { useId, useLayoutEffect, useRef, useState } from 'react'
import { PREMISSAS, compacto, numero } from '../lib/simulador'

const ANOS = PREMISSAS.anos
const MARGEM = { e: 46, d: 12, t: 12, b: 26 }
const TICKS_X = [0, 5, 10, 15, 20, 25]
const limitar = (v, min, max) => Math.min(max, Math.max(min, v))

/*
  Economia acumulada ao longo dos anos (uma série só: área + linha), desenhada em
  pixels reais para o texto não encolher no celular. Decisões (skill dataviz):
  - uma série não leva legenda: o título do cartão diz o que é; a linha tracejada
    é o investimento no sistema e o ponto marca onde a economia o alcança;
  - rótulos em tinta de texto, nunca na cor da série; a cor fica nas marcas;
  - hover/foco: guia vertical que gruda no ano mais próximo + painel com o valor;
    com teclado, setas percorrem os anos; a tabela completa fica em "Ver tabela".
  `v` é a lista animada [total, custo, escala, retorno, ...acumulado]; `alvo` é o
  resultado final (rótulos do eixo e leitura do painel não oscilam durante a rolagem).
*/
export default function SimuladorGrafico({ v, alvo }) {
  const [, custo, escala, retorno, ...acumulado] = v
  const caixa = useRef(null)
  const [largura, setLargura] = useState(480)
  const [ano, setAno] = useState(null)
  const [teclado, setTeclado] = useState(false)
  const gradiente = useId()

  useLayoutEffect(() => {
    const el = caixa.current
    const medir = () => setLargura(Math.round(el.getBoundingClientRect().width) || 480)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  const altura = largura < 420 ? 176 : 200
  const base = altura - MARGEM.b
  const x = (i) => MARGEM.e + (i / ANOS) * (largura - MARGEM.e - MARGEM.d)
  const y = (valor) => base - (valor / escala) * (base - MARGEM.t)

  const linha = acumulado.map((valor, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(valor).toFixed(1)}`).join('')
  const area = `${linha}L${x(ANOS).toFixed(1)} ${base}L${x(0).toFixed(1)} ${base}Z`
  const ticksY = [0, alvo.escala / 2, alvo.escala]
  const xMarca = x(retorno / 12)

  const anoDoPonteiro = (e) => {
    const caixaSvg = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - caixaSvg.left - MARGEM.e) / (largura - MARGEM.e - MARGEM.d)) * ANOS)
    setAno(limitar(i, 0, ANOS))
  }
  const aoTeclar = (e) => {
    const passo = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
    if (passo) setAno((a) => limitar((a ?? 0) + passo, 0, ANOS))
    else if (e.key === 'Home') setAno(0)
    else if (e.key === 'End') setAno(ANOS)
    else if (e.key === 'Escape') setAno(null)
    else return
    setTeclado(true)
    e.preventDefault()
  }

  // painel do valor: do lado onde há mais espaço, sem cobrir o ponto
  const dica = ano === null ? null : { valor: alvo.acumulado[ano], xi: x(ano), yi: y(acumulado[ano]) }
  const ladoDireito = dica && dica.xi < largura / 2

  return (
    <div
      ref={caixa}
      className="sim-gcaixa"
      role="group"
      aria-label={`Gráfico da economia acumulada em ${ANOS} anos. Use as setas do teclado para ver cada ano; a tabela com os valores fica logo abaixo.`}
      tabIndex={0}
      onKeyDown={aoTeclar}
      onFocus={() => setAno((a) => a ?? limitar(Math.round(alvo.retornoMeses / 12), 1, ANOS))}
      onBlur={() => {
        setAno(null)
        setTeclado(false)
      }}
    >
      <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} aria-hidden="true" className="sim-g">
        <defs>
          <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="sim-g-onda-a" />
            <stop offset="1" className="sim-g-onda-b" />
          </linearGradient>
        </defs>

        {ticksY.map((t) => (
          <g key={t}>
            <line className="sim-g-grade" x1={MARGEM.e} x2={largura - MARGEM.d} y1={y(t)} y2={y(t)} />
            <text className="sim-g-texto" x={MARGEM.e - 8} y={y(t) + 4} textAnchor="end">
              {compacto(t)}
            </text>
          </g>
        ))}
        {TICKS_X.map((t) => (
          <text key={t} className="sim-g-texto" x={x(t)} y={altura - 7} textAnchor={t === 0 ? 'start' : t === ANOS ? 'end' : 'middle'}>
            {t === 0 ? 'hoje' : t}
          </text>
        ))}

        <path d={area} fill={`url(#${gradiente})`} />
        <path d={linha} className="sim-g-linha" />

        <line className="sim-g-meta" x1={MARGEM.e} x2={largura - MARGEM.d} y1={y(custo)} y2={y(custo)} />
        <text className="sim-g-texto" x={largura - MARGEM.d} y={y(custo) - 6} textAnchor="end">
          investimento no sistema
        </text>

        {retorno > 0 && (
          <g>
            <line className="sim-g-guia" x1={xMarca} x2={xMarca} y1={MARGEM.t} y2={base} />
            <circle className="sim-g-ponto" cx={xMarca} cy={y(custo)} r="5" />
            <text
              className="sim-g-texto sim-g-destaque"
              x={xMarca + (xMarca > largura - 110 ? -8 : 8)}
              y={MARGEM.t + 10}
              textAnchor={xMarca > largura - 110 ? 'end' : 'start'}
            >
              se paga aqui
            </text>
          </g>
        )}

        {dica && (
          <g>
            <line className="sim-g-cruz" x1={dica.xi} x2={dica.xi} y1={MARGEM.t} y2={base} />
            <circle className="sim-g-ponto sim-g-ponto--serie" cx={dica.xi} cy={dica.yi} r="4.5" />
          </g>
        )}

        {/* alvo do ponteiro: a área toda do gráfico, bem maior que a linha de 2px */}
        <rect
          className="sim-g-alvo"
          x={MARGEM.e - 10}
          y="0"
          width={largura - MARGEM.e - MARGEM.d + 20}
          height={altura}
          onPointerMove={anoDoPonteiro}
          onPointerDown={anoDoPonteiro}
          onPointerLeave={() => setAno(null)}
        />
      </svg>

      {dica && (
        <div
          className={`sim-dica${ladoDireito ? '' : ' sim-dica--esq'}`}
          style={{ left: dica.xi + (ladoDireito ? 14 : -14), top: limitar(dica.yi - 96, 0, altura - 84) }}
          role="status"
          aria-live={teclado ? 'polite' : 'off'}
        >
          <small>{ano === 0 ? 'Hoje' : `Ano ${ano}`}</small>
          <strong>R$ {numero(dica.valor)}</strong>
          <span>
            <i aria-hidden="true" /> economia acumulada
          </span>
          {dica.valor >= alvo.custo && <em>já cobre o investimento</em>}
        </div>
      )}
    </div>
  )
}
