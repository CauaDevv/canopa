import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Leaf } from 'lucide-react'
import SimuladorGrafico from './SimuladorGrafico'
import useAnimado from '../hooks/useAnimado'
import useDicaDeslizar from '../hooks/useDicaDeslizar'
import useQuandoPerto from '../hooks/useQuandoPerto'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { acenderPalavras, revelarBlocos, revelarLinhas, revelarRotulos } from '../lib/revelar'
import { decimal } from '../lib/formatos'
import { CONTA, PREMISSAS, REAJUSTE, REGIAO_INICIAL, REGIOES, calcular, duracao, frase, numero } from '../lib/simulador'
import './Simulador.css'

const ANOS = PREMISSAS.anos
const QUADROS = 36 // quadradinhos da grade de placas (12 × 3)
const TRAJETO_DICA = [4200, 800] // o controle da conta desliza daqui para ali e volta

const progresso = ({ min, max }, valor) => `${(((valor - min) / (max - min)) * 100).toFixed(2)}%`
const NA_TABELA = [0, 5, 10, 15, 20, 25]
const pct = (v) => Math.round(v * 100)

/* Cartão de resultado: separado para que os números rolando (60 quadros/s) não re-renderizem os controles. */
const Resultado = memo(function Resultado({ r }) {
  const alvo = useMemo(() => [r.total, r.custo, r.escala, r.retornoMeses, ...r.acumulado], [r])
  const v = useAnimado(alvo)
  const [lida, setLida] = useState(() => frase(r))

  // leitor de tela: só o resultado em que a pessoa parou, não cada passo do arrasto
  useEffect(() => {
    const espera = window.setTimeout(() => setLida(frase(r)), 700)
    return () => clearTimeout(espera)
  }, [r])

  const por = Math.max(1, Math.ceil(r.placas / QUADROS)) // placas por quadradinho
  const acesos = Math.ceil(r.placas / por)

  return (
    <div className="sim-cartao">
      <p className="sim-topo">
        <span>Economia líquida em {ANOS} anos</span>
        <span>
          Conta nova <b>R$ {numero(r.nova)}</b>/mês
        </span>
      </p>
      <p className="sim-total">
        <small>R$</small>
        {numero(v[0])}
      </p>

      <div className="sim-stats">
        <div>
          <small>Se paga em</small>
          <b>{r.retornoMeses ? duracao(r.retornoMeses) : `mais de ${ANOS} anos`}</b>
        </div>
        <div>
          <small>Investimento</small>
          <b>R$ {numero(r.custo)}</b>
        </div>
        <div>
          <small>Economia / mês</small>
          <b>R$ {numero(r.mes)}</b>
        </div>
      </div>

      <figure className="sim-grafico">
        <figcaption>Economia acumulada por ano, em reais</figcaption>
        <SimuladorGrafico v={v} alvo={r} />
      </figure>

      <div className="sim-placas">
        <p>
          <b>
            {r.placas} {r.placas > 1 ? 'placas' : 'placa'}
          </b>
          de {PREMISSAS.placaW} W · {decimal(r.kwp, 1)} kWp
          {por > 1 && <em>cada quadrado = {por} placas</em>}
        </p>
        <span className="sim-grade" aria-hidden="true">
          {Array.from({ length: QUADROS }, (_, i) => (
            <i key={i} className={i < acesos ? 'aceso' : undefined} style={{ transitionDelay: `${i * 16}ms` }} />
          ))}
        </span>
      </div>

      <p className="sim-co2">
        <Leaf aria-hidden="true" />
        <span>
          <b>{decimal(r.co2, 1)} t</b> de CO<sub>2</sub> evitadas em {ANOS} anos
        </span>
      </p>

      <div className="sim-rodape">
        <a className="sim-cta" href="#contato">
          Quero participar
          <i aria-hidden="true">
            <ArrowRight />
          </i>
        </a>
        <p>Estimativa. O valor exato depende do projeto e da visita técnica.</p>
      </div>

      <details className="sim-detalhes">
        <summary>Ver tabela e premissas</summary>
        <table>
          <caption>Economia acumulada ao longo dos anos</caption>
          <thead>
            <tr>
              <th scope="col">Ano</th>
              <th scope="col">Economia acumulada</th>
            </tr>
          </thead>
          <tbody>
            {NA_TABELA.map((ano) => (
              <tr key={ano}>
                <th scope="row">{ano === 0 ? 'Hoje' : ano}</th>
                <td>R$ {numero(r.acumulado[ano])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul>
          <li>Tarifa de R$ {decimal(PREMISSAS.tarifa, 2)} por kWh, com impostos.</li>
          <li>O sistema cobre {pct(PREMISSAS.cobertura)}% da conta; sempre sobra a taxa mínima.</li>
          <li>Custo de R$ {numero(PREMISSAS.custoKwp)} por kWp instalado, mais {pct(PREMISSAS.manutencao)}% ao ano de manutenção.</li>
          <li>Placas perdem {decimal(PREMISSAS.perdaAnual * 100, 1)}% de produção por ano; rendimento do sistema de {pct(PREMISSAS.rendimento)}%.</li>
          <li>Reajuste da energia de {decimal(r.reajuste, 1)}% ao ano e {decimal(r.hsp, 1)} horas de sol por dia na região.</li>
          <li>CO<sub>2</sub>: {decimal(PREMISSAS.co2PorKwh * 1000, 1)} g por kWh, média da rede elétrica brasileira (MCTI, 2023).</li>
          <li>Valores nominais, com o reajuste somado ano a ano. Não inclui financiamento nem regras específicas da distribuidora.</li>
        </ul>
      </details>

      <p className="sr-only" aria-live="polite">
        {lida}
      </p>
    </div>
  )
})

/*
  Simulador de economia: a pessoa arrasta a conta de luz da instituição e vê, na hora,
  o quanto um projeto solar economizaria em 25 anos, em quanto tempo se paga e o
  tamanho do sistema. É a ponta da "instituição" da história do CANOPA em números; o
  investimento é o que uma empresa parceira apoiaria. Adaptado de um componente
  © 2026 Upward Creative Academy (licença: uso em projetos próprios e de clientes,
  sem revenda), reescrito em React e com o modelo e a paleta do CANOPA.
*/
export default function Simulador() {
  const raiz = useRef(null)
  const controles = useRef(null)
  const tocou = useRef(false)
  const perto = useQuandoPerto(raiz)

  const [conta, setConta] = useState(CONTA.inicial)
  const [regiao, setRegiao] = useState(REGIAO_INICIAL)
  const [reajuste, setReajuste] = useState(REAJUSTE.inicial)

  const hsp = REGIOES.find((g) => g.nome === regiao).hsp
  const r = useMemo(() => calcular({ conta, hsp, reajuste }), [conta, hsp, reajuste])

  // primeira interação real: a dica de movimento sai de cena
  const interagiu = useCallback(() => {
    tocou.current = true
  }, [])
  const deslizar = useCallback((valor) => setConta(Math.round(valor / CONTA.passo) * CONTA.passo), [])
  useDicaDeslizar(controles, { inicial: CONTA.inicial, pontos: TRAJETO_DICA, aplicar: deslizar, tocou })

  // o sol gira devagar só enquanto a seção está na tela
  useEffect(() => {
    const el = raiz.current
    if (!el || !('IntersectionObserver' in window)) return
    const observador = new IntersectionObserver(([e]) => el.classList.toggle('sim--parado', !e.isIntersecting))
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  useGSAP(
    () => {
      if (!perto) return
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        const sec = raiz.current
        const $ = (sel) => sec.querySelector(sel)
        const copia = $('.sim-copia')
        const cartao = $('.sim-cartao')

        revelarRotulos(sec)
        revelarLinhas($('h2'), { gatilho: copia })
        acenderPalavras($('.lead'), { gatilho: copia, atraso: 0.45 })
        revelarBlocos(gsap.utils.toArray('.sim-bloco', sec), { gatilho: $('.sim-bloco'), atraso: 0.6, y: 22, stagger: 0.12 })

        // o cartão sobe como o sol: do horizonte, com o gráfico se abrindo da esquerda para a direita
        gsap
          .timeline({ scrollTrigger: { trigger: cartao, start: 'top 85%', once: true } })
          .from(cartao, { y: 70, autoAlpha: 0, duration: 1.2, ease: 'power3.out', clearProps: 'transform,opacity,visibility' })
          .from(
            cartao.querySelector('.sim-g'),
            { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.4, ease: 'power2.inOut', clearProps: 'clipPath' },
            0.5,
          )
          .from(cartao.querySelectorAll('.sim-stats > div'), { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.1 }, 0.55)
      })
    },
    { scope: raiz, dependencies: [perto] },
  )

  return (
    <section ref={raiz} id="simulador" className="sim section" aria-labelledby="sim-titulo" style={{ '--sim-luz': (hsp / 5.5).toFixed(3) }}>
      <span className="sim-sol" aria-hidden="true" />
      <div className="page-frame sim-grid">
        <div className="sim-copia">
          <span className="section-label"><i /> SIMULADOR DE ECONOMIA</span>
          <h2 id="sim-titulo">
            QUANTO SUA INSTITUIÇÃO PODERIA <span className="acento">ECONOMIZAR?</span>
          </h2>
          <p className="lead">{`Arraste o valor da conta de luz e veja o que um projeto de energia solar pode devolver em ${ANOS} anos.`}</p>
          <p className="sim-aviso">Um exemplo do tipo de resultado que o CANOPA quer acompanhar com transparência.</p>

          <div ref={controles} className="sim-controles" onPointerDown={interagiu} onKeyDown={interagiu} onFocus={interagiu}>
            <div className="sim-bloco">
              <div className="sim-linha">
                <label htmlFor="sim-conta">Conta de luz por mês</label>
                <output htmlFor="sim-conta">R$ {numero(conta)}</output>
              </div>
              <input
                id="sim-conta"
                className="sim-range"
                type="range"
                min={CONTA.min}
                max={CONTA.max}
                step={CONTA.passo}
                value={conta}
                aria-valuetext={`R$ ${numero(conta)} por mês`}
                style={{ '--sim-p': progresso(CONTA, conta) }}
                onChange={(e) => setConta(Number(e.target.value))}
              />
              <div className="sim-escala" aria-hidden="true">
                <span>R$ {numero(CONTA.min)}</span>
                <span>R$ {numero(CONTA.max)}</span>
              </div>
            </div>

            <fieldset className="sim-bloco sim-regiao">
              <legend>Onde fica a instituição</legend>
              <div className="sim-chips">
                {REGIOES.map((g) => (
                  <label key={g.nome} className="sim-chip">
                    <input type="radio" name="sim-regiao" value={g.nome} checked={regiao === g.nome} onChange={() => setRegiao(g.nome)} />
                    <span>{g.nome}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sim-bloco">
              <div className="sim-linha">
                <label htmlFor="sim-reajuste">Reajuste da energia por ano</label>
                <output htmlFor="sim-reajuste">{decimal(reajuste, 1)}%</output>
              </div>
              <input
                id="sim-reajuste"
                className="sim-range"
                type="range"
                min={REAJUSTE.min}
                max={REAJUSTE.max}
                step={REAJUSTE.passo}
                value={reajuste}
                aria-valuetext={`${decimal(reajuste, 1)}% ao ano`}
                style={{ '--sim-p': progresso(REAJUSTE, reajuste) }}
                onChange={(e) => setReajuste(Number(e.target.value))}
              />
              <div className="sim-escala" aria-hidden="true">
                <span>{REAJUSTE.min}%</span>
                <span>{REAJUSTE.max}%</span>
              </div>
            </div>
          </div>
        </div>

        <Resultado r={r} />
      </div>
    </section>
  )
}
