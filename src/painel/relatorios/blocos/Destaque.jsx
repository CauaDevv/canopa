import SimboloSol from '../../../components/ui/SimboloSol'
import Bloco from './Bloco'

/* Uma frase só, grande, com os números que importam em destaque: o resumo que a pessoa leva do relatório. */
export default function Destaque({ dados }) {
  return (
    <Bloco variante={dados.variante || 'suave'} className="rel-destaque">
      <SimboloSol className="rel-destaque-sol" />
      <p className="rel-frase">
        {dados.frase.map((parte, i) => (typeof parte === 'string' ? parte : <mark key={i}>{parte.d}</mark>))}
      </p>
    </Bloco>
  )
}
