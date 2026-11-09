import { memo, useLayoutEffect, useRef } from 'react'
import { iniciarCampo } from '../lib/campo'
import './CampoMagnetico.css'

/*
  CTA Campo Magnético — © 2026 Upward Creative Academy. Todos os direitos reservados.
  Licença: uso liberado em projetos próprios e de clientes; proibido revender,
  redistribuir ou publicar este código (original ou modificado) como template,
  kit, curso ou produto. Aqui ele foi portado de HTML para React e adaptado ao
  CANOPA (paleta, tipografia, textos); a física do campo é a do componente original.

  A dobra inteira é uma grade de traços finos, como limalha de ferro, todos
  apontando para o botão no centro. Perto dele os traços crescem, se curvam e
  esquentam (verde-petróleo → turquesa → dourado do sol); longe, ficam calmos.
  O mouse (ou o dedo arrastando) é um segundo ímã; clicar no fundo solta uma onda.
  Sem ninguém mexer, um ímã invisível passeia em volta do botão (piloto
  automático) e, de tempos em tempos, o botão manda uma onda.
*/

// texto do anel que gira em volta do botão (o lema da marca)
const ANEL = 'ENERGIA QUE CONECTA · IMPACTO QUE ILUMINA · '.split('')

function CampoMagnetico({ href = '#formulario' }) {
  const raiz = useRef(null)
  const canvas = useRef(null)
  const botao = useRef(null)
  const palco = useRef(null)
  const rotulo = useRef(null)
  const pausa = useRef(null)
  const pausaTxt = useRef(null)

  useLayoutEffect(
    () =>
      iniciarCampo({
        root: raiz.current,
        canvas: canvas.current,
        botao: botao.current,
        palco: palco.current,
        rotulo: rotulo.current,
        pausa: pausa.current,
        pausaTxt: pausaTxt.current,
      }),
    [],
  )

  return (
    <section ref={raiz} className="campo" data-grade="26" aria-labelledby="campo-titulo">
      <canvas ref={canvas} className="campo-cv" aria-hidden="true" />
      <div className="campo-in">
        <p className="campo-eye campo-r">Vamos conversar</p>
        <h2 id="campo-titulo" className="campo-title campo-r" style={{ '--campo-d': 1 }}>
          Boas parcerias se atraem. <em>Comece a sua.</em>
        </h2>
        <div ref={palco} className="campo-stage">
          <span className="campo-ring" aria-hidden="true">
            {ANEL.map((ch, i) => (
              <b key={i} style={{ transform: `rotate(${((i * 360) / ANEL.length).toFixed(2)}deg)` }}>{ch}</b>
            ))}
          </span>
          <a ref={botao} className="campo-cta" href={href}>
            <span ref={rotulo} className="campo-lbl">
              <span className="campo-l1">Quero</span>
              <span className="campo-l2">participar</span>
              <span className="campo-arr" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </span>
          </a>
        </div>
        <ul className="campo-trust campo-r" style={{ '--campo-d': 3 }}>
          <li>Para empresas e instituições</li>
          <li>Acompanhamento e transparência</li>
          <li>Projeto em desenvolvimento</li>
        </ul>
      </div>
      <button ref={pausa} className="campo-pause" type="button" aria-pressed="false" aria-label="Pausar animação">
        <svg className="campo-ipa" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx="1" /><rect x="7.4" y="1.5" width="2.6" height="9" rx="1" /></svg>
        <svg className="campo-ipl" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1l-7-4.4a.6.6 0 0 0-.9.5z" /></svg>
        <span ref={pausaTxt}>Pausar</span>
      </button>
    </section>
  )
}

export default memo(CampoMagnetico)
