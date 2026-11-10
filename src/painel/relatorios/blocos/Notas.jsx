import { Check } from 'lucide-react'
import Bloco from './Bloco'

/* Metodologia em linguagem simples + a porta para falar com a equipe. */
export default function Notas({ dados }) {
  return (
    <Bloco variante="suave" eyebrow="Transparência" titulo={dados.titulo} className="rel-notas">
      <div className="rel-notas-grade">
        <ul>
          {dados.itens.map((texto) => (
            <li key={texto}>
              <Check size={16} strokeWidth={2.4} aria-hidden="true" />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
        <aside>
          <strong>Ficou com alguma dúvida?</strong>
          <p>A equipe do CANOPA explica cada número deste relatório.</p>
          <a className="pn-botao pn-botao--ouro" href="#contato">Falar com a equipe</a>
        </aside>
      </div>
    </Bloco>
  )
}
