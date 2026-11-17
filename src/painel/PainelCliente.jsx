import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Eye, FileText, FolderKanban, LayoutDashboard, Leaf } from 'lucide-react'
import PainelShell from './PainelShell'
import PaginaProjetos from './PaginaProjetos'
import PaginaVisaoGeral from './PaginaVisaoGeral'
import { relatorioPorId } from './relatorios/dados'
import { PROJETOS } from './dados-demo'

// relatórios (capa, gráficos, leitor) só descem quando o cliente abre a página
const PaginaRelatorios = lazy(() => import('./relatorios/PaginaRelatorios'))

const PAGINAS = { geral: 'Visão geral', projetos: 'Projetos', relatorios: 'Relatórios' }

/*
  Visão do cliente: é o que o cliente vai enxergar, aberta de dentro da conta admin
  ("Ir ao painel de cliente"). Fica sempre sinalizada por uma faixa dourada com a saída
  de volta ao admin — como o "ver como" do superadmin do Acelera Catálogo.
*/
export default function PainelCliente({ usuario, aoVoltarAdmin, aoSair, aoVoltarSite }) {
  const [pagina, setPagina] = useState('geral')
  const [relatorioId, setRelatorioId] = useState(null)
  const [projetoId, setProjetoId] = useState(null)
  // projeto de onde o relatório foi aberto: o botão "voltar" do relatório devolve a ele, não à lista
  const [origem, setOrigem] = useState(null)

  useEffect(() => { document.getElementById('pn-conteudo')?.scrollTo(0, 0) }, [pagina, relatorioId, projetoId])

  const abrirRelatorio = (id) => {
    setRelatorioId(id)
    setPagina('relatorios')
  }
  const abrirRelatorioDoProjeto = (id) => {
    setOrigem(projetoId)
    setProjetoId(null)
    abrirRelatorio(id)
  }
  const fecharRelatorio = () => {
    setRelatorioId(null)
    if (origem) {
      setProjetoId(origem)
      setPagina('projetos')
      setOrigem(null)
    }
  }
  const irPara = (id) => {
    setRelatorioId(null)
    setProjetoId(null)
    setOrigem(null)
    setPagina(id)
  }

  const grupos = [
    {
      titulo: 'Painel',
      itens: [
        { id: 'geral', rotulo: PAGINAS.geral, Icone: LayoutDashboard, ativo: pagina === 'geral', aoClicar: () => irPara('geral') },
        { id: 'projetos', rotulo: PAGINAS.projetos, Icone: FolderKanban, ativo: pagina === 'projetos', aoClicar: () => irPara('projetos') },
        { id: 'relatorios', rotulo: PAGINAS.relatorios, Icone: FileText, ativo: pagina === 'relatorios', aoClicar: () => irPara('relatorios') },
      ],
    },
    {
      titulo: 'Em breve',
      itens: [
        { id: 'impacto', rotulo: 'Impacto', Icone: Leaf, emBreve: true },
      ],
    },
  ]

  const aviso = (
    <div className="pn-aviso" role="status">
      <Eye size={17} aria-hidden="true" />
      <span><strong>Você está vendo o painel como cliente.</strong> Dados de demonstração.</span>
      <button type="button" className="pn-botao pn-botao--escuro" onClick={aoVoltarAdmin}>
        <ArrowLeft size={15} aria-hidden="true" /> Voltar ao painel admin
      </button>
    </div>
  )

  return (
    <PainelShell
      modo="cliente"
      grupos={grupos}
      caminho={['Painel do cliente', PAGINAS[pagina], ...(relatorioId ? [relatorioPorId(relatorioId).titulo] : []), ...(projetoId ? [PROJETOS.find((p) => p.id === projetoId).beneficiario] : [])]}
      usuario={usuario}
      aviso={aviso}
      aoSair={aoSair}
      aoVoltarSite={aoVoltarSite}
    >
      {pagina === 'geral' && <PaginaVisaoGeral key="geral" aoAbrirRelatorio={abrirRelatorio} />}
      {pagina === 'projetos' && <PaginaProjetos key="projetos" abertoId={projetoId} aoAbrir={setProjetoId} aoFechar={() => setProjetoId(null)} aoAbrirRelatorio={abrirRelatorioDoProjeto} />}
      {pagina === 'relatorios' && (
        <Suspense fallback={<p className="pn-vazio" role="status">Carregando relatórios…</p>}>
          <PaginaRelatorios abertoId={relatorioId} aoAbrir={setRelatorioId} aoFechar={fecharRelatorio} rotuloVoltar={origem ? 'Projeto' : 'Relatórios'} />
        </Suspense>
      )}
    </PainelShell>
  )
}
