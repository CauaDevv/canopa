import { useMemo, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../../lib/animacao'
import Arte from './blocos/Arte'
import RelatorioLeitor from './RelatorioLeitor'
import { RELATORIOS, TIPOS_RELATORIO, dataPublicado, relatorioPorId } from './dados'
import './relatorios.css'

function Cartao({ r, destaque, aoAbrir }) {
  const T = TIPOS_RELATORIO[r.tipo]
  return (
    <li className={`rel-card rel-card--${r.tipo} pn-revelar` + (destaque ? ' rel-card--destaque' : '')}>
      <div className="rel-card-capa">
        <Arte tipo={r.tipo} foto={r.foto} />
        <p className="rel-tag">
          <T.Icone size={14} strokeWidth={2.2} aria-hidden="true" /> {T.rotulo}
          {r.novo && <b>Novo</b>}
          {r.andamento && <b>Em andamento</b>}
        </p>
      </div>
      <div className="rel-card-corpo">
        <p className="rel-card-periodo">{r.periodo}</p>
        <h2>
          <button type="button" className="rel-card-abrir" onClick={() => aoAbrir(r.id)}>{r.titulo}</button>
        </h2>
        <p className="rel-card-chamada">{r.chamada}</p>
        <dl>
          {r.resumo.map((s) => (
            <div key={s.rotulo}>
              <dd>{s.valor}</dd>
              <dt>{s.rotulo}</dt>
            </div>
          ))}
        </dl>
        <footer>
          <span>Publicado em {dataPublicado(r)}</span>
          <span className="rel-card-seta" aria-hidden="true">Abrir <ArrowRight size={16} /></span>
        </footer>
      </div>
    </li>
  )
}

/* Lista de relatórios: cartões com capa própria por tipo, filtro por tipo e o mais recente em destaque. */
function Lista({ aoAbrir }) {
  const raiz = useRef(null)
  const [filtro, setFiltro] = useState('todos')

  const contagem = useMemo(() => {
    const c = { todos: RELATORIOS.length }
    for (const r of RELATORIOS) c[r.tipo] = (c[r.tipo] || 0) + 1
    return c
  }, [])
  const lista = filtro === 'todos' ? RELATORIOS : RELATORIOS.filter((r) => r.tipo === filtro)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('.pn-revelar'), { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08, clearProps: 'transform' })
      })
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz} className="pn-pagina pn-pagina--solta">
      <header className="pn-pagina-topo pn-revelar">
        <div>
          <p className="pn-eyebrow pn-eyebrow--escuro">Relatórios</p>
          <h1>Relatórios do seu impacto</h1>
          <p>Leituras visuais, publicadas pela equipe do CANOPA, sobre a energia gerada, o dinheiro economizado e o caminho de cada projeto. Abra aqui ou salve em PDF.</p>
        </div>
      </header>

      <div className="pn-chips pn-revelar" role="group" aria-label="Filtrar por tipo de relatório">
        {[['todos', 'Todos'], ...Object.entries(TIPOS_RELATORIO).map(([id, t]) => [id, t.rotulo])]
          .filter(([id]) => contagem[id])
          .map(([id, rotulo]) => (
            <button key={id} type="button" className="pn-chip" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
              {rotulo} <b>{contagem[id]}</b>
            </button>
          ))}
      </div>

      <ul className="rel-lista">
        {lista.map((r, i) => (
          <Cartao key={r.id} r={r} destaque={i === 0 && filtro === 'todos'} aoAbrir={aoAbrir} />
        ))}
      </ul>

      <p className="pn-nota pn-revelar">Dados de demonstração: os relatórios mostram como a visão do cliente vai ficar; parceiros, beneficiários e valores são fictícios.</p>
    </div>
  )
}

export default function PaginaRelatorios({ abertoId, aoAbrir, aoFechar }) {
  const aberto = abertoId ? relatorioPorId(abertoId) : null
  return aberto ? <RelatorioLeitor key={aberto.id} relatorio={aberto} aoVoltar={aoFechar} /> : <Lista aoAbrir={aoAbrir} />
}
