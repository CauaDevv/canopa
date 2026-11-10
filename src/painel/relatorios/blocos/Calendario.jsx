import { Sun } from 'lucide-react'
import { decimal, numero } from '../../../lib/formatos'
import Bloco from './Bloco'
import VerDados from './VerDados'

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const NOMES_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

/*
  Calendário de calor do mês: cada quadrado é um dia e o tom (uma cor só, do claro ao escuro)
  diz quanta energia foi gerada. O tom nunca vai sozinho: o número do dia está no quadrado,
  o valor aparece ao passar o mouse ou focar, e a tabela tem todos os dias.
*/
export default function Calendario({ dados }) {
  const { valores, ano, mes, unidade } = dados
  const primeiro = new Date(ano, mes, 1).getDay()
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const tom = (v) => Math.min(4, Math.floor(((v - min) / (max - min || 1)) * 5))
  const melhor = valores.indexOf(max)
  const pior = valores.indexOf(min)
  const total = valores.reduce((s, v) => s + v, 0)
  const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-calendario">
      <div className="rel-cal-corpo">
        <div>
          <ol className="rel-cal" aria-label={`Geração por dia em ${nomeMes} de ${ano}`}>
            {SEMANA.map((d, i) => (
              <li key={i} className="rel-cal-semana" aria-hidden="true">{d}</li>
            ))}
            {Array.from({ length: primeiro }, (_, i) => (
              <li key={`v${i}`} className="rel-cal-vazio" aria-hidden="true" />
            ))}
            {valores.map((v, i) => {
              const coluna = (primeiro + i) % 7
              const dia = new Date(ano, mes, i + 1).getDay()
              return (
                <li
                  key={i}
                  className={'rel-cal-dia' + (i === melhor ? ' melhor' : '') + (coluna < 2 ? ' esq' : coluna > 4 ? ' dir' : '')}
                  data-tom={tom(v)}
                  data-dica={`Dia ${i + 1} · ${numero(v)} ${unidade}`}
                  style={{ '--i': i }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${NOMES_SEMANA[dia]}, dia ${i + 1}: ${numero(v)} ${unidade}${i === melhor ? ', o melhor dia do mês' : ''}`}
                >
                  <span>{i + 1}</span>
                  {i === melhor && <Sun size={13} strokeWidth={2.4} aria-hidden="true" />}
                </li>
              )
            })}
          </ol>
          <div className="rel-cal-escala" aria-hidden="true">
            <span>menos</span>
            <i />
            <span>mais energia</span>
          </div>
        </div>

        <dl className="rel-cal-resumo">
          <div>
            <dt>Melhor dia</dt>
            <dd>{melhor + 1} de {nomeMes}</dd>
            <small>{numero(max)} {unidade} gerados</small>
          </div>
          <div>
            <dt>Dia mais fraco</dt>
            <dd>{pior + 1} de {nomeMes}</dd>
            <small>{numero(min)} {unidade} gerados</small>
          </div>
          <div>
            <dt>Média por dia</dt>
            <dd>{decimal(total / valores.length, 0)} {unidade}</dd>
            <small>{numero(total)} {unidade} no mês</small>
          </div>
        </dl>
      </div>

      <VerDados
        legenda={dados.titulo}
        colunas={['Dia', `Energia (${unidade})`]}
        linhas={valores.map((v, i) => [`${i + 1} de ${nomeMes}`, numero(v)])}
      />
    </Bloco>
  )
}
