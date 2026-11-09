/*
  As ondas de luz do hero e da tela de acesso: 38 curvas com gradiente da marca.
  Com `risca` (só o hero) cada curva ganha `pathLength="1"`: o tracejado passa a ser
  normalizado e o GSAP desenha as ondas animando só o `stroke-dashoffset`, sem o
  `getTotalLength()` do DrawSVG medindo 76 caminhos (~300 ms de thread principal no celular).
  Não se desenha por CSS: animar o tracejado de 76 caminhos com CSS não é composto e custou
  mais (medido com o Lighthouse: 77 "animações não compostas").
*/
export default function LinhasOnduladas({ side, risca = false }) {
  return (
    <svg className={'lines lines-' + side + (risca ? ' risca' : '')} viewBox="0 0 500 800" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={'gradient-' + side} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#00bac6" />
          <stop offset=".5" stopColor="#8dc9ad" />
          <stop offset="1" stopColor="#f9bd62" />
        </linearGradient>
      </defs>
      {Array.from({ length: 38 }, (_, i) => (
        <path
          key={i}
          d={`M ${-180 + i * 7} -40 C ${-80 + i * 7} 130, ${410 + i * 3} 110, ${340 + i * 4} 305 S ${55 + i * 5} 540, ${300 + i * 6} 850`}
          fill="none"
          stroke={`url(#gradient-${side})`}
          strokeWidth="1.1"
          opacity=".72"
          {...(risca ? { pathLength: 1 } : {})}
        />
      ))}
    </svg>
  )
}
