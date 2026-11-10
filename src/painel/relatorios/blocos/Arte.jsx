import SimboloSol from '../../../components/ui/SimboloSol'

const BASE = import.meta.env.BASE_URL

// ondas de luz (relatórios de geração): cinco curvas defasadas
const ondas = (k) => {
  let d = `M0 ${70 + k * 16}`
  for (let x = 0; x <= 400; x += 16) d += `L${x} ${(70 + k * 16 + Math.sin((x / 400) * Math.PI * 2 + k * 0.7) * (16 + k * 3)).toFixed(1)}`
  return d
}

/*
  Arte de fundo de cada tipo de relatório (capa do relatório e capa do cartão da lista):
  impacto = sol nascendo, geração = ondas de luz, prestação de contas = anéis dourados,
  projeto e instalação = foto dos painéis sob um véu verde-petróleo. Decorativa.
*/
export default function Arte({ tipo, foto, grande = false }) {
  const estilo = foto ? { '--foto': `url(${BASE}images/fotos/${foto}${grande ? '' : '-800'}.webp)` } : undefined
  return (
    <div className={`rel-arte rel-arte--${tipo}${foto ? ' rel-arte--foto' : ''}`} style={estilo} aria-hidden="true">
      <div className="rel-arte-raios" />
      {tipo === 'geracao' && (
        <svg className="rel-arte-ondas" viewBox="0 0 400 190" preserveAspectRatio="none">
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <path key={k} d={ondas(k)} />
          ))}
        </svg>
      )}
      {tipo === 'contas' && (
        <svg className="rel-arte-aneis" viewBox="0 0 200 200">
          {[88, 66, 44, 22].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
        </svg>
      )}
      <SimboloSol className="rel-arte-sol" />
    </div>
  )
}
