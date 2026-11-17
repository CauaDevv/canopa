import { Handshake } from 'lucide-react'
import { gsap } from '../../lib/animacao'
import { ambienteBase } from '../../lib/cena'
import { Cena, Escola, Estrela } from './Pecas'

/*
  02 · PARCERIA — a empresa (torre) apoia a escola. Os prédios sobem, um fio de energia liga os dois,
  moedas viajam pelo fio, o aperto de mãos acende no meio, o termo é assinado e selado e, no fim, os
  painéis solares nascem no telhado da escola: a parceria virou projeto.
*/

const FIO = 'M184 250 C236 160 292 140 322 176 S420 280 468 318'
const LIGADAS = new Set([1, 4, 5, 8, 10, 13, 16, 19]) // janelas acesas em dourado no estado final
const JANELAS = Array.from({ length: 21 }, (_, i) => ({ x: 74 + (i % 3) * 34, y: 172 + Math.floor(i / 3) * 26, ligada: LIGADAS.has(i) }))

export default function CenaParceria() {
  return (
    <Cena rotulo="Ilustração: uma empresa e uma escola ligadas por um fio de energia, com um aperto de mãos no centro e o termo de parceria assinado." sol={[548, 84]} nuvens={[[236, 58, 1], [70, 58, 0.7], [470, 150, 0.6]]}>
      {/* a empresa */}
      <g className="predio2">
        <rect x="18" y="262" width="58" height="134" rx="3" fill="#0a7480" />
        <rect x="58" y="262" width="18" height="134" rx="3" fill="#07535c" />
        {[0, 1, 2, 3, 4].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={28 + c * 20} y={276 + r * 24} width="11" height="14" rx="2" fill="#7fd6dd" opacity=".85" />))}
      </g>
      <g className="torre">
        <rect x="62" y="150" width="120" height="246" rx="4" fill="#f7fbfb" />
        <rect x="150" y="150" width="32" height="246" fill="#dcecec" />
        <rect x="62" y="150" width="120" height="11" fill="#f4be69" />
        <rect x="90" y="132" width="54" height="18" rx="2" fill="#0a7480" />
        <line x1="117" y1="132" x2="117" y2="104" stroke="#07535c" strokeWidth="2.4" strokeLinecap="round" />
        <circle className="antena" cx="117" cy="102" r="4.2" fill="#e5484d" />
        {JANELAS.map((j, i) => (
          <rect key={i} className="janela-torre" x={j.x} y={j.y} width="22" height="15" rx="2.5" fill={j.ligada ? '#ffd98a' : '#bfe8ea'} />
        ))}
        <path d="M100 396 V372 a22 22 0 0 1 44 0 V396Z" fill="#0a7480" />
        <rect x="112" y="378" width="20" height="18" fill="#7fd6dd" opacity=".7" />
      </g>

      {/* a escola, que ganha painéis no fim */}
      <Escola x={436} y={282} escala={0.76} paineis />

      {/* o fio de energia */}
      <path className="fio" d={FIO} stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".9" />
      <path className="fluxo" d={FIO} stroke="#f4be69" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 13" fill="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} className="moeda" opacity="0">
          <circle r="11" fill="#f9ca78" stroke="#c98a2b" strokeWidth="2" />
          <circle r="7" fill="none" stroke="#c98a2b" strokeWidth="1" opacity=".5" />
          <text y="3.4" textAnchor="middle" fill="#8a5a00" fontFamily="'DM Sans', sans-serif" fontSize="8.5" fontWeight="800">R$</text>
        </g>
      ))}

      {/* o aperto de mãos */}
      <g transform="translate(322 176)">
        <g className="anel-onda"><circle r="40" fill="none" stroke="#f4be69" strokeWidth="3" /></g>
        <g className="anel-onda anel-onda--2"><circle r="40" fill="none" stroke="#f4be69" strokeWidth="2" /></g>
        <g className="selo-aperto">
          <circle r="40" fill="#fff" stroke="#f4be69" strokeWidth="3.5" />
          <circle r="32" fill="#fff7e6" />
          <g className="aperto">
            <Handshake x={-19} y={-19} width={38} height={38} color="#05808d" strokeWidth={1.9} />
          </g>
        </g>
      </g>

      {/* o termo de parceria */}
      <g transform="translate(240 290) rotate(-3)">
        <g className="contrato">
          <rect x="5" y="8" width="150" height="100" rx="11" fill="#07535c" opacity=".16" />
          <rect width="150" height="100" rx="11" fill="#fff" stroke="#d4ebe9" />
          <text x="14" y="24" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="800">Termo de parceria</text>
          <rect x="14" y="33" width="104" height="5" rx="2.5" fill="#cde5e3" />
          <rect x="14" y="44" width="82" height="5" rx="2.5" fill="#cde5e3" />
          <path className="assinatura" d="M18 78 c6 -17 10 -2 14 -7 s8 13 14 -2 s10 -15 16 -2 s8 9 14 -5" stroke="#07535c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <line x1="14" y1="88" x2="104" y2="88" stroke="#cde5e3" strokeWidth="1.5" />
          <g className="selo" transform="translate(124 76)">
            <path d="M-8 6 l-5 18 l9 -5 l5 8 l5 -20Z" fill="#d99a3a" />
            <circle r="18" fill="#f4be69" stroke="#d99a3a" strokeWidth="2.5" />
            <circle r="12.5" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".7" />
            <path d="M-6.5 0.5 l4.6 4.8 l8.6 -9.8" stroke="#07404a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          <circle className="selo-onda" cx="124" cy="76" r="18" fill="none" stroke="#f4be69" strokeWidth="3" opacity="0" />
        </g>
      </g>

      <Estrela x={252} y={230} r={7} />
      <Estrela x={402} y={196} r={6} />
      <Estrela x={600} y={262} r={7} />
    </Cena>
  )
}

export function animar(svg) {
  const $ = gsap.utils.selector(svg)
  const fio = $('.fio')[0]
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

  intro.from($('.sol'), { y: 70, autoAlpha: 0, duration: 1.5 }, 0)
  intro.from($('.predio2'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'back.out(1.1)' }, 0.1)
  intro.from($('.torre'), { scaleY: 0, transformOrigin: '50% 100%', duration: 1.0, ease: 'back.out(1.1)' }, 0.25)
  intro.from($('.escola-corpo'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.85, ease: 'back.out(1.3)' }, 0.5)
  intro.from($('.escola-bandeira'), { y: 20, autoAlpha: 0, duration: 0.5 }, 1.2)
  intro.from($('.janela-torre'), { attr: { fill: '#4f8b93' }, duration: 0.4, stagger: { each: 0.07, from: 'random' } }, 1.0)

  // o fio liga os dois lados e o aperto de mãos acende no meio
  intro.fromTo(fio, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut' }, 1.7)
  intro.from($('.fluxo'), { autoAlpha: 0, duration: 0.6 }, 2.6)
  intro.from($('.selo-aperto'), { scale: 0, transformOrigin: '50% 50%', duration: 0.75, ease: 'back.out(2.3)' }, 2.5)
  intro.from($('.aperto'), { scale: 0.4, rotation: -12, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' }, 2.85)

  // o termo sobe, é assinado e selado
  intro.from($('.contrato'), { y: 100, autoAlpha: 0, rotation: -8, duration: 0.95, ease: 'back.out(1.25)' }, 3.5)
  intro.from($('.assinatura'), { drawSVG: '0%', duration: 1.3, ease: 'power1.inOut' }, 4.45)
  intro.from($('.selo'), { scale: 2.8, rotation: -35, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.55, ease: 'back.out(1.7)' }, 5.85)
  intro.fromTo($('.selo-onda'), { scale: 1, autoAlpha: 0.7, transformOrigin: '50% 50%' }, { scale: 2.6, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 5.95)

  // e a parceria vira projeto: os painéis solares nascem no telhado da escola
  intro.from($('.painel'), { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: { each: 0.07, from: 'start' }, ease: 'back.out(2.4)' }, 6.5)

  // laços sem fim: o fluxo do fio, as ondas do aperto, o pisca da antena e as moedas
  const ambiente = ambienteBase(svg)
  ambiente.to($('.fluxo'), { strokeDashoffset: -160, duration: 5, ease: 'none', repeat: -1 }, 0)
  $('.anel-onda').forEach((a, i) => ambiente.fromTo(a, { scale: 1, autoAlpha: 0.7, transformOrigin: '50% 50%' }, { scale: 2.1, autoAlpha: 0, duration: 2.4, ease: 'power1.out', repeat: -1, delay: i * 1.2 + 2.8 }, 0))
  ambiente.to($('.antena'), { autoAlpha: 0.15, duration: 0.7, ease: 'steps(1)', repeat: -1, yoyo: true }, 0)

  // uma moeda a cada 0,5 s, do fio da empresa ao da escola; um tween só comanda todas (posição e transparência)
  const moedas = $('.moeda')
  const total = fio.getTotalLength()
  const estado = { t: 0 }
  ambiente.fromTo(
    estado,
    { t: 0 },
    {
      t: 1,
      duration: 4.2,
      ease: 'none',
      repeat: -1,
      delay: 3.2,
      onUpdate() {
        moedas.forEach((m, i) => {
          const u = (estado.t + i / moedas.length) % 1
          const p = fio.getPointAtLength(u * total)
          const entra = Math.min(1, u / 0.1)
          const sai = Math.min(1, (1 - u) / 0.12)
          gsap.set(m, { x: p.x, y: p.y, autoAlpha: Math.min(entra, sai), scale: 0.75 + 0.25 * Math.min(entra, sai) })
        })
      },
    },
    0,
  )
  return { intro, ambiente }
}
