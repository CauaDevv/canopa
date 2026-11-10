import { useContext, useMemo } from 'react'
import useAnimado from '../../../hooks/useAnimado'
import { decimal, moeda, percentual } from '../../../lib/formatos'
import Bloco, { RelatorioContexto } from './Bloco'

const FORMATOS = { int: (v) => decimal(v, 0), dec: (v) => decimal(v, 1), moeda, pct: (v) => percentual(v, 1) }

/* O número é o gráfico: ele conta de 0 até o valor quando o bloco aparece; o valor final fica para o leitor de tela. */
function Item({ item, ativo, indice }) {
  const { tudo } = useContext(RelatorioContexto)
  const formatar = FORMATOS[item.formato]
  const alvo = useMemo(() => [ativo ? item.valor : 0], [ativo, item.valor])
  const [v] = useAnimado(alvo, 1600)
  return (
    <li style={{ '--i': indice }}>
      <p className="rel-num-rotulo">{item.rotulo}</p>
      <p className="rel-num-valor">
        <span aria-hidden="true">{formatar(tudo ? item.valor : v)}</span>
        <span className="sr-only">
          {formatar(item.valor)}
          {item.unidade ? ` ${item.unidade}` : ''}
        </span>
        {item.unidade && <small aria-hidden="true">{item.unidade}</small>}
      </p>
      {item.nota && <p className="rel-num-nota">{item.nota}</p>}
    </li>
  )
}

export default function Numeros({ dados }) {
  return (
    <Bloco variante={dados.variante || 'escuro'} eyebrow={dados.eyebrow} titulo={dados.titulo} className="rel-numeros">
      {(visto) => (
        <ul>
          {dados.itens.map((item, i) => (
            <Item key={item.rotulo} item={item} ativo={visto} indice={i} />
          ))}
        </ul>
      )}
    </Bloco>
  )
}
