import { useId } from 'react'

/*
  Peças compartilhadas das ilustrações da Jornada. Tudo é SVG desenhado em código, na paleta do
  CANOPA (verde-petróleo, turquesa, dourado do sol), num quadro de 640 × 460. O chão fica em y = 396.

  A convenção das cenas: cada elemento que se anima tem uma CLASSE (ex.: `.escola-corpo`), e a linha do
  tempo da cena (`animar` em cada arquivo) só procura por classes dentro do próprio <svg>. Sem JavaScript
  (ou com movimento reduzido) o SVG já nasce no estado final, completo.
*/

export const CHAO = 396

/** Brilho de quatro pontas: o "faísca" que pisca nas cenas. */
export function Estrela({ x, y, r = 8, cor = '#ffd27a', className = 'brilho' }) {
  const k = r * 0.2
  const d = `M0 ${-r} C${k} ${-k} ${k} ${-k} ${r} 0 C${k} ${k} ${k} ${k} 0 ${r} C${-k} ${k} ${-k} ${k} ${-r} 0 C${-k} ${-k} ${-k} ${-k} 0 ${-r}Z`
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={className} d={d} fill={cor} />
    </g>
  )
}

function Nuvem({ x, y, escala = 1, className = 'nuvem' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g className={className}>
        <circle cx="0" cy="0" r="17" fill="#fff" opacity=".9" />
        <circle cx="24" cy="-9" r="22" fill="#fff" opacity=".92" />
        <circle cx="50" cy="0" r="16" fill="#fff" opacity=".9" />
        <rect x="-8" y="-1" width="66" height="17" rx="8.5" fill="#fff" opacity=".92" />
      </g>
    </g>
  )
}

/** Céu, sol, nuvens, colinas e chão. O conteúdo da cena entra como `children`, por cima. */
export function Cena({ rotulo, sol = [510, 100], nuvens = [], children, className = '' }) {
  const id = useId().replace(/:/g, '')
  const raios = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2
    const r0 = 56
    const r1 = i % 2 ? 72 : 82
    return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} />
  })
  return (
    <svg className={`cena ${className}`} viewBox="0 0 640 460" role="img" aria-label={rotulo} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fd0d9" />
          <stop offset=".5" stopColor="#bdeeee" />
          <stop offset="1" stopColor="#f2fcf8" />
        </linearGradient>
        <radialGradient id={`${id}-brilho`}>
          <stop offset="0" stopColor="#ffe3a0" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-disco`} cx=".38" cy=".34">
          <stop offset="0" stopColor="#fff8e0" />
          <stop offset=".55" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#f4be69" />
        </radialGradient>
        <linearGradient id={`${id}-chao`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35b0bc" />
          <stop offset="1" stopColor="#157f8b" />
        </linearGradient>
        <clipPath id={`${id}-moldura`}>
          <rect width="640" height="460" rx="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-moldura)`}>
        <rect className="cena-ceu" width="640" height="460" fill={`url(#${id}-ceu)`} />

        <g transform={`translate(${sol[0]} ${sol[1]})`}>
          <g className="sol">
            <circle r="130" fill={`url(#${id}-brilho)`} />
            <g className="sol-raios" stroke="#ffd98a" strokeWidth="3.5" strokeLinecap="round" opacity=".7">
              {raios}
            </g>
            <circle r="42" fill={`url(#${id}-disco)`} />
          </g>
        </g>

        {nuvens.map(([x, y, e], i) => (
          <Nuvem key={i} x={x} y={y} escala={e} />
        ))}

        {/* colinas: três planos, do mais longe (claro) ao mais perto (escuro) */}
        <path d="M0 336 C90 296 170 316 262 326 S440 304 530 322 S604 318 640 308 V460 H0Z" fill="#b9e9ec" />
        <path d="M0 366 C120 326 222 356 332 350 S524 326 640 354 V460 H0Z" fill="#86d5db" />
        <path className="cena-chao" d="M0 398 C160 386 300 404 440 394 S580 386 640 394 V460 H0Z" fill={`url(#${id}-chao)`} />
        <g stroke="#157f8b" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".75">
          <path d="M40 410 l-3 -9 M46 410 l1 -11 M52 410 l4 -8" />
          <path d="M300 414 l-3 -9 M306 414 l1 -11 M312 414 l4 -8" />
          <path d="M560 408 l-3 -9 M566 408 l1 -11 M572 408 l4 -8" />
        </g>

        {children}
      </g>
    </svg>
  )
}

export function Arvore({ x, y = CHAO, escala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g className="arvore">
        <rect x="-4" y="-34" width="8" height="34" rx="3" fill="#8a5a2b" />
        <circle cx="0" cy="-52" r="26" fill="#3f9d6e" />
        <circle cx="-17" cy="-40" r="19" fill="#4fb783" />
        <circle cx="18" cy="-42" r="19" fill="#4fb783" />
        <circle cx="-6" cy="-60" r="13" fill="#6fcb9d" opacity=".85" />
      </g>
    </g>
  )
}

// interpolação do trapézio do telhado: x das bordas esquerda e direita numa altura y
const bordaEsq = (y) => 24 - (y - 22) * (24 / 42)
const bordaDir = (y) => 176 + (y - 22) * (24 / 42)

/** Os painéis solares sobre o telhado: duas fileiras de cinco, em perspectiva. */
function PaineisDoTelhado() {
  const filas = [[27, 41], [45, 59]]
  const paineis = []
  filas.forEach(([yt, yb], f) => {
    const n = 5
    const gap = 3
    const xs = (y, i) => {
      const e = bordaEsq(y) + 7
      const d = bordaDir(y) - 7
      const larg = (d - e - gap * (n - 1)) / n
      return [e + i * (larg + gap), e + i * (larg + gap) + larg]
    }
    for (let i = 0; i < n; i++) {
      const [tl, tr] = xs(yt, i)
      const [bl, br] = xs(yb, i)
      paineis.push(
        <g key={`${f}-${i}`} className="painel">
          <path d={`M${tl} ${yt} L${tr} ${yt} L${br} ${yb} L${bl} ${yb}Z`} fill="#0b4a66" stroke="#9fe3ea" strokeWidth=".9" />
          <path d={`M${(tl + tr) / 2} ${yt} L${(bl + br) / 2} ${yb} M${(tl * 0.67 + bl * 0.33 + tr * 0.67 + br * 0.33) / 2} ${(yt * 2 + yb) / 3} L${(tl * 0.33 + bl * 0.67 + tr * 0.33 + br * 0.67) / 2} ${(yt + yb * 2) / 3}`} stroke="#6fc9d6" strokeWidth=".6" opacity=".7" />
          <path className="painel-brilho" d={`M${tl + 2} ${yt + 1} L${tl + (tr - tl) * 0.45} ${yt + 1} L${bl + (br - bl) * 0.25} ${yb - 1} L${bl + 1} ${yb - 1}Z`} fill="#fff" opacity=".22" />
        </g>,
      )
    }
  })
  return <g className="escola-paineis">{paineis}</g>
}

/**
 * A escola do projeto (200 × 150, chão em y = 150). `x`/`y` posicionam o canto do quadro e `escala` a
 * redimensiona. Com `paineis`, ganha o sistema solar no telhado.
 */
export function Escola({ x = 0, y = 0, escala = 1, paineis = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g className="escola">
        <ellipse cx="100" cy="149" rx="106" ry="6" fill="#07535c" opacity=".22" />
        <g className="escola-corpo">
          <rect x="10" y="62" width="180" height="86" rx="3" fill="#fffaf0" />
          <rect x="146" y="62" width="44" height="86" rx="3" fill="#f1e4c4" />
          <rect x="10" y="62" width="180" height="6" fill="#f3e6c8" />
          <path className="telhado" d="M0 64 L24 22 H176 L200 64Z" fill="#f4be69" />
          <path d="M6 64 L27 26 H173 L194 64Z" fill="#f9ca78" />
          <path d="M0 64 L24 22 H176 L200 64 H0Z" fill="none" stroke="#d99a3a" strokeWidth="1.6" strokeLinejoin="round" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} className="janela-escola" x={i < 2 ? 22 + i * 34 : 122 + (i - 2) * 34} y="80" width="24" height="28" rx="3" fill="#7fd6dd" stroke="#07535c" strokeWidth="2" />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const x0 = i < 2 ? 22 + i * 34 : 122 + (i - 2) * 34
            return <path key={`c${i}`} d={`M${x0 + 12} 80 V108 M${x0} 94 H${x0 + 24}`} stroke="#fff" strokeWidth="1.6" opacity=".85" />
          })}
          <path className="porta" d="M86 148 V116 a14 14 0 0 1 28 0 V148Z" fill="#0a7480" />
          <circle cx="108" cy="132" r="1.8" fill="#f9ca78" />
          <rect x="80" y="144" width="40" height="5" rx="1.5" fill="#d9c9a0" />
          <circle cx="100" cy="88" r="10" fill="#fff" stroke="#f4be69" strokeWidth="2" />
          <path d="M94 91 a6 6 0 0 1 12 0" stroke="#05adba" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M100 79.5 v-2.5 M91 84 l-2 -1.6 M109 84 l2 -1.6" stroke="#f4be69" strokeWidth="1.8" strokeLinecap="round" />
          {paineis ? <PaineisDoTelhado /> : null}
        </g>
        <g className="escola-bandeira">
          <line x1="100" y1="22" x2="100" y2="-10" stroke="#07535c" strokeWidth="2.2" strokeLinecap="round" />
          <path className="bandeira" d="M100 -10 C110 -14 118 -6 130 -10 V4 C118 8 110 0 100 4Z" fill="#05adba" />
        </g>
      </g>
    </g>
  )
}
