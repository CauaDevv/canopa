/*
  O símbolo do CANOPA — um sol nascendo sobre o horizonte — em vetor.

  Por que existe (o símbolo era um PNG, já removido): `pathLength`/traço só funcionam
  em <path> de SVG inline; foto não se anima por traço. As formas foram
  reconstruídas com a geometria medida no PNG (viewBox 1068×394, centro dos
  arcos em 534 × 457,5; anel externo de raio 301–354; anel interno 184,5–236,5)
  e conferidas sobrepondo ao original: diferença de ~1px nas bordas.

  `grupo` é a ordem em que o sol nasce ao se desenhar:
  0 horizonte → 1 disco → 2 raios → 3 haste.
*/
const FORMAS = [
  { id: 'horizonteE', grupo: 0, d: 'M0 282H289.5A301 301 0 0 0 263.2 326H0Z' },
  { id: 'baseE', grupo: 0, d: 'M194.6 357H250.3A301 301 0 0 0 239.8 394H185.7A354 354 0 0 1 194.6 357Z' },
  { id: 'horizonteD', grupo: 0, d: 'M1068 282H778.5A301 301 0 0 1 804.8 326H1068Z' },
  { id: 'baseD', grupo: 0, d: 'M873.4 357H817.7A301 301 0 0 1 828.2 394H882.3A354 354 0 0 0 873.4 357Z' },
  { id: 'anel', grupo: 1, d: 'M306.2 394A236.5 236.5 0 0 1 761.8 394H707.2A184.5 184.5 0 0 0 360.8 394Z' },
  { id: 'arcoE', grupo: 2, d: 'M245.8 252A354 354 0 0 1 483 107.2V160.9A301 301 0 0 0 314.1 252Z' },
  { id: 'arcoD', grupo: 2, d: 'M822.2 252A354 354 0 0 0 585 107.2V160.9A301 301 0 0 1 753.9 252Z' },
  { id: 'barra', grupo: 3, d: 'M512 0H556V157H512Z' },
]

/*
  Decorativo: a cor vem de `color` no CSS e a opacidade de quem usa. Preenchimento
  e traço são atributos (não CSS) porque o GSAP anima `stroke-width` e
  `fill-opacity` por atributo, e uma regra de CSS venceria o atributo.
*/
export function SimboloSol({ className = '' }) {
  return (
    <svg
      className={'simbolo-sol ' + className}
      viewBox="0 0 1068 394"
      aria-hidden="true"
      focusable="false"
    >
      {FORMAS.map((f) => (
        <path key={f.id} data-grupo={f.grupo} d={f.d} fill="currentColor" stroke="currentColor" strokeWidth="0" />
      ))}
    </svg>
  )
}

export default SimboloSol
