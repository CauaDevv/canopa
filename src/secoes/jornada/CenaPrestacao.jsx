import { Download } from 'lucide-react'
import { gsap } from '../../lib/animacao'
import { ambienteBase } from '../../lib/cena'
import { Cena, Estrela } from './Pecas'

/*
  04 · PRESTAÇÃO DE CONTAS — tudo vira relatório. Um cartão confere o que o site promete (fonte, período
  e metodologia), o relatório se monta (rosca do investimento por tipo, barras de geração), o selo é
  carimbado e a etiqueta PDF cai por cima: o mesmo relatório que o cliente lê e salva no painel.
*/

// rosca: institutos 44 %, escolas 36 %, creches 20 % (as mesmas cores do painel do cliente)
const CX = 72
const CY = 150
const R = 38
const FATIAS = [
  { fracao: 0.44, cor: '#3f9d6e', nome: 'Institutos e ONGs', pct: '44%' },
  { fracao: 0.36, cor: '#0589a3', nome: 'Escolas', pct: '36%' },
  { fracao: 0.2, cor: '#e19b00', nome: 'Creches', pct: '20%' },
]
const GAP = 0.05 // radianos entre fatias

function arco(a0, a1) {
  const p = (a) => [CX + R * Math.sin(a), CY - R * Math.cos(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}
function fatiasComArco() {
  let acc = 0
  return FATIAS.map((f) => {
    const a0 = acc * Math.PI * 2 + GAP / 2
    acc += f.fracao
    return { ...f, d: arco(a0, acc * Math.PI * 2 - GAP / 2) }
  })
}
const BARRAS = [36, 44, 50, 46, 58, 66, 76]

export default function CenaPrestacao() {
  const fatias = fatiasComArco()
  return (
    <Cena rotulo="Ilustração: um relatório de impacto com gráfico de rosca e barras recebe o selo de conferência; ao lado, um cartão confere fonte, período e metodologia dos dados." sol={[116, 82]} nuvens={[[330, 44, 0.8], [592, 156, 0.55], [30, 196, 0.6]]}>
      {/* cartão de conferência */}
      <g transform="translate(26 154)">
        <g className="conferencia">
          <rect x="6" y="12" width="200" height="230" rx="20" fill="#07535c" opacity=".16" />
          <rect width="200" height="230" rx="20" fill="#fff" stroke="#d4ebe9" />
          <text x="20" y="40" fill="#07535c" fontFamily="'Barlow Condensed', sans-serif" fontSize="16.5" fontWeight="500" letterSpacing="1.5">COMO LEMOS OS DADOS</text>
          <rect x="20" y="49" width="46" height="3.5" rx="1.75" fill="#f4be69" />
          {[
            ['Fonte', 92],
            ['Período', 74],
            ['Metodologia', 104],
          ].map(([rotulo, larg], i) => (
            <g key={rotulo}>
              <g className={`conf-ok c${i}`} transform={`translate(34 ${96 + i * 56})`}>
                <circle r="12" fill="#05adba" />
                <path className={`conf-traco k${i}`} d="M-5 0.6 L-1.4 4.2 L5.2 -3.8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
              <text className={`conf-rotulo l${i}`} x="56" y={92 + i * 56} fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="13.5" fontWeight="800">{rotulo}</text>
              <rect className={`conf-linha l${i}`} x="56" y={100 + i * 56} width={larg} height="6" rx="3" fill="#cde5e3" />
            </g>
          ))}
        </g>
      </g>

      {/* o relatório (com duas folhas atrás) */}
      <g transform="translate(250 52)">
        <g className="folha folha-2"><rect x="-8" y="10" width="282" height="340" rx="16" fill="#fff" opacity=".7" transform="rotate(-5 140 170)" /></g>
        <g className="folha folha-1"><rect x="-3" y="5" width="282" height="340" rx="16" fill="#fff" opacity=".85" transform="rotate(-2.4 140 170)" /></g>
        <g className="relatorio">
          <rect x="6" y="14" width="280" height="340" rx="18" fill="#07535c" opacity=".16" />
          <rect width="280" height="340" rx="18" fill="#fff" stroke="#d4ebe9" />
          <path d="M0 18 a18 18 0 0 1 18 -18 H262 a18 18 0 0 1 18 18 V62 H0Z" fill="#07535c" />
          <text className="rel-titulo" x="22" y="37" fill="#fff" fontFamily="'Barlow Condensed', sans-serif" fontSize="20" fontWeight="500" letterSpacing="2.2">RELATÓRIO DO IMPACTO</text>
          <text className="rel-sub" x="22" y="53" fill="#b8dcde" fontFamily="'DM Sans', sans-serif" fontSize="10.5" fontWeight="600">outubro de 2026</text>

          <text x="22" y="92" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="800">Para onde foi o investimento</text>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e6f1f0" strokeWidth="12" />
          {fatias.map((f, i) => (
            <path key={i} className={`fatia f${i}`} d={f.d} fill="none" stroke={f.cor} strokeWidth="12" />
          ))}
          <text x={CX} y={CY + 2} textAnchor="middle" fill="#07535c" fontFamily="'Barlow Condensed', sans-serif" fontSize="17" fontWeight="500">145 mil</text>
          <text x={CX} y={CY + 13} textAnchor="middle" fill="#56777d" fontFamily="'DM Sans', sans-serif" fontSize="6.5" fontWeight="700" letterSpacing=".4">INVESTIDOS</text>
          {fatias.map((f, i) => (
            <g key={i} className={`legenda g${i}`} transform={`translate(136 ${126 + i * 26})`}>
              <rect y="-9" width="11" height="11" rx="3.5" fill={f.cor} />
              <text x="17" y="0" fill="#2d555b" fontFamily="'DM Sans', sans-serif" fontSize="9.5" fontWeight="700">{f.nome}</text>
              <text x="132" y="0" textAnchor="end" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="10.5" fontWeight="800">{f.pct}</text>
            </g>
          ))}

          <line x1="22" y1="204" x2="258" y2="204" stroke="#e3efed" />
          <text x="22" y="226" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="800">Energia gerada por mês</text>
          <line x1="22" y1="300" x2="258" y2="300" stroke="#cde5e3" strokeWidth="1.5" />
          {BARRAS.map((h, i) => (
            <rect key={i} className={`barra-rel r${i}`} x={30 + i * 30} y={300 - h} width="19" height={h} rx="4.5" fill={i === BARRAS.length - 1 ? '#f4be69' : '#2aa7b4'} />
          ))}
          <rect className="rodape-linha" x="22" y="316" width="140" height="5" rx="2.5" fill="#cde5e3" />
          <rect className="rodape-linha" x="22" y="327" width="98" height="5" rx="2.5" fill="#cde5e3" />
        </g>
      </g>

      {/* selo carimbado */}
      <g transform="translate(508 366)">
        <circle className="selo-onda" r="30" fill="none" stroke="#f4be69" strokeWidth="4" opacity="0" />
        <g className="selo-final">
          <path d="M-14 16 l-9 28 l16 -9 l8 14 l8 -32Z" fill="#d99a3a" />
          <path d="M14 16 l9 28 l-16 -9 l-8 14 l-8 -32Z" fill="#e8ac4d" />
          <circle r="31" fill="#f4be69" stroke="#d99a3a" strokeWidth="3" />
          <circle r="23.5" fill="none" stroke="#fff" strokeWidth="1.8" opacity=".75" strokeDasharray="2 4.2" />
          <path d="M-11 1 l8.5 9 l15.5 -18" stroke="#07404a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform="translate(508 366)">
          <g className="confete" opacity="0">
            <path d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z" fill={i % 3 === 0 ? '#f9ca78' : i % 3 === 1 ? '#fff' : '#3ed3df'} />
          </g>
        </g>
      ))}

      {/* etiqueta PDF */}
      <g transform="translate(508 62)">
        <g className="pdf">
          <rect x="4" y="8" width="98" height="42" rx="14" fill="#07535c" opacity=".2" />
          <rect width="98" height="42" rx="14" fill="#f4be69" />
          <rect x="1.5" y="1.5" width="95" height="39" rx="12.5" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".5" />
          <text x="22" y="27" fill="#07404a" fontFamily="'DM Sans', sans-serif" fontSize="14" fontWeight="800" letterSpacing=".6">PDF</text>
          <Download x={58} y={11} width={22} height={22} color="#07404a" strokeWidth={2.4} />
        </g>
      </g>

      <Estrela x={236} y={118} r={7} />
      <Estrela x={612} y={238} r={6} />
      <Estrela x={22} y={352} r={5} />
    </Cena>
  )
}

export function animar(svg) {
  const $ = gsap.utils.selector(svg)
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

  intro.from($('.sol'), { y: 70, autoAlpha: 0, duration: 1.5 }, 0)

  // o cartão de conferência entra e cada item é conferido
  intro.from($('.conferencia'), { x: -90, autoAlpha: 0, rotation: -5, duration: 1.0, ease: 'back.out(1.25)' }, 0.5)
  ;[0, 1, 2].forEach((i) => {
    const t = 1.7 + i * 0.7
    intro.from($(`.conf-linha.l${i}`), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5 }, t - 0.3)
    intro.from($(`.conf-ok.c${i}`), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.6)' }, t)
    intro.from($(`.k${i}`), { drawSVG: '0%', duration: 0.35 }, t + 0.05)
  })

  // as folhas e o relatório sobem
  intro.from($('.folha-2'), { y: 120, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.2)' }, 0.8)
  intro.from($('.folha-1'), { y: 120, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.2)' }, 0.95)
  intro.from($('.relatorio'), { y: 130, autoAlpha: 0, duration: 1.0, ease: 'back.out(1.2)' }, 1.1)
  intro.from($('.rel-titulo, .rel-sub'), { x: -14, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 2.0)

  // a rosca se desenha, fatia por fatia, e a legenda acompanha
  $('.fatia').forEach((f, i) => intro.from(f, { drawSVG: '0%', duration: 0.65, ease: 'power2.inOut' }, 2.3 + i * 0.5))
  intro.from($('.legenda'), { x: 14, autoAlpha: 0, duration: 0.5, stagger: 0.45 }, 2.5)

  // as barras de geração crescem
  intro.from($('.barra-rel'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.65, stagger: 0.09, ease: 'back.out(1.5)' }, 3.7)
  intro.from($('.rodape-linha'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.15 }, 4.5)

  // o selo é carimbado (o relatório sente o golpe) e solta confete
  intro.from($('.selo-final'), { scale: 3.2, rotation: -45, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(1.6)' }, 5.2)
  intro.fromTo($('.relatorio'), { scale: 1 }, { scale: 0.99, transformOrigin: '50% 50%', duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' }, 5.55)
  intro.fromTo($('.selo-onda'), { scale: 1, autoAlpha: 0.8, transformOrigin: '50% 50%' }, { scale: 2.8, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 5.55)
  $('.confete').forEach((c, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3
    const r = 52 + (i % 3) * 18
    intro.fromTo(c, { x: 0, y: 0, scale: 0.2, autoAlpha: 1 }, { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1.1, autoAlpha: 0, rotation: 120, duration: 1.0, ease: 'power2.out' }, 5.6)
  })

  // a etiqueta PDF cai por cima
  intro.from($('.pdf'), { y: -80, autoAlpha: 0, rotation: -10, duration: 0.8, ease: 'bounce.out' }, 6.1)

  const ambiente = ambienteBase(svg)
  ambiente.to($('.pdf'), { y: 5, rotation: 1.5, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 7 }, 0)
  ambiente.to($('.selo-final'), { rotation: 4, transformOrigin: '50% 50%', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 6.5 }, 0)
  return { intro, ambiente }
}
