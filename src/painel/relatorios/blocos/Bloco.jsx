import { createContext, useContext, useId, useRef } from 'react'
import useVisto from '../useVisto'

/* `tudo` = revelar tudo de uma vez (antes de imprimir/salvar em PDF, nada pode ficar esperando rolagem). */
export const RelatorioContexto = createContext({ tudo: false })

/*
  Moldura de todo bloco do relatório: título, variante de cor e o gatilho de entrada.
  `children` pode ser uma função que recebe `visto` (gráficos animam quando ele vira true).
*/
export default function Bloco({ variante = 'claro', eyebrow, titulo, subtitulo, className = '', children }) {
  const ref = useRef(null)
  const id = useId()
  const { tudo } = useContext(RelatorioContexto)
  const visto = useVisto(ref) || tudo

  return (
    <section ref={ref} className={`rel-bloco rel-bloco--${variante} ${className}`} data-visto={visto ? '1' : undefined} aria-labelledby={titulo ? id : undefined}>
      {titulo && (
        <header className="rel-bloco-topo">
          {eyebrow && <p className="rel-eyebrow">{eyebrow}</p>}
          <h2 id={id}>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </header>
      )}
      {typeof children === 'function' ? children(visto) : children}
    </section>
  )
}
