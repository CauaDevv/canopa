import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { TIPOS_RELATORIO } from './dados'
import Barras from './blocos/Barras'
import { RelatorioContexto } from './blocos/Bloco'
import Calendario from './blocos/Calendario'
import Capa from './blocos/Capa'
import Composicao from './blocos/Composicao'
import Destaque from './blocos/Destaque'
import LinhaTempo from './blocos/LinhaTempo'
import Notas from './blocos/Notas'
import Numeros from './blocos/Numeros'
import Progresso from './blocos/Progresso'
import Projetos from './blocos/Projetos'

const BLOCOS = { numeros: Numeros, barras: Barras, calendario: Calendario, composicao: Composicao, tempo: LinhaTempo, projetos: Projetos, progresso: Progresso, destaque: Destaque, notas: Notas }

/*
  Leitor de relatório: capa, blocos em sequência e uma barra fixa com a saída, o
  progresso de leitura e "Salvar em PDF". O PDF sai da própria impressão do navegador
  (a folha de estilo de impressão em relatorios.css deixa só o relatório); antes de
  imprimir, tudo é revelado de uma vez, porque nada pode ficar esperando rolagem.
*/
export default function RelatorioLeitor({ relatorio: r, aoVoltar }) {
  const [tudo, setTudo] = useState(false)
  const barra = useRef(null)
  const titulo = useRef(null)
  const T = TIPOS_RELATORIO[r.tipo]

  // o painel rola dentro de #pn-conteudo: o progresso de leitura acompanha aquela rolagem
  useEffect(() => {
    const rolagem = document.getElementById('pn-conteudo')
    if (!rolagem) return
    let quadro = 0
    const medir = () => {
      quadro = 0
      const max = rolagem.scrollHeight - rolagem.clientHeight
      barra.current?.style.setProperty('--lido', max > 0 ? (rolagem.scrollTop / max).toFixed(4) : '0')
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    medir()
    rolagem.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      rolagem.removeEventListener('scroll', aoRolar)
      cancelAnimationFrame(quadro)
    }
  }, [r.id])

  // impressão (botão ou Ctrl+P): revela tudo e dá ao PDF o nome do relatório
  useEffect(() => {
    const original = document.title
    const antes = () => {
      flushSync(() => setTudo(true))
      document.title = `CANOPA - ${r.titulo} (${r.periodo})`
    }
    const depois = () => {
      document.title = original
    }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', depois)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', depois)
      document.title = original
    }
  }, [r])

  // quem abre o relatório (teclado ou leitor de tela) cai no título, não no topo da barra lateral
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true })
  }, [r.id])

  return (
    <RelatorioContexto.Provider value={{ tudo }}>
      <article className="rel" aria-labelledby="rel-titulo">
        <div className="rel-barra">
          <button type="button" className="pn-botao pn-botao--fantasma" onClick={aoVoltar}>
            <ArrowLeft size={16} aria-hidden="true" /> Relatórios
          </button>
          <p className="rel-barra-titulo"><T.Icone size={15} aria-hidden="true" /> {r.titulo}</p>
          <button type="button" className="pn-botao pn-botao--escuro" onClick={() => window.print()} title="Abre a impressão: escolha “Salvar como PDF”">
            <Printer size={16} aria-hidden="true" /> Salvar em PDF
          </button>
          <i ref={barra} className="rel-lido" aria-hidden="true" />
        </div>

        <Capa relatorio={r} tituloRef={titulo} />
        {r.blocos.map((b, i) => {
          const Bloco = BLOCOS[b.tipo]
          return <Bloco key={`${b.tipo}-${i}`} dados={b} />
        })}

        <footer className="rel-impressao">
          CANOPA · {r.titulo} · {r.periodo} · Dados de demonstração
        </footer>
      </article>
    </RelatorioContexto.Provider>
  )
}
