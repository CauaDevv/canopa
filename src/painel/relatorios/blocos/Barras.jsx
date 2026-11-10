import { useRef, useState } from 'react'
import useLargura from '../../../hooks/useLargura'
import { compacto, moeda, numero, tetoRedondo } from '../../../lib/formatos'
import Bloco from './Bloco'
import VerDados from './VerDados'

const FORMATA = { int: numero, moeda }
const M = { e: 54, d: 8, t: 28 }
const GAP = 2 // vão de 2px entre segmentos empilhados (a cor da superfície separa, nunca um contorno)
const limitar = (v, min, max) => Math.min(max, Math.max(min, v))

// barra com o topo arredondado (4px) e a base reta, como pede a especificação de marcas da skill dataviz
function barra(x, y, w, h, r = 4) {
  if (h <= 0.5) return ''
  const rr = Math.min(r, h, w / 2)
  return `M${x} ${y + h}V${y + rr}Q${x} ${y} ${x + rr} ${y}H${x + w - rr}Q${x + w} ${y} ${x + w} ${y + rr}V${y + h}Z`
}

// rótulo de eixo que não cabe numa linha vira até três (em vez de cortar ou sobrepor o vizinho)
function linhas(texto, limite) {
  const saida = []
  let atual = ''
  for (const palavra of texto.split(' ')) {
    const junta = atual ? `${atual} ${palavra}` : palavra
    if (junta.length > limite && atual) {
      saida.push(atual)
      atual = palavra
    } else atual = junta
  }
  saida.push(atual)
  return saida.slice(0, 3)
}

/*
  Barras verticais em pixels reais (o texto não encolhe no celular). Dois modos:
  - "empilhado": a altura total é a soma das séries (geração por tipo de beneficiário);
  - "sobreposto": a série 0 é o "fundo" (quanto seria) e a série 1, a barra da frente
    (quanto foi), como o antes e depois da conta de luz.
  Hover, toque e foco mostram o valor de cada série; a tabela abaixo tem todos os números.
*/
function Grafico({ dados }) {
  const { modo, categorias, series, formato, unidade, vazio } = dados
  const caixa = useRef(null)
  const L = useLargura(caixa, 640)
  const [ativo, setAtivo] = useState(null)
  const fmt = FORMATA[formato]

  const n = categorias.length
  const slot = (L - M.e - M.d) / n
  const quebras = categorias.map((c) => linhas(c, Math.max(6, Math.floor(slot / 6.6))))
  const alturaTexto = Math.max(...quebras.map((q) => q.length)) * 15
  const alt = (L < 520 ? 230 : 290) + alturaTexto
  const base = alt - alturaTexto - 14
  const empilhado = modo === 'empilhado'
  const totais = categorias.map((_, i) => (empilhado ? series.reduce((s, se) => s + se.valores[i], 0) : Math.max(...series.map((se) => se.valores[i]))))
  const teto = tetoRedondo(Math.max(...totais, 1) * 1.12)
  const y = (v) => base - (v / teto) * (base - M.t)
  const larg = Math.min(48, slot * 0.6)
  const comRotulo = slot >= 34

  const dica = ativo === null ? null : { cx: M.e + slot * ativo + slot / 2, topo: y(totais[ativo]) }

  return (
    <div ref={caixa} className="rel-grafico">
      {series.length > 1 && (
        <ul className="rel-legenda">
          {series.map((se) => (
            <li key={se.id}>
              <i style={{ background: se.cor }} aria-hidden="true" /> {se.nome}
            </li>
          ))}
          <li className="rel-unidade">{unidade}</li>
        </ul>
      )}
      {series.length === 1 && <p className="rel-unidade rel-unidade--so">{series[0].nome} · {unidade}</p>}

      <svg width={L} height={alt} viewBox={`0 0 ${L} ${alt}`} className="rel-svg" aria-hidden="false" role="group" aria-label={dados.titulo}>
        {[0, teto / 2, teto].map((t) => (
          <g key={t}>
            <line className="rel-grade" x1={M.e} x2={L - M.d} y1={y(t)} y2={y(t)} />
            <text className="rel-eixo" x={M.e - 8} y={y(t) + 4} textAnchor="end">{compacto(t)}</text>
          </g>
        ))}

        {categorias.map((cat, i) => {
          const cx = M.e + slot * i + slot / 2
          const rotuloAria = `${cat}: ${series.map((se) => `${se.nome} ${fmt(se.valores[i])} ${unidade}`).join(', ')}`
          let acima = 0
          return (
            <g
              key={cat}
              className="rel-cat"
              style={{ opacity: ativo !== null && ativo !== i ? 0.4 : 1, '--i': i }}
              tabIndex={0}
              role="img"
              aria-label={rotuloAria}
              onFocus={() => setAtivo(i)}
              onBlur={() => setAtivo(null)}
            >
              {empilhado
                ? series.map((se, k) => {
                    const v = se.valores[i]
                    if (!v) return null
                    const yTopo = y(acima + v)
                    const yBase = acima === 0 ? base : y(acima) - GAP
                    acima += v
                    const topo = k === series.length - 1 || series.slice(k + 1).every((s2) => !s2.valores[i])
                    return <path key={se.id} className="rel-seg" d={barra(cx - larg / 2, yTopo, larg, yBase - yTopo, topo ? 4 : 0)} fill={se.cor} />
                  })
                : series.map((se, k) => {
                    const w = k === 0 ? larg : larg * 0.58
                    return <path key={se.id} className="rel-seg" d={barra(cx - w / 2, y(se.valores[i]), w, base - y(se.valores[i]))} fill={se.cor} />
                  })}

              {comRotulo && totais[i] > 0 && (
                <text className="rel-valor" x={cx} y={y(empilhado ? totais[i] : series[series.length - 1].valores[i]) - 7} textAnchor="middle">
                  {fmt(empilhado ? totais[i] : series[series.length - 1].valores[i])}
                </text>
              )}
              {totais[i] === 0 && vazio && (
                <text className="rel-eixo" x={cx} y={base - 8} textAnchor="middle">
                  {linhas(vazio, Math.max(6, Math.floor(slot / 6.6))).map((t, k) => (
                    <tspan key={t} x={cx} dy={k ? 13 : -(linhas(vazio, Math.max(6, Math.floor(slot / 6.6))).length - 1) * 6.5}>{t}</tspan>
                  ))}
                </text>
              )}
              <text className={'rel-eixo' + (ativo === i ? ' rel-eixo--forte' : '')} x={cx} y={base + 18} textAnchor="middle">
                {quebras[i].map((t, k) => (
                  <tspan key={t} x={cx} dy={k ? 14 : 0}>{t}</tspan>
                ))}
              </text>
              <rect className="rel-alvo" x={cx - slot / 2} y="0" width={slot} height={alt} onPointerEnter={() => setAtivo(i)} onPointerLeave={() => setAtivo(null)} />
            </g>
          )
        })}
      </svg>

      {dica && (
        <div className="rel-dica" style={{ left: limitar(dica.cx, 96, L - 96), top: Math.max(dica.topo - 10, 86) }} role="status" aria-live="off">
          <small>{categorias[ativo]}</small>
          {series.map((se) => (
            <span key={se.id}>
              <i style={{ background: se.cor }} aria-hidden="true" />
              <b>{fmt(se.valores[ativo])}</b> {se.nome}
            </span>
          ))}
          {empilhado && series.length > 1 && <strong>Total {fmt(totais[ativo])} {unidade}</strong>}
        </div>
      )}

      <VerDados
        legenda={dados.titulo}
        colunas={['', ...series.map((se) => se.nome), ...(empilhado && series.length > 1 ? ['Total'] : [])]}
        linhas={categorias.map((cat, i) => [cat, ...series.map((se) => fmt(se.valores[i])), ...(empilhado && series.length > 1 ? [fmt(totais[i])] : [])])}
      />
    </div>
  )
}

export default function Barras({ dados }) {
  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-barras">
      <Grafico dados={dados} />
    </Bloco>
  )
}
