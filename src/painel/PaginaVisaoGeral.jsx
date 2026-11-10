import { useMemo, useRef } from 'react'
import { ArrowRight, FileText, Leaf, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import SimboloSol from '../components/ui/SimboloSol'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { PROJETOS, porTipo, totais } from './dados-demo'
import { decimal, moeda, percentual } from '../lib/formatos'
import Metrica from './Metrica'
import RoscaInvestimento from './RoscaInvestimento'
import TabelaProjetos from './TabelaProjetos'
import { RELATORIOS, TIPOS_RELATORIO, dataPublicado } from './relatorios/dados'

/* Visão geral do cliente: faixa de abertura, quatro métricas e, abaixo, rosca + tabela. */
export default function PaginaVisaoGeral({ aoAbrirRelatorio }) {
  const raiz = useRef(null)
  const t = useMemo(() => totais(PROJETOS), [])
  const tipos = useMemo(() => porTipo(PROJETOS), [])
  const novo = RELATORIOS[0]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('.pn-revelar'), { autoAlpha: 0, y: 24, duration: 0.85, stagger: 0.09, clearProps: 'transform' })
        // o sol da faixa sobe devagar, como no hero do site
        gsap.from(raiz.current.querySelector('.pn-faixa-sol'), { yPercent: 40, autoAlpha: 0, duration: 1.6, ease: 'power3.out' })
      })
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz}>
      <section className="pn-faixa">
        <div className="pn-faixa-raios" aria-hidden="true" />
        <SimboloSol className="pn-faixa-sol" />
        <div className="pn-pagina pn-faixa-texto">
          <p className="pn-eyebrow">Sistema de apadrinhamento de energia solar</p>
          <h1>Seu impacto em energia solar</h1>
          <p>Acompanhe o investimento, a economia e o CO₂ evitado pelos projetos apadrinhados.</p>
        </div>
      </section>

      <div className="pn-pagina pn-sobe">
        <div className="pn-metricas">
          <Metrica destaque Icone={Wallet} rotulo="Investimento total" valor={t.investimento} formatar={moeda} nota={`${t.projetos} projetos apadrinhados`} />
          <Metrica Icone={PiggyBank} rotulo="Economia anual" valor={t.economiaAnual} formatar={moeda} nota="Nas contas de energia dos beneficiários" />
          <Metrica Icone={Leaf} rotulo="CO₂ evitado" valor={t.co2} formatar={(v) => decimal(v, 1)} unidade="toneladas" nota="Estimativa de demonstração" />
          <Metrica Icone={TrendingUp} rotulo="Retorno médio (ROI)" valor={t.roi} formatar={(v) => percentual(v, 1)} nota="Economia anual ÷ investimento" />
        </div>

        <button type="button" className="pn-novo-relatorio pn-revelar" onClick={() => aoAbrirRelatorio(novo.id)}>
          <span className="pn-novo-relatorio-icone" aria-hidden="true"><FileText size={20} strokeWidth={1.8} /></span>
          <span className="pn-novo-relatorio-texto">
            <small>Relatório novo · {TIPOS_RELATORIO[novo.tipo].rotulo}</small>
            <strong>{novo.titulo}, {novo.periodo}</strong>
            <span>Publicado em {dataPublicado(novo)}</span>
          </span>
          <span className="pn-novo-relatorio-seta">Abrir relatório <ArrowRight size={16} aria-hidden="true" /></span>
        </button>

        <div className="pn-grade">
          <RoscaInvestimento dados={tipos} />
          <TabelaProjetos projetos={PROJETOS} />
        </div>

        <p className="pn-nota pn-revelar">
          Dados de demonstração: parceiros, beneficiários e valores são fictícios e servem para mostrar como a visão do cliente vai ficar.
        </p>
      </div>
    </div>
  )
}
