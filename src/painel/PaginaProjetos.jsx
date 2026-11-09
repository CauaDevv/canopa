import { useMemo, useRef, useState } from 'react'
import { Search, Sun } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { ETAPAS, PROJETOS, TIPOS } from './dados-demo'
import { decimal, moeda } from '../lib/formatos'
import { StatusPill } from './TabelaProjetos'

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// o caminho do projeto, as mesmas quatro etapas da "Jornada" do site
function Etapas({ etapa }) {
  return (
    <ol className="pn-etapas" aria-label="Etapas do projeto">
      {ETAPAS.map((nome, i) => {
        const n = i + 1
        const estado = n < etapa || (n === etapa && etapa === ETAPAS.length) ? 'feita' : n === etapa ? 'atual' : 'futura'
        return (
          <li key={nome} className={estado} aria-current={n === etapa ? 'step' : undefined}>
            <i aria-hidden="true" />
            <span>{nome}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function PaginaProjetos() {
  const raiz = useRef(null)
  const [busca, setBusca] = useState('')
  const lista = useMemo(() => {
    const q = normalizar(busca.trim())
    return q ? PROJETOS.filter((p) => normalizar(`${p.parceiro} ${p.beneficiario}`).includes(q)) : PROJETOS
  }, [busca])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('.pn-revelar'), { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.08, clearProps: 'transform' })
      })
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz} className="pn-pagina pn-pagina--solta">
      <header className="pn-pagina-topo pn-revelar">
        <div>
          <p className="pn-eyebrow pn-eyebrow--escuro">Projetos</p>
          <h1>Projetos apadrinhados</h1>
          <p>Cada projeto percorre as mesmas etapas, da inscrição à operação.</p>
        </div>
      </header>

      <div className="pn-busca pn-revelar">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por parceiro ou beneficiário" aria-label="Buscar projeto por parceiro ou beneficiário" />
      </div>

      <ul className="pn-projetos">
        {lista.map((p) => (
          <li key={p.id} className="pn-projeto pn-revelar">
            <header>
              <span className="pn-projeto-tipo" style={{ '--cor': TIPOS[p.tipo].cor }}>
                <i aria-hidden="true" /> {TIPOS[p.tipo].rotulo}
              </span>
              <StatusPill status={p.status} />
            </header>
            <h2>{p.beneficiario}</h2>
            <p className="pn-projeto-parceiro"><Sun size={15} aria-hidden="true" /> Apadrinhado por <strong>{p.parceiro}</strong> · desde {p.desde}</p>
            <Etapas etapa={p.etapa} />
            <dl className="pn-projeto-dados">
              <div><dt>Investimento</dt><dd>{moeda(p.investimento)}</dd></div>
              <div><dt>Economia anual</dt><dd>{moeda(p.economiaAnual)}</dd></div>
              <div><dt>Potência</dt><dd>{decimal(p.kwp, 1)} kWp</dd></div>
              <div><dt>CO₂ evitado</dt><dd>{decimal(p.co2, 1)} t/ano</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="pn-vazio">Nenhum projeto encontrado para “{busca}”.</p>}
    </div>
  )
}
