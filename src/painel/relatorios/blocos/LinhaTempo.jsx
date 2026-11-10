import { Check } from 'lucide-react'
import Bloco from './Bloco'

const ROTULO = { feito: 'concluída', atual: 'em andamento', futuro: 'prevista' }

/* Jornada do projeto: a linha desce e cada etapa acende em cascata quando o bloco aparece. */
export default function LinhaTempo({ dados }) {
  return (
    <Bloco eyebrow={dados.eyebrow} titulo={dados.titulo} subtitulo={dados.subtitulo} className="rel-tempo">
      <ol>
        {dados.marcos.map((m, i) => (
          <li key={m.titulo} data-estado={m.estado} style={{ '--i': i }}>
            <span className="rel-tempo-no" aria-hidden="true">{m.estado === 'feito' && <Check size={13} strokeWidth={3} />}</span>
            <time>{m.data}</time>
            <h3>
              {m.titulo} <span className="sr-only">({ROTULO[m.estado]})</span>
            </h3>
            <p>{m.texto}</p>
          </li>
        ))}
      </ol>
    </Bloco>
  )
}
