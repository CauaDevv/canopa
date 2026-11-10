import { Sun } from 'lucide-react'
import { decimal, moeda, percentual } from '../../../lib/formatos'
import { PROJETOS, TIPOS } from '../../dados-demo'
import { StatusPill } from '../../TabelaProjetos'
import { retornoDoProjeto } from '../dados'
import Bloco from './Bloco'

/* Cartões dos projetos com um medidor: quanto do investimento já voltou em economia. */
export default function Projetos({ dados }) {
  const lista = dados.ids.map((id) => PROJETOS.find((p) => p.id === id))
  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-projetos">
      <ul>
        {lista.map((p, i) => {
          const r = retornoDoProjeto(p.id)
          return (
            <li key={p.id} style={{ '--i': i }}>
              <header>
                <span className="rel-projeto-tipo" style={{ '--cor': TIPOS[p.tipo].cor }}>
                  <i aria-hidden="true" /> {TIPOS[p.tipo].rotulo}
                </span>
                <StatusPill status={p.status} />
              </header>
              <h3>{p.beneficiario}</h3>
              <p className="rel-projeto-parceiro">
                <Sun size={14} aria-hidden="true" /> {p.parceiro}
              </p>
              <div
                className="rel-medidor"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(r.fracao * 100)}
                aria-label={`Retorno do investimento de ${p.beneficiario}`}
              >
                <i style={{ '--v': Math.max(r.fracao, 0) }} />
              </div>
              <p className="rel-medidor-texto">
                {p.status === 'operacao' ? (
                  <>
                    <strong>{percentual(r.fracao * 100, 1)}</strong> do investimento já voltou em economia
                  </>
                ) : (
                  'O retorno começa quando o projeto entrar em operação'
                )}
              </p>
              <dl>
                <div><dt>Investimento</dt><dd>{moeda(p.investimento)}</dd></div>
                <div><dt>Economia até agora</dt><dd>{moeda(r.acumulado)}</dd></div>
                <div><dt>Potência</dt><dd>{decimal(p.kwp, 1)} kWp</dd></div>
              </dl>
            </li>
          )
        })}
      </ul>
    </Bloco>
  )
}
