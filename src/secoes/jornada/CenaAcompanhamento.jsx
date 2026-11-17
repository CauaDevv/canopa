import { Leaf } from 'lucide-react'
import { gsap } from '../../lib/animacao'
import { ambienteBase, contar } from '../../lib/cena'
import { Cena, Escola, Estrela } from './Pecas'

/*
  03 · ACOMPANHAMENTO — a escola já gera energia. O sol bate nos painéis, a energia vira dado e viaja
  até o painel de acompanhamento, onde o contador sobe e as barras da semana crescem. O CO₂ evitado
  usa o mesmo fator do simulador do site (38,5 g por kWh): 128 kWh ≈ 4,9 kg.
*/

const DADOS = 'M244 262 C306 262 328 214 374 204'
const BARRAS = [46, 62, 54, 78, 70, 96, 112] // altura de cada dia; o último é hoje
const DIAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export default function CenaAcompanhamento() {
  return (
    <Cena rotulo="Ilustração: os painéis solares da escola recebem a luz do sol e um painel de acompanhamento mostra a energia gerada, o CO₂ evitado e a geração dos últimos sete dias." sol={[124, 80]} nuvens={[[300, 52, 0.9], [560, 34, 0.55], [196, 168, 0.6]]}>
      <g className="raios-sol" stroke="#ffd98a" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 9" opacity=".8">
        <line x1="126" y1="112" x2="88" y2="250" />
        <line x1="134" y1="116" x2="150" y2="250" />
        <line x1="146" y1="110" x2="214" y2="250" />
      </g>

      <Escola x={34} y={216} escala={1.2} paineis />

      {/* da escola ao painel: a energia vira dado */}
      <path className="dados-base" d={DADOS} stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" fill="none" opacity=".8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} className="dado" r="5" fill="#f4be69" stroke="#fff" strokeWidth="1.6" opacity="0" />
      ))}

      {/* o painel de acompanhamento */}
      <g transform="translate(372 62)">
        <g className="painel-dados">
          <rect x="7" y="13" width="236" height="306" rx="22" fill="#07535c" opacity=".16" />
          <rect width="236" height="306" rx="22" fill="#fff" stroke="#d4ebe9" />
          <text x="22" y="34" fill="#3d868f" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="800" letterSpacing="1.6">GERAÇÃO HOJE</text>
          <circle className="ao-vivo" cx="188" cy="30" r="4" fill="#3f9d6e" />
          <text x="196" y="34" fill="#3d868f" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="700">ao vivo</text>
          <text className="kwh" x="22" y="84" fill="#07535c" fontFamily="'Barlow Condensed', sans-serif" fontSize="50" fontWeight="500" letterSpacing="1">128</text>
          <text x="98" y="84" fill="#3d868f" fontFamily="'DM Sans', sans-serif" fontSize="15" fontWeight="700">kWh</text>

          <g className="chip-co2">
            <rect x="22" y="98" width="192" height="34" rx="17" fill="#eaf7f4" />
            <circle cx="40" cy="115" r="11" fill="#3f9d6e" />
            <Leaf x={33} y={108} width={14} height={14} color="#fff" strokeWidth={2.2} />
            <text x="58" y="119" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="11.5" fontWeight="700">CO₂ evitado</text>
            <text x="204" y="119" textAnchor="end" fill="#3f9d6e" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="800">4,9 kg</text>
          </g>

          <text x="22" y="164" fill="#07535c" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="800">Últimos 7 dias</text>
          <line x1="22" y1="272" x2="214" y2="272" stroke="#cde5e3" strokeWidth="1.5" />
          <line x1="22" y1="228" x2="214" y2="228" stroke="#e6f1f0" strokeWidth="1" />
          {BARRAS.map((h, i) => (
            <g key={i}>
              <rect className={`barra b${i}`} x={30 + i * 26.5} y={272 - h} width="16" height={h} rx="4" fill={i === 6 ? '#f4be69' : '#9fdde3'} />
              <text x={38 + i * 26.5} y="288" textAnchor="middle" fill="#7a9a9d" fontFamily="'DM Sans', sans-serif" fontSize="9.5" fontWeight="700">{DIAS[i]}</text>
            </g>
          ))}
          <text className="hoje" x="214" y="152" textAnchor="end" fill="#b9781a" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="800">hoje</text>
        </g>
      </g>

      <Estrela x={288} y={150} r={7} />
      <Estrela x={620} y={170} r={6} />
      <Estrela x={330} y={344} r={5} />
    </Cena>
  )
}

export function animar(svg) {
  const $ = gsap.utils.selector(svg)
  const base = $('.dados-base')[0]
  const kwh = $('.kwh')[0]
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

  intro.from($('.sol'), { y: 70, autoAlpha: 0, duration: 1.5 }, 0)
  intro.from($('.escola-corpo'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, ease: 'back.out(1.2)' }, 0.15)
  intro.from($('.escola-bandeira'), { y: 24, autoAlpha: 0, duration: 0.5 }, 1.0)
  intro.from($('.janela-escola'), { attr: { fill: '#3a8f99' }, duration: 0.5, stagger: 0.1 }, 1.0)

  // os painéis solares chegam ao telhado, fileira por fileira
  intro.from($('.painel'), { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.45, stagger: 0.08, ease: 'back.out(2.2)' }, 1.5)
  intro.from($('.raios-sol line'), { autoAlpha: 0, duration: 0.6, stagger: 0.18 }, 2.3)

  // o dado viaja até o painel de acompanhamento
  intro.from(base, { autoAlpha: 0, duration: 0.7 }, 2.6) // pontilhado: o DrawSVG trocaria o tracejado por uma linha cheia
  intro.from($('.painel-dados'), { x: 110, y: 20, rotation: 4, autoAlpha: 0, duration: 1.0, ease: 'back.out(1.25)' }, 2.9)
  intro.add(contar(kwh, 128, { duracao: 1.8 }), 3.9)
  intro.from($('.barra'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.1, ease: 'back.out(1.5)' }, 4.1)
  intro.from($('.chip-co2'), { x: -30, autoAlpha: 0, duration: 0.6 }, 4.2)
  intro.from($('.hoje'), { autoAlpha: 0, y: 6, duration: 0.4 }, 5.0)

  const ambiente = ambienteBase(svg)
  ambiente.to($('.raios-sol line'), { strokeDashoffset: -26, duration: 1.4, ease: 'none', repeat: -1 }, 0)
  ambiente.to($('.painel-brilho'), { opacity: 0.5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.12 }, 0)
  ambiente.to($('.ao-vivo'), { autoAlpha: 0.2, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
  ambiente.to($('.barra.b6'), { attr: { fill: '#ffd98a' }, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0) // só a cor: a altura é do crescimento

  // os pontinhos de dado correm da escola ao painel (um tween só comanda todos)
  const pontos = $('.dado')
  const total = base.getTotalLength()
  const estado = { t: 0 }
  ambiente.fromTo(
    estado,
    { t: 0 },
    {
      t: 1,
      duration: 2.4,
      ease: 'none',
      repeat: -1,
      delay: 3.3,
      onUpdate() {
        pontos.forEach((d, i) => {
          const u = (estado.t + i / pontos.length) % 1
          const p = base.getPointAtLength(u * total)
          const v = Math.min(1, u / 0.12, (1 - u) / 0.12)
          gsap.set(d, { x: p.x, y: p.y, autoAlpha: v })
        })
      },
    },
    0,
  )
  return { intro, ambiente }
}
