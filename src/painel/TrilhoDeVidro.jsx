import { useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react'

/*
  TRILHO DE VIDRO — a lente de vidro líquido do menu do painel.

  Técnica do painel do Acelera Pages (apps/web/src/acelera/TrilhoDeVidro.tsx), adaptada ao
  CANOPA: envolve uma lista de itens (`[data-lente]`) e marca o item ativo com uma pílula de vidro
  com borda iluminada e, no Chromium, refração real do que está por baixo (backdrop-filter com um
  mapa de deslocamento SVG).

  DESEMPENHO (as mesmas regras do original)
  - Só se move quando a seleção muda (clique/rota), nunca no hover.
  - O trajeto é `transform` com transition de CSS (compositor/GPU).
  - A refração cobre só a área da pílula e fica desligada durante o trajeto (`.is-movendo`); o mapa
    é gerado uma vez por tamanho de pílula, num canvas, e reaproveitado.
*/

const ATIVO = '[data-lente][aria-current="page"], [data-lente][data-lente-ativo]'
const DURACAO = 420 // ms, igual ao transition da pílula em painel.css

// refração por SVG em backdrop-filter só renderiza de verdade no Chromium
const REFRATA =
  typeof navigator !== 'undefined' && !!navigator.userAgentData?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand))

const mapas = new Map()
const LENTE_FAIXA = 6 // px de borda refratada
const LENTE_DESLOCA = 4 // px máximos que a borda puxa para dentro

/*
  Mapa de deslocamento de uma pílula w×h com raio r: neutro (128) no miolo e, numa faixa junto à
  borda, puxa a amostra para dentro (o que está sob a borda aparece ampliado e curvado, como numa
  lente). Faixa fina e deslocamento curto: a amostra nunca alcança o texto.
*/
function mapaDaLente(w, h, r) {
  const chave = `${w}x${h}x${r}`
  const pronto = mapas.get(chave)
  if (pronto) return pronto
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(w, h)
  const faixa = Math.min(LENTE_FAIXA, Math.max(3, Math.min(w, h) * 0.2))
  const raio = Math.min(r, w / 2, h / 2)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // distância (negativa = dentro) até o retângulo arredondado
      const px = x + 0.5 - w / 2
      const py = y + 0.5 - h / 2
      const qx = Math.abs(px) - (w / 2 - raio)
      const qy = Math.abs(py) - (h / 2 - raio)
      const fora = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      const d = fora + Math.min(Math.max(qx, qy), 0) - raio
      let nx = 0
      let ny = 0
      const t = Math.min(1, Math.max(0, 1 + d / faixa)) // 0 no miolo, 1 na borda
      if (t > 0) {
        // normal para fora, pela direção de maior proximidade da borda
        if (qx > 0 && qy > 0) {
          nx = Math.sign(px) * qx
          ny = Math.sign(py) * qy
          const n = Math.hypot(nx, ny) || 1
          nx /= n
          ny /= n
        } else if (qx > qy) nx = Math.sign(px)
        else ny = Math.sign(py)
      }
      const forca = t * t // cresce suave até a borda
      const i = (y * w + x) * 4
      img.data[i] = 128 - nx * forca * 127
      img.data[i + 1] = 128 - ny * forca * 127
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const url = c.toDataURL()
  mapas.set(chave, url)
  return url
}

export default function TrilhoDeVidro({ children, className = '', raio = 12, forca = LENTE_DESLOCA, chave }) {
  const id = useId().replace(/:/g, '')
  const filtroId = `lente-${id}`
  const lista = useRef(null)
  const pilula = useRef(null)
  const moldura = useRef(null)
  const imagem = useRef(null)
  const ultima = useRef(null)
  const espera = useRef(undefined)

  const irParaAtivo = useCallback(
    (animar) => {
      const el = lista.current
      const m = moldura.current
      const p = pilula.current
      if (!el || !m || !p) return
      const alvo = el.querySelector(ATIVO)
      if (!alvo) {
        m.classList.add('is-sem-alvo')
        return
      }
      m.classList.remove('is-sem-alvo')
      const r = m.getBoundingClientRect()
      const e = alvo.getBoundingClientRect()
      if (!e.width || !e.height) return
      const c = { x: e.left - r.left, y: e.top - r.top, w: Math.round(e.width), h: Math.round(e.height) }
      const antes = ultima.current
      const mesmoLugar = antes && Math.abs(antes.x - c.x) < 0.5 && Math.abs(antes.y - c.y) < 0.5 && antes.w === c.w && antes.h === c.h
      if (mesmoLugar) return
      const comMovimento = animar && !!antes && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ultima.current = c

      p.style.transition = comMovimento ? '' : 'none'
      p.style.width = `${c.w}px`
      p.style.height = `${c.h}px`
      p.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`
      if (REFRATA && imagem.current) {
        const raioReal = parseFloat(getComputedStyle(p).borderTopLeftRadius) || raio
        imagem.current.setAttribute('width', String(c.w))
        imagem.current.setAttribute('height', String(c.h))
        imagem.current.setAttribute('href', mapaDaLente(c.w, c.h, Math.round(raioReal)))
      }

      window.clearTimeout(espera.current)
      if (!comMovimento) {
        m.classList.remove('is-movendo')
        return
      }
      // trajeto sem refração; ela volta quando a pílula assenta
      m.classList.add('is-movendo')
      espera.current = window.setTimeout(() => {
        m.classList.remove('is-movendo')
        m.classList.add('is-chegou')
        espera.current = window.setTimeout(() => m.classList.remove('is-chegou'), 360)
      }, DURACAO - 40)
    },
    [raio],
  )

  // seleção mudou (clique, rota, aba): a pílula vai até o novo item ativo
  useLayoutEffect(() => {
    irParaAtivo(true)
  }, [chave, irParaAtivo])

  // contêiner mudou de tamanho: reposiciona sem animar
  useEffect(() => {
    const el = lista.current
    if (!el) return
    let quadro = 0
    const obs = new ResizeObserver(() => {
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(() => {
        ultima.current = null
        irParaAtivo(false)
      })
    })
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(quadro)
      window.clearTimeout(espera.current)
    }
  }, [irParaAtivo])

  return (
    <div ref={moldura} className={`trilho-moldura${REFRATA ? ' is-refrata' : ''} ${className}`.trim()} style={{ '--lente-filtro': `url(#${filtroId})`, '--lente-raio': `${raio}px` }}>
      {REFRATA ? (
        <svg className="trilho__defs" width="0" height="0" aria-hidden="true" focusable="false">
          <filter id={filtroId} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feImage ref={imagem} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="mapa" />
            <feDisplacementMap in="SourceGraphic" in2="mapa" scale={Math.min(forca, LENTE_DESLOCA) * 2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      ) : null}
      <div ref={lista} className="trilho">
        {children}
      </div>
      <span ref={pilula} className="trilho__pilula" aria-hidden="true" />
    </div>
  )
}
