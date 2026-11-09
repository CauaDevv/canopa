import { memo, useLayoutEffect, useRef } from 'react'
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

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

function lerCor(cor, padrao) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(cor || '').trim())
  if (!m) return padrao
  let h = m[1]
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1')
  h = parseInt(h, 16)
  return [h >> 16, (h >> 8) & 255, h & 255]
}

function CampoMagnetico({ href = '#formulario', aoClicar }) {
  const raiz = useRef(null)
  const canvas = useRef(null)
  const botao = useRef(null)
  const palco = useRef(null)
  const rotulo = useRef(null)
  const pausa = useRef(null)
  const pausaTxt = useRef(null)
  // o clique do botão é tratado fora do efeito (o efeito só cuida do canvas)
  const clique = useRef(aoClicar)
  clique.current = aoClicar

  useLayoutEffect(() => {
    const root = raiz.current
    const cv = canvas.current
    const cta = botao.current
    const stage = palco.current
    const lbl = rotulo.current
    const pauseB = pausa.current
    const pauseT = pausaTxt.current
    const ctx = cv && cv.getContext && cv.getContext('2d')
    if (!ctx || !cta || !stage) return // sem canvas: fica a grade de pontos do CSS, parada

    const mm = (q) => !!(window.matchMedia && window.matchMedia(q).matches)
    // a classe esconde os itens de entrada ANTES da primeira pintura (layout effect), sem piscar
    root.classList.add('campo-js')

    const still = mm('(prefers-reduced-motion: reduce)')
    const coarse = mm('(pointer: coarse)')
    const cs = getComputedStyle(root)
    const FAR = lerCor(cs.getPropertyValue('--campo-far'), [43, 100, 112])
    const H1 = lerCor(cs.getPropertyValue('--campo-hot1'), [4, 183, 199])
    const H2 = lerCor(cs.getPropertyValue('--campo-hot2'), [249, 202, 120])
    const GAP = clamp(parseFloat(root.getAttribute('data-grade')) || 26, 16, 60) * (coarse ? 1.15 : 1)

    // 7 tons do verde-petróleo (longe) ao dourado (perto): os traços são desenhados em lotes por tom
    const TONES = []
    for (let t = 0; t < 7; t++) {
      const f = t / 6
      const A = f < 0.5 ? FAR : H1
      const B = f < 0.5 ? H1 : H2
      const u = f < 0.5 ? f / 0.5 : (f - 0.5) / 0.5
      TONES.push(
        `rgb(${Math.round(A[0] + (B[0] - A[0]) * u)},${Math.round(A[1] + (B[1] - A[1]) * u)},${Math.round(A[2] + (B[2] - A[2]) * u)})`,
      )
    }

    let W = 1, H = 1, dpr = 1, BX = 0, BY = 0, BR = 120, N = 0
    let X, Y, ANG, AV, LEN
    let raf = 0, last = 0, clock = 0
    let visible = false, entered = false, paused = false, openAt = 1e9, hover = false, hv = 0
    let px = -1e4, py = -1e4, pOn = 0, ptrT = -1e9, down = null, nextWave = 3, gx = 0, gy = 0, bx = 0, by = 0
    const waves = []
    const timers = []

    function measure() {
      const rr = root.getBoundingClientRect()
      const sr = stage.getBoundingClientRect()
      W = Math.max(1, rr.width)
      H = Math.max(1, rr.height)
      BX = sr.left - rr.left + sr.width / 2
      BY = sr.top - rr.top + sr.height / 2
      BR = stage.offsetWidth / 2
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      const cols = Math.ceil(W / GAP) + 1
      const rows = Math.ceil(H / GAP) + 1
      const ox = (W - (cols - 1) * GAP) / 2
      const oy = (H - (rows - 1) * GAP) / 2
      let i = 0
      N = cols * rows
      X = new Float32Array(N); Y = new Float32Array(N); ANG = new Float32Array(N); AV = new Float32Array(N); LEN = new Float32Array(N)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          X[i] = ox + c * GAP
          Y[i] = oy + r * GAP
          ANG[i] = Math.atan2(BY - Y[i], BX - X[i])
          i++
        }
      }
      if (!raf) draw(1)
    }

    // campo: o botão atrai sempre; o ponteiro é um segundo ímã; ondas empurram
    function draw(dt) {
      const open = still ? 1 : clamp((clock - openAt) / 1.6, 0, 1)
      const e = 1 - Math.pow(1 - open, 3)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (e <= 0) return
      const qb = 1 + 1.6 * hv
      const qp = 0.9 * pOn
      const rad = BR * 0.9
      const paths = []
      for (let k = 0; k < 7; k++) paths.push([])
      const kk = still ? 1 : 1 - Math.exp(-dt * 9)
      for (let i = 0; i < N; i++) {
        const x = X[i], y = Y[i]
        const dx = BX - x, dy = BY - y
        const d2 = dx * dx + dy * dy
        const d = Math.sqrt(d2) || 1
        if (d < rad) continue // atrás do botão
        const s = (qb * BR * BR) / d2
        let fx = (dx / d) * s, fy = (dy / d) * s, st = s
        if (qp > 0.01) {
          // o ponteiro manda perto dele
          const ex = px - x, ey = py - y
          const ed = Math.sqrt(ex * ex + ey * ey + 400)
          const sp = qp * Math.pow(150 / ed, 3)
          fx += (ex / ed) * sp
          fy += (ey / ed) * sp
          st += Math.min(1.2, sp) * 0.8
        }
        let push = 0
        for (let k = 0; k < waves.length; k++) {
          const wv = waves[k]
          const wx = x - wv.x, wy = y - wv.y
          const wd = Math.sqrt(wx * wx + wy * wy) || 1
          const distAnel = wd - wv.r
          const g = Math.exp((-distAnel * distAnel) / 1800) * wv.a
          if (g > 0.01) {
            fx += (wx / wd) * g * 2.4
            fy += (wy / wd) * g * 2.4
            push += g
          }
        }
        const ta = Math.atan2(fy, fx)
        let da = ta - ANG[i]
        da = da - Math.round(da / 6.2832) * 6.2832 // caminho mais curto
        if (still) ANG[i] = ta
        else {
          AV[i] += (da * 120 - AV[i] * 14) * Math.min(0.034, dt)
          ANG[i] += AV[i] * Math.min(0.034, dt)
        }
        const str = Math.min(1, st * 1.1 + push * 0.8)
        const len = (3 + 11 * str + push * 6) * e
        LEN[i] += (len - LEN[i]) * kk
        const L = LEN[i]
        const ca = (Math.cos(ANG[i]) * L) / 2, sa = (Math.sin(ANG[i]) * L) / 2
        const pull = Math.min(7, str * 7 + push * 5) * e
        const cxp = x + (dx / d) * pull, cyp = y + (dy / d) * pull
        const k = Math.min(6, Math.floor(str * 6.99))
        paths[k].push(cxp - ca, cyp - sa, cxp + ca, cyp + sa)
      }
      ctx.lineCap = 'round'
      for (let k = 0; k < 7; k++) {
        const P = paths[k]
        if (!P.length) continue
        ctx.strokeStyle = TONES[k]
        ctx.globalAlpha = (0.55 + k * 0.075) * e
        ctx.lineWidth = 1.1 + k * 0.16
        ctx.beginPath()
        for (let i = 0; i < P.length; i += 4) {
          ctx.moveTo(P[i], P[i + 1])
          ctx.lineTo(P[i + 2], P[i + 3])
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    function wave(x, y) {
      if (waves.length < 4) waves.push({ x, y, r: 0, a: 1 })
    }

    function step(dt, now) {
      const idle = now - ptrT > 2600 && !down
      // piloto automático: um ímã invisível passeia em volta do botão
      const tx = idle ? BX + Math.cos(clock * 0.55) * BR * 2.1 : px
      const ty = idle ? BY + Math.sin(clock * 0.83) * BR * 1.15 : py
      if (idle) {
        const k = 1 - Math.exp(-dt * 2)
        gx += (tx - gx) * k
        gy += (ty - gy) * k
        px = gx
        py = gy
      } else {
        gx = px
        gy = py
      }
      pOn += ((idle ? 0.75 : 1) - pOn) * (1 - Math.exp(-dt * 3))
      hv += ((hover ? 1 : 0) - hv) * (1 - Math.exp(-dt * (hover ? 4 : 2.5)))
      if (idle && clock > nextWave) {
        wave(BX, BY)
        nextWave = clock + 5.5
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]
        w.r += dt * 520
        w.a = Math.max(0, 1 - w.r / Math.max(W, H))
        if (w.a <= 0) waves.splice(i, 1)
      }
    }

    const canRun = () => visible && entered && !paused && !still && !document.hidden

    function frame(now) {
      raf = 0
      if (!canRun()) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      clock += dt
      step(dt, now)
      draw(dt)
    }
    const start = () => {
      if (!raf && canRun()) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // ponteiro: ímã; perto do botão ele é puxado (e o texto ainda mais)
    function local(e) {
      const r = root.getBoundingClientRect()
      px = e.clientX - r.left
      py = e.clientY - r.top
      ptrT = performance.now()
    }
    function magnet() {
      const dx = px - BX, dy = py - BY
      const d = Math.sqrt(dx * dx + dy * dy)
      const R = BR * 1.9
      const k = d < R ? Math.pow(1 - d / R, 0.7) : 0
      const nx = Math.round(dx * 0.18 * k), ny = Math.round(dy * 0.18 * k)
      if (nx === bx && ny === by) return
      bx = nx
      by = ny
      cta.style.setProperty('--campo-bx', bx + 'px')
      cta.style.setProperty('--campo-by', by + 'px')
      if (lbl) {
        lbl.style.setProperty('--campo-lx', Math.round(bx * 0.5) + 'px')
        lbl.style.setProperty('--campo-ly', Math.round(by * 0.5) + 'px')
      }
      cta.style.setProperty('--campo-ca', (Math.atan2(dy, dx) * 57.3).toFixed(0) + 'deg')
    }

    const aoMover = (e) => {
      if (e.pointerType === 'mouse' && e.movementX === 0 && e.movementY === 0) return
      if (e.pointerType !== 'mouse' && !down) return
      local(e)
      if (e.pointerType === 'mouse' && !still) magnet()
      if (still) draw(1)
    }
    const aoSair = (e) => {
      if (e.pointerType !== 'mouse') return
      ptrT = performance.now() - 2000
      bx = by = 0
      cta.style.setProperty('--campo-bx', '0px')
      cta.style.setProperty('--campo-by', '0px')
      if (lbl) {
        lbl.style.setProperty('--campo-lx', '0px')
        lbl.style.setProperty('--campo-ly', '0px')
      }
    }
    const aoPressionar = (e) => {
      if (e.target.closest && e.target.closest('a, button')) return
      local(e)
      down = { x: e.clientX, y: e.clientY }
      if (e.pointerType === 'mouse' && e.button === 0 && raf) wave(px, py)
    }
    const aoSoltar = (e) => {
      if (down && e.type === 'pointerup' && e.pointerType !== 'mouse' && raf && Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) < 12) {
        local(e)
        wave(px, py)
      }
      down = null
    }
    const aoEntrarBotao = (e) => { if (e.pointerType === 'mouse') hover = true }
    const aoSairBotao = () => { hover = false }
    const aoFocar = () => {
      let v = true
      try { v = cta.matches(':focus-visible') } catch (x) { /* navegador sem :focus-visible */ }
      if (v) hover = true
    }
    const aoDesfocar = () => { hover = false }
    const aoPausar = () => {
      paused = !paused
      root.classList.toggle('campo-live', visible && !paused && !still)
      pauseB.setAttribute('aria-pressed', String(paused))
      pauseB.setAttribute('aria-label', paused ? 'Retomar animação' : 'Pausar animação')
      if (pauseT) pauseT.textContent = paused ? 'Retomar' : 'Pausar'
      if (paused) {
        stop()
        if (clock - openAt < 1.6) {
          openAt = clock - 2
          draw(1)
        }
      } else start()
    }
    const aoVisibilidade = () => (document.hidden ? stop() : start())

    root.addEventListener('pointermove', aoMover, { passive: true })
    root.addEventListener('pointerleave', aoSair, { passive: true })
    root.addEventListener('pointerdown', aoPressionar, { passive: true })
    root.addEventListener('pointerup', aoSoltar, { passive: true })
    root.addEventListener('pointercancel', aoSoltar, { passive: true })
    cta.addEventListener('pointerenter', aoEntrarBotao)
    cta.addEventListener('pointerleave', aoSairBotao)
    cta.addEventListener('focus', aoFocar)
    cta.addEventListener('blur', aoDesfocar)
    if (pauseB) pauseB.addEventListener('click', aoPausar)
    document.addEventListener('visibilitychange', aoVisibilidade)

    let ro = null
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => measure())
      ro.observe(root)
    } else window.addEventListener('resize', measure)
    measure()

    let io = null
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(
        (en) => {
          for (let i = 0; i < en.length; i++) {
            if (en[i].isIntersecting && en[i].intersectionRatio > 0.15 && !entered) {
              entered = true
              root.classList.add('campo-go')
              openAt = clock + 0.2
              nextWave = clock + 2.4
              timers.push(setTimeout(measure, 1800)) // posição final do botão, depois da entrada
              if (still) draw(1)
            }
          }
          visible = en[en.length - 1].isIntersecting
          root.classList.toggle('campo-live', visible && !paused && !still)
          if (visible) start()
          else stop()
        },
        { threshold: [0, 0.15, 0.3] },
      )
      io.observe(root)
    } else {
      visible = entered = true
      root.classList.add('campo-go')
      openAt = 0
      start()
    }

    return () => {
      stop()
      timers.forEach(clearTimeout)
      io && io.disconnect()
      ro && ro.disconnect()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', aoVisibilidade)
      root.removeEventListener('pointermove', aoMover)
      root.removeEventListener('pointerleave', aoSair)
      root.removeEventListener('pointerdown', aoPressionar)
      root.removeEventListener('pointerup', aoSoltar)
      root.removeEventListener('pointercancel', aoSoltar)
      cta.removeEventListener('pointerenter', aoEntrarBotao)
      cta.removeEventListener('pointerleave', aoSairBotao)
      cta.removeEventListener('focus', aoFocar)
      cta.removeEventListener('blur', aoDesfocar)
      if (pauseB) pauseB.removeEventListener('click', aoPausar)
      root.classList.remove('campo-js', 'campo-go', 'campo-live')
    }
  }, [])

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
          <a ref={botao} className="campo-cta" href={href} onClick={(e) => clique.current && clique.current(e)}>
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
