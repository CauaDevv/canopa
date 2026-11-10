import { CalendarDays, Clock } from 'lucide-react'
import { TIPOS_RELATORIO, dataPublicado } from '../dados'
import Arte from './Arte'

/* Capa do relatório: a mesma arte do cartão da lista, em tamanho de página. */
export default function Capa({ relatorio: r, tituloRef }) {
  const T = TIPOS_RELATORIO[r.tipo]
  return (
    <header className={`rel-capa rel-capa--${r.tipo}`}>
      <Arte tipo={r.tipo} foto={r.foto} grande />
      <div className="rel-capa-texto">
        <p className="rel-tag">
          <T.Icone size={14} strokeWidth={2.2} aria-hidden="true" /> {T.rotulo}
          {r.novo && <b>Novo</b>}
          {r.andamento && <b>Em andamento</b>}
        </p>
        <h1 id="rel-titulo" ref={tituloRef} tabIndex={-1}>{r.titulo}</h1>
        <p className="rel-capa-chamada">{r.chamada}</p>
        <p className="rel-capa-meta">
          <span><Clock size={14} aria-hidden="true" /> {r.periodo}</span>
          <span><CalendarDays size={14} aria-hidden="true" /> Publicado em {dataPublicado(r)}</span>
        </p>
      </div>
    </header>
  )
}
