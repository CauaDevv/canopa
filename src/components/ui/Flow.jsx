import { FlowButtonContent } from '../FlowButtonContent'

/**
 * Botão-link da marca. Com `magnetico`, ganha um invólucro que o GSAP puxa em
 * direção ao ponteiro (ver ligarImas): o movimento vai no invólucro, não no
 * link, para não brigar com o `:active { transform: scale(.95) }` do botão.
 */
export default function Flow({ children, href, onClick, className = '', magnetico = false }) {
  const link = (
    <a href={href} onClick={onClick} className={'flow-button canopa-flow ' + className}>
      <FlowButtonContent>{children}</FlowButtonContent>
    </a>
  )
  return magnetico ? <span className="ima" data-ima>{link}</span> : link
}
