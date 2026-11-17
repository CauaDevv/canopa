import { useRef, useState } from 'react'
import useLargura from '../../../hooks/useLargura'
import { decimal, moeda } from '../../../lib/formatos'
import Bloco from './Bloco'
import VerDados from './VerDados'

// um tom só (turquesa), do maior para o menor: a ordem já conta a história. As cores são variáveis
// (relatorios.css) porque no PDF a rampa inverte: sobre papel branco o maior é o mais escuro.
const rampa = (i) => `var(--rel-ramp-${i})`
const CLARO = new Set([3, 4]) // no tema de papel, só estes dois levam texto escuro

/*
  Barra segmentada: um todo (o investimento) dividido em partes. Cada parte mostra seu
  percentual dentro do bloco quando cabe (senão fica só na legenda e na tabela); o vão
  de 2px entre blocos vem da cor da superfície. Passar o mouse numa parte acende a da legenda.
*/
function Barra({ dados }) {
  const caixa = useRef(null)
  const L = useLargura(caixa, 720)
  const [ativo, setAtivo] = useState(null)
  const total = dados.partes.reduce((s, p) => s + p.valor, 0)

  return (
    <div ref={caixa} className="rel-comp">
      <div className="rel-comp-barra" role="img" aria-label={`${dados.titulo}: ${dados.partes.map((p) => `${p.nome} ${decimal((p.valor / total) * 100, 0)}%`).join(', ')}`}>
        {dados.partes.map((p, i) => {
          const fracao = p.valor / total
          return (
            <div
              key={p.nome}
              className={'rel-comp-parte' + (CLARO.has(i) ? ' clara' : '') + (ativo !== null && ativo !== i ? ' apagada' : '')}
              style={{ flexGrow: p.valor, background: rampa(i), '--i': i }}
              onPointerEnter={() => setAtivo(i)}
              onPointerLeave={() => setAtivo(null)}
            >
              {L * fracao >= 56 && <span>{decimal(fracao * 100, 0)}%</span>}
            </div>
          )
        })}
      </div>

      <ul className="rel-comp-legenda">
        {dados.partes.map((p, i) => (
          <li key={p.nome} className={ativo === i ? 'ativo' : undefined} tabIndex={0} onPointerEnter={() => setAtivo(i)} onPointerLeave={() => setAtivo(null)} onFocus={() => setAtivo(i)} onBlur={() => setAtivo(null)}>
            <i style={{ background: rampa(i) }} aria-hidden="true" />
            <span>{p.nome}</span>
            <strong>{moeda(p.valor)}</strong>
          </li>
        ))}
      </ul>

      <VerDados
        legenda={dados.titulo}
        colunas={['Destino', 'Valor', 'Participação']}
        linhas={dados.partes.map((p) => [p.nome, moeda(p.valor), `${decimal((p.valor / total) * 100, 0)}%`])}
      />
    </div>
  )
}

export default function Composicao({ dados }) {
  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-composicao">
      <Barra dados={dados} />
    </Bloco>
  )
}
