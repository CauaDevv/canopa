import { useContext } from 'react'
import { ArrowRight } from 'lucide-react'
import { TIPOS_RELATORIO, dataPublicado, relatorioPorId } from '../dados'
import Bloco, { RelatorioContexto } from './Bloco'

/* Lista dos relatórios ligados ao projeto; cada linha abre o relatório no leitor. */
export default function Relacionados({ dados }) {
  const { abrirRelatorio } = useContext(RelatorioContexto)
  const lista = dados.ids.map(relatorioPorId).filter(Boolean)
  return (
    <Bloco variante="suave" eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-relacionados">
      <ul>
        {lista.map((r, i) => {
          const T = TIPOS_RELATORIO[r.tipo]
          return (
            <li key={r.id} style={{ '--i': i }}>
              <button type="button" onClick={() => abrirRelatorio?.(r.id)}>
                <span className="rel-rel-icone" aria-hidden="true"><T.Icone size={20} strokeWidth={1.8} /></span>
                <span className="rel-rel-texto">
                  <small>{T.rotulo} · {r.periodo}</small>
                  <strong>{r.titulo}</strong>
                  <span>Publicado em {dataPublicado(r)}</span>
                </span>
                <span className="rel-rel-seta" aria-hidden="true">Abrir <ArrowRight size={16} /></span>
              </button>
            </li>
          )
        })}
      </ul>
    </Bloco>
  )
}
