import { gsap } from '../../lib/animacao'
import { ambienteBase, seguirCaminho } from '../../lib/cena'
import { Arvore, Cena, Escola, Estrela } from './Pecas'

/*
  01 · INSCRIÇÃO — a escola preenche o formulário do projeto. O sol nasce atrás da escola, o
  formulário entra, três campos são digitados (um lápis escreve) e cada um é confirmado; o botão
  vira "Enviado" e um aviãozinho de papel leva a inscrição embora.
*/

const FX = 346 // canto do formulário na cena
const FY = 60
const CAMPOS = [
  { y: 84, rotulo: 74, texto: 120 },
  { y: 146, rotulo: 58, texto: 92 },
  { y: 208, rotulo: 90, texto: 138 },
]
const VOO = 'M471 344 C520 318 568 258 580 192 S604 90 700 14'

export default function CenaInscricao() {
  return (
    <Cena rotulo="Ilustração: uma escola preenche o formulário de inscrição do projeto no computador e envia." sol={[150, 96]} nuvens={[[262, 54, 0.9], [588, 40, 0.6], [44, 176, 0.7]]}>
      <Arvore x={46} escala={1.1} />
      <Escola x={78} y={246} />

      {/* aviso sobre a escola */}
      <g className="aviso-env">
        <path d="M168 206 L178 226 L190 206Z" fill="#07535c" />
        <rect x="92" y="170" width="184" height="38" rx="19" fill="#07535c" />
        <circle cx="116" cy="189" r="9" fill="#f4be69" />
        <path d="M111.5 189.5 l3.2 3.4 l5.6 -6.4" stroke="#07404a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="132" y="194" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="700">Inscrição enviada</text>
      </g>

      {/* o formulário */}
      <g transform={`translate(${FX} ${FY})`}>
        <g className="formulario">
          <rect x="7" y="13" width="250" height="322" rx="22" fill="#07535c" opacity=".16" />
          <rect width="250" height="322" rx="22" fill="#fff" stroke="#d4ebe9" />
          <rect x="90" y="-11" width="70" height="26" rx="9" fill="#f4be69" />
          <rect x="104" y="-5" width="42" height="9" rx="4.5" fill="#d99a3a" />
          <text x="24" y="52" fill="#07535c" fontFamily="'Barlow Condensed', sans-serif" fontSize="25" fontWeight="500" letterSpacing="2.6">INSCRIÇÃO</text>
          <rect x="24" y="62" width="58" height="3.5" rx="1.75" fill="#f4be69" />
          <circle cx="216" cy="44" r="9" fill="#f9ca78" />
          <path d="M209 47 a7 7 0 0 1 14 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />

          {CAMPOS.map((c, i) => (
            <g key={i}>
              <rect className={`rotulo r${i}`} x="24" y={c.y} width={c.rotulo} height="7" rx="3.5" fill="#b5d3d5" />
              <rect x="24" y={c.y + 13} width="202" height="32" rx="9" fill="#eef8f7" stroke="#cde5e3" />
              <rect className={`digita d${i}`} x="36" y={c.y + 25} width={c.texto} height="8" rx="4" fill="#0a7480" />
              <g className={`ok o${i}`} transform={`translate(205 ${c.y + 29})`}>
                <circle r="10" fill="#05adba" />
                <path className={`ok-traco t${i}`} d="M-4.6 0.4 L-1.3 3.9 L4.8 -3.6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </g>
          ))}

          <g className="botao-env">
            <rect className="botao-fundo" x="24" y="274" width="202" height="38" rx="19" fill="#05adba" />
            <text className="botao-texto1" x="125" y="298" textAnchor="middle" fill="#07404a" fontFamily="'DM Sans', sans-serif" fontSize="13.5" fontWeight="700" opacity="0">Enviar inscrição</text>
            <g className="botao-texto2">
              <text x="132" y="298" textAnchor="middle" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13.5" fontWeight="700">Enviado</text>
              <path d="M82 293 l4.4 4.6 l8 -9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        </g>
      </g>

      {/* rastro e aviãozinho de papel */}
      <path className="voo" d={VOO} stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0" />
      <g className="aviao" opacity="0">
        <path d="M-17 -10 L27 0 L-17 10 L-9 0Z" fill="#fff" stroke="#07535c" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M-9 0 L27 0 L-3 8Z" fill="#cfe6e3" stroke="#07535c" strokeWidth="1.4" strokeLinejoin="round" />
      </g>

      {/* lápis (escreve os campos e sai de cena) */}
      <g className="lapis" opacity="0">
        <path d="M0 0 L13 -5.5 V5.5Z" fill="#f1d5a0" stroke="#c98a2b" strokeWidth="1" strokeLinejoin="round" />
        <path d="M0 0 L4.5 -2 V2Z" fill="#33484d" />
        <rect x="13" y="-5.5" width="38" height="11" fill="#f9ca78" stroke="#c98a2b" strokeWidth="1" />
        <rect x="51" y="-5.5" width="7" height="11" fill="#b9c8cb" />
        <rect x="58" y="-5.5" width="9" height="11" rx="3" fill="#e58a8a" />
      </g>

      <Estrela x={318} y={146} r={8} />
      <Estrela x={612} y={238} r={6} />
      <Estrela x={296} y={332} r={5} />
    </Cena>
  )
}

export function animar(svg) {
  const $ = gsap.utils.selector(svg)
  const lapis = $('.lapis')[0]
  const voo = $('.voo')[0]
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

  // o sol nasce e a escola sobe do chão
  intro.from($('.sol'), { y: 70, autoAlpha: 0, duration: 1.5 }, 0)
  intro.from($('.escola-corpo'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.85, ease: 'back.out(1.3)' }, 0.2)
  intro.from($('.escola-bandeira'), { y: 24, autoAlpha: 0, duration: 0.5 }, 0.95)
  intro.from($('.janela-escola'), { attr: { fill: '#3a8f99' }, duration: 0.5, stagger: 0.12 }, 1.0)
  intro.from($('.arvore'), { scale: 0, transformOrigin: '50% 100%', duration: 0.9, ease: 'back.out(1.6)' }, 0.5)

  // o formulário chega
  intro.from($('.formulario'), { x: 100, y: 24, rotation: 6, autoAlpha: 0, duration: 1.05, ease: 'back.out(1.25)' }, 1.0)

  // três campos: o rótulo aparece, o texto é digitado (passos, como teclas) e a confirmação estala
  CAMPOS.forEach((c, i) => {
    const t0 = 2.1 + i * 1.2
    const yTexto = FY + c.y + 32
    const xFim = FX + 36 + c.texto + 6
    intro.from($(`.r${i}`), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.3 }, t0)
    intro.from($(`.d${i}`), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.85, ease: 'steps(16)' }, t0 + 0.2)
    // o lápis vai até o começo da linha e acompanha o texto
    const antes = CAMPOS[i - 1]
    const de = i === 0 ? { x: FX + 60, y: yTexto - 14, rotation: -36, autoAlpha: 0 } : { x: FX + 36 + antes.texto + 6, y: FY + antes.y + 32 }
    intro.fromTo(lapis, de, { x: FX + 38, y: yTexto, autoAlpha: 1, duration: 0.3 }, t0 - 0.1)
    intro.to(lapis, { x: xFim, duration: 0.85, ease: 'steps(16)' }, t0 + 0.2)
    intro.to(lapis, { y: `+=2.4`, duration: 0.06, repeat: 13, yoyo: true, ease: 'none' }, t0 + 0.2)
    intro.from($(`.o${i}`), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.4)' }, t0 + 1.0)
    intro.from($(`.t${i}`), { drawSVG: '0%', duration: 0.35, ease: 'power2.out' }, t0 + 1.05)
  })
  intro.to(lapis, { x: FX + 290, y: FY + 40, rotation: -8, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 5.75)

  // o botão é apertado e vira "Enviado"
  intro.fromTo($('.botao-fundo'), { attr: { fill: '#f4be69' } }, { attr: { fill: '#05adba' }, duration: 0.3 }, 5.9)
  intro.fromTo($('.botao-texto1'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15 }, 5.9)
  intro.fromTo($('.botao-texto2'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 6.0)
  intro.fromTo($('.botao-env'), { scale: 1 }, { scale: 0.95, transformOrigin: '50% 50%', duration: 0.12, yoyo: true, repeat: 1 }, 5.85)

  // o aviãozinho de papel parte (o rastro de pontos se desenha junto)
  intro.fromTo($('.aviao'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 6.25)
  intro.add(seguirCaminho($('.aviao')[0], voo, { duracao: 1.9, ease: 'power1.in', rotacionar: true }), 6.25)
  intro.fromTo(voo, { drawSVG: '0%', autoAlpha: 0.9 }, { drawSVG: '100%', duration: 1.9, ease: 'power1.in' }, 6.25)
  intro.to(voo, { autoAlpha: 0, duration: 0.7 }, 8.2)
  intro.to($('.aviao'), { autoAlpha: 0, duration: 0.2 }, 8.1)
  intro.from($('.aviso-env'), { scale: 0, transformOrigin: '50% 100%', autoAlpha: 0, duration: 0.55, ease: 'back.out(2.2)' }, 7.0)

  const ambiente = ambienteBase(svg)
  return { intro, ambiente }
}
