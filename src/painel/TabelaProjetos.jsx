import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Hammer, Users } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { STATUS } from './dados-demo'
import { moeda } from '../lib/formatos'

// status sempre com ícone + texto (nunca só a cor)
export function StatusPill({ status }) {
  const Icone = status === 'operacao' ? CheckCircle2 : Hammer
  return (
    <span className={'pn-pill pn-pill--' + status}>
      <Icone size={13} strokeWidth={2.4} aria-hidden="true" /> {STATUS[status].rotulo}
    </span>
  )
}

const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'operacao', rotulo: STATUS.operacao.rotulo },
  { id: 'instalacao', rotulo: STATUS.instalacao.rotulo },
]

/* "Projetos ativos": tabela com filtro por status. No celular cada linha vira um cartão. */
export default function TabelaProjetos({ projetos }) {
  const raiz = useRef(null)
  const [filtro, setFiltro] = useState('todos')

  const contagem = useMemo(
    () => ({ todos: projetos.length, operacao: projetos.filter((p) => p.status === 'operacao').length, instalacao: projetos.filter((p) => p.status === 'instalacao').length }),
    [projetos],
  )
  const linhas = filtro === 'todos' ? projetos : projetos.filter((p) => p.status === filtro)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('tbody tr'), { autoAlpha: 0, x: -18, duration: 0.7, stagger: 0.09, delay: 0.5, clearProps: 'transform' })
      })
    },
    { scope: raiz },
  )

  return (
    <section ref={raiz} className="pn-cartao pn-tabela-cartao pn-revelar" aria-labelledby="pn-projetos-titulo">
      <header className="pn-cartao-topo">
        <div>
          <h2 id="pn-projetos-titulo">Projetos ativos</h2>
          <p>{contagem.operacao} em operação · {contagem.instalacao} em instalação</p>
        </div>
        <Users size={20} aria-hidden="true" className="pn-cartao-icone" />
      </header>

      <div className="pn-chips" role="group" aria-label="Filtrar por status">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" className="pn-chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.rotulo} <b>{contagem[f.id]}</b>
          </button>
        ))}
      </div>

      <div className="pn-tabela-rolagem">
        <table className="pn-tabela">
          <caption className="sr-only">Projetos ativos, com parceiro, beneficiário, investimento, economia anual e status</caption>
          <thead>
            <tr>
              <th scope="col">Parceiro</th>
              <th scope="col">Beneficiário</th>
              <th scope="col" className="num">Investimento</th>
              <th scope="col" className="num">Economia anual</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((p) => (
              <tr key={p.id}>
                <th scope="row" data-rotulo="Parceiro">{p.parceiro}</th>
                <td data-rotulo="Beneficiário">{p.beneficiario}</td>
                <td className="num" data-rotulo="Investimento">{moeda(p.investimento)}</td>
                <td className="num" data-rotulo="Economia anual">{moeda(p.economiaAnual)}</td>
                <td data-rotulo="Status"><StatusPill status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {linhas.length === 0 && <p className="pn-vazio">Nenhum projeto com este status.</p>}
      </div>
    </section>
  )
}
