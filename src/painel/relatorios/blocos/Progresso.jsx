import { useContext, useId, useMemo } from 'react'
import SimboloSol from '../../../components/ui/SimboloSol'
import useAnimado from '../../../hooks/useAnimado'
import { decimal } from '../../../lib/formatos'
import Bloco, { RelatorioContexto } from './Bloco'

/* Anel de andamento: o arco se desenha e o número conta quando o bloco aparece. */
function Anel({ valor, rotulo, ativo }) {
  const { tudo } = useContext(RelatorioContexto)
  const gradiente = useId()
  const alvo = useMemo(() => [ativo ? valor : 0], [ativo, valor])
  const [v] = useAnimado(alvo, 1500)
  const mostrado = tudo ? valor : v
  return (
    <div className="rel-anel" role="img" aria-label={`${decimal(valor * 100, 0)}% ${rotulo}`}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id={gradiente} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#05adba" />
            <stop offset="1" stopColor="#f4be69" />
          </linearGradient>
        </defs>
        <circle className="rel-anel-trilho" cx="100" cy="100" r="84" />
        <circle className="rel-anel-arco" cx="100" cy="100" r="84" pathLength="1" stroke={`url(#${gradiente})`} style={{ strokeDashoffset: 1 - mostrado }} />
      </svg>
      <div className="rel-anel-centro">
        <SimboloSol className="rel-anel-sol" />
        <strong>{decimal(mostrado * 100, 0)}%</strong>
        <span>{rotulo}</span>
      </div>
    </div>
  )
}

export default function Progresso({ dados }) {
  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} className="rel-progresso">
      {(visto) => (
        <div className="rel-progresso-corpo">
          <Anel valor={dados.valor} rotulo={dados.rotulo} ativo={visto} />
          <dl>
            {dados.detalhes.map((d) => (
              <div key={d.rotulo}>
                <dt>{d.rotulo}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Bloco>
  )
}
