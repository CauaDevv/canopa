import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three'
import type { Texture } from 'three'
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ')


/**
 * Corredor infinito em WebGL — o fundo do Hero.
 *
 * Um túnel de grade wireframe que se recicla para sempre: os segmentos que
 * passam por trás da câmera voltam para o fim da fila com fotos novas. A câmera
 * só anda para frente conforme a página rola, então a sensação é de voar pelo
 * corredor enquanto se lê a página.
 *
 * O componente é 100% decorativo (`aria-hidden`) e degrada sozinho:
 *   - `prefers-reduced-motion` → nem inicializa WebGL, cai no fundo estático
 *   - sem suporte a WebGL (ou erro ao criar o contexto) → mesmo fundo estático
 * O fundo estático é gradiente CSS puro: zero download, zero JS.
 */

/* Geometria do corredor -------------------------------------------------- */
const LARGURA = 24
const ALTURA = 16
const PROFUNDIDADE_SEGMENTO = 6
const TOTAL_SEGMENTOS = 14
const COLUNAS = 6 // células no piso e no teto
const FILEIRAS = 4 // células em cada parede
const MARGEM_CELULA = 0.4
const DENSIDADE_NEVOA = 0.035
const OPACIDADE_FOTO = 0.85
const COMPRIMENTO_TOTAL = TOTAL_SEGMENTOS * PROFUNDIDADE_SEGMENTO

/* Chance de uma célula receber foto (o original sorteia por face) */
const CHANCE_PISO_PAREDE = 0.5 // Math.random() > 0.8
const CHANCE_TETO = 0.35 // Math.random() > 0.88

/*
 * As fotos saíram do Unsplash e vieram para `public/images/tunel/`.
 *
 * Não é só higiene de organização: cada foto hotlinkada custava DNS + TLS +
 * conexão a um terceiro no meio do carregamento do hero, e o site ficava
 * dependendo da disponibilidade de um serviço que não é nosso.
 *
 * A qualidade é 45 de propósito. Aqui elas são textura de planos pequenos
 * voando dentro de névoa escura no WebGL — o olho não tem tempo de julgar
 * detalhe. Medido: 600w a q45 pesa 46 KB contra os 71 KB que o Unsplash
 * entregava a q80. Em foto de vitrine, que o leitor encara parada, a
 * qualidade é bem mais alta (ver `public/images/vitrine/`).
 */
const FOTOS_PADRAO = Array.from(
  { length: 9 },
  (_, i) => `/images/tunel/moda-${String(i + 1).padStart(2, '0')}.avif`,
)

type PlanoFoto = Mesh<PlaneGeometry, MeshBasicMaterial>

/** Arestas longitudinais do piso/teto + linhas intermediárias das paredes. */
function criarGeometriaGrade() {
  const pontos: number[] = []
  const meiaLargura = LARGURA / 2
  const meiaAltura = ALTURA / 2
  const fundo = -PROFUNDIDADE_SEGMENTO

  for (let coluna = 0; coluna <= COLUNAS; coluna += 1) {
    const x = -meiaLargura + (coluna * LARGURA) / COLUNAS
    pontos.push(x, -meiaAltura, 0, x, -meiaAltura, fundo)
    pontos.push(x, meiaAltura, 0, x, meiaAltura, fundo)
  }

  for (let fileira = 1; fileira < FILEIRAS; fileira += 1) {
    const y = -meiaAltura + (fileira * ALTURA) / FILEIRAS
    pontos.push(-meiaLargura, y, 0, -meiaLargura, y, fundo)
    pontos.push(meiaLargura, y, 0, meiaLargura, y, fundo)
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new Float32BufferAttribute(pontos, 3))
  return geometria
}

/** O retângulo frontal do segmento — o "anel" que marca o ritmo do corredor. */
function criarGeometriaAnel() {
  const x = LARGURA / 2
  const y = ALTURA / 2
  const geometria = new BufferGeometry()
  geometria.setAttribute(
    'position',
    new Float32BufferAttribute(
      [-x, -y, 0, x, -y, 0, x, -y, 0, x, y, 0, x, y, 0, -x, y, 0, -x, y, 0, -x, -y, 0],
      3,
    ),
  )
  return geometria
}

export interface HeroTunnelProps {
  className?: string
  /** Fotos usadas como textura nas paredes. */
  images?: string[]
  /** Cor do fundo e da névoa — o corredor some nela. */
  background?: string
  /** Cor das linhas da grade. */
  gridColor?: string
  /** Cor dos anéis de destaque (o laranja da marca). */
  accentColor?: string
  /** Quanto a câmera anda em Z por pixel de scroll. */
  scrollSpeed?: number
}

export function HeroTunnel({
  className,
  images = FOTOS_PADRAO,
  background = '#d8f3f2',
  gridColor = '#47b6b9',
  accentColor = '#eab451',
  scrollSpeed = 0.05,
}: HeroTunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  // O suporte a WebGL é decidido já na primeira renderização: sem ele, o
  // fundo estático entra direto, sem um frame de canvas vazio.
  const [semWebgl, setSemWebgl] = useState(() => typeof WebGLRenderingContext === 'undefined')

  const estatico = reduceMotion === true || semWebgl

  useEffect(() => {
    if (estatico) return

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
    } catch {
      // contexto recusado (driver bloqueado, contextos demais): cai no estático
      queueMicrotask(() => setSemWebgl(true))
      return
    }

    const medir = () => {
      const { width, height } = container.getBoundingClientRect()
      return { largura: Math.max(1, width), altura: Math.max(1, height) }
    }

    const { largura, altura } = medir()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
    renderer.setSize(largura, altura, false)

    const cena = new Scene()
    const corFundo = new Color(background)
    cena.background = corFundo
    cena.fog = new FogExp2(corFundo.getHex(), DENSIDADE_NEVOA)

    const camera = new PerspectiveCamera(70, largura / altura, 0.1, 1000)
    camera.position.set(0, 0, 0)

    /* Recursos compartilhados por todos os segmentos ---------------------- */
    const geometriaGrade = criarGeometriaGrade()
    const geometriaAnel = criarGeometriaAnel()
    const materialGrade = new LineBasicMaterial({ color: new Color(gridColor), transparent: true, opacity: 0.8 })
    const materialAnel = new LineBasicMaterial({ color: new Color(accentColor), transparent: true, opacity: 0.32 })

    const celulaLargura = LARGURA / COLUNAS
    const celulaAltura = ALTURA / FILEIRAS
    const geometriaHorizontal = new PlaneGeometry(
      celulaLargura - MARGEM_CELULA * 2,
      PROFUNDIDADE_SEGMENTO - MARGEM_CELULA * 2,
    )
    const geometriaVertical = new PlaneGeometry(
      PROFUNDIDADE_SEGMENTO - MARGEM_CELULA * 2,
      celulaAltura - MARGEM_CELULA * 2,
    )

    /* Texturas ------------------------------------------------------------ */
    const carregador = new TextureLoader()
    carregador.setCrossOrigin('anonymous')
    const prontas = new Set<Texture>()
    let desmontado = false
    let solicitarQuadro: () => void = () => undefined
    const texturas = images.map(url =>
      carregador.load(
        url,
        textura => {
          if (desmontado) return
          textura.colorSpace = SRGBColorSpace
          prontas.add(textura)
          solicitarQuadro()
        },
        undefined,
        () => {
          /* foto indisponível: os planos dela ficam invisíveis, sem quebrar a cena */
        },
      ),
    )

    /* Segmentos ----------------------------------------------------------- */
    const emFade = new Set<PlanoFoto>()

    const criarPlano = (geometria: PlaneGeometry) => {
      const textura = texturas[Math.floor(Math.random() * texturas.length)]
      const plano = new Mesh(
        geometria,
        new MeshBasicMaterial({ map: textura, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }),
      )
      emFade.add(plano)
      return plano
    }

    const meiaLargura = LARGURA / 2
    const meiaAltura = ALTURA / 2
    const centroZ = -PROFUNDIDADE_SEGMENTO / 2

    const povoar = (segmento: Group) => {
      let anterior: boolean = false

      // piso e teto: uma célula por coluna
      for (let coluna = 0; coluna < COLUNAS; coluna += 1) {
        const x = -meiaLargura + (coluna + 0.5) * celulaLargura
        const sorteioPiso: boolean = !anterior && Math.random() > 1 - CHANCE_PISO_PAREDE
        if (sorteioPiso) {
          const plano = criarPlano(geometriaHorizontal)
          plano.position.set(x, -meiaAltura + 0.05, centroZ)
          plano.rotation.x = -Math.PI / 2
          segmento.add(plano)
        }
        anterior = sorteioPiso
      }

      anterior = false
      for (let coluna = 0; coluna < COLUNAS; coluna += 1) {
        const x = -meiaLargura + (coluna + 0.5) * celulaLargura
        const sorteioTeto: boolean = !anterior && Math.random() > 1 - CHANCE_TETO
        if (sorteioTeto) {
          const plano = criarPlano(geometriaHorizontal)
          plano.position.set(x, meiaAltura - 0.05, centroZ)
          plano.rotation.x = Math.PI / 2
          segmento.add(plano)
        }
        anterior = sorteioTeto
      }

      // paredes: uma célula por fileira, dos dois lados
      for (const lado of [-1, 1]) {
        anterior = false
        for (let fileira = 0; fileira < FILEIRAS; fileira += 1) {
          const y = -meiaAltura + (fileira + 0.5) * celulaAltura
          const sorteio: boolean = !anterior && Math.random() > 1 - CHANCE_PISO_PAREDE
          if (sorteio) {
            const plano = criarPlano(geometriaVertical)
            plano.position.set(lado * (meiaLargura - 0.05), y, centroZ)
            plano.rotation.y = (-lado * Math.PI) / 2
            segmento.add(plano)
          }
          anterior = sorteio
        }
      }
    }

    const limpar = (segmento: Group) => {
      for (let i = segmento.children.length - 1; i >= 0; i -= 1) {
        const filho = segmento.children[i]
        if (filho instanceof Mesh) {
          const plano = filho as PlanoFoto
          emFade.delete(plano)
          plano.material.dispose()
          segmento.remove(plano)
        }
      }
    }

    const segmentos: Group[] = []
    for (let i = 0; i < TOTAL_SEGMENTOS; i += 1) {
      const segmento = new Group()
      segmento.position.z = -i * PROFUNDIDADE_SEGMENTO
      segmento.add(new LineSegments(geometriaGrade, materialGrade))
      segmento.add(new LineSegments(geometriaAnel, materialAnel))
      povoar(segmento)
      cena.add(segmento)
      segmentos.push(segmento)
    }

    /* Scroll, resize e loop ------------------------------------------------ */
    let alvoZ = -window.scrollY * scrollSpeed
    camera.position.z = alvoZ

    let frame: number | null = null
    let visivel = true

    const loop = () => {
      frame = null

      const distanciaCamera = alvoZ - camera.position.z
      if (Math.abs(distanciaCamera) <= 0.002) {
        camera.position.z = alvoZ
      } else {
        camera.position.z += distanciaCamera * 0.1
      }

      for (const segmento of segmentos) {
        if (segmento.position.z > camera.position.z + PROFUNDIDADE_SEGMENTO) {
          segmento.position.z -= COMPRIMENTO_TOTAL
          limpar(segmento)
          povoar(segmento)
        } else if (segmento.position.z < camera.position.z - COMPRIMENTO_TOTAL + PROFUNDIDADE_SEGMENTO) {
          segmento.position.z += COMPRIMENTO_TOTAL
          limpar(segmento)
          povoar(segmento)
        }
      }

      // Fade das fotos: só começa quando a textura chegou (substitui o GSAP do
      // original). Textura ainda em rede não mantém um RAF ocioso aberto; o
      // callback do loader acorda o render quando ela ficar pronta.
      let fadePendente = false
      for (const plano of emFade) {
        const mapa = plano.material.map
        const alvo = mapa && prontas.has(mapa) ? OPACIDADE_FOTO : 0
        if (alvo === 0) continue

        plano.material.opacity = MathUtils.lerp(plano.material.opacity, alvo, 0.05)
        if (alvo - plano.material.opacity < 0.005) {
          plano.material.opacity = alvo
          emFade.delete(plano)
        } else {
          fadePendente = true
        }
      }

      renderer.render(cena, camera)

      if (camera.position.z !== alvoZ || fadePendente) solicitarQuadro()
    }

    /**
     * O túnel não é um vídeo: depois que câmera e opacidades assentam, o quadro
     * é idêntico ao anterior. Mantê-lo a 60 fps nesse estado consumia uma CPU
     * inteira no topo da landing. Este agendador acorda somente por scroll,
     * resize, textura carregada ou reentrada na viewport.
     */
    solicitarQuadro = () => {
      if (desmontado || !visivel || frame !== null) return
      frame = requestAnimationFrame(loop)
    }

    const aoRolar = () => {
      alvoZ = -window.scrollY * scrollSpeed
      solicitarQuadro()
    }

    const aoRedimensionar = () => {
      const medida = medir()
      camera.aspect = medida.largura / medida.altura
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
      renderer.setSize(medida.largura, medida.altura, false)
      solicitarQuadro()
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !visivel) {
          visivel = true
          solicitarQuadro()
        } else if (!entrada.isIntersecting && visivel) {
          visivel = false
          if (frame !== null) cancelAnimationFrame(frame)
          frame = null
        }
      },
      { rootMargin: '120px' },
    )
    observador.observe(container)

    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRedimensionar)
    solicitarQuadro()

    return () => {
      desmontado = true
      if (frame !== null) cancelAnimationFrame(frame)
      observador.disconnect()
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRedimensionar)

      for (const segmento of segmentos) {
        limpar(segmento)
        cena.remove(segmento)
      }
      for (const textura of texturas) textura.dispose()
      geometriaGrade.dispose()
      geometriaAnel.dispose()
      geometriaHorizontal.dispose()
      geometriaVertical.dispose()
      materialGrade.dispose()
      materialAnel.dispose()
      renderer.dispose()
    }
  }, [accentColor, background, estatico, gridColor, images, scrollSpeed])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('canopa-tunnel', className)}
    >
      <canvas ref={canvasRef} className={cn('tunnel-canvas', estatico && 'hidden')} />
      {/* As camadas do estado estático moram em `hero-tunnel-fundo.tsx` porque
          servem também de ponte enquanto este arquivo (e o three.js junto)
          ainda está sendo baixado. Uma definição só, usada nos dois casos. */}
      
    </div>
  )
}

export default HeroTunnel
