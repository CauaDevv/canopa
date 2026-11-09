import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, FileText, FolderKanban, LayoutDashboard, Leaf } from 'lucide-react'
import PainelShell from './PainelShell'
import PaginaProjetos from './PaginaProjetos'
import PaginaVisaoGeral from './PaginaVisaoGeral'

const PAGINAS = { geral: 'Visão geral', projetos: 'Projetos' }

/*
  Visão do cliente: é o que o cliente vai enxergar, aberta de dentro da conta admin
  ("Ir ao painel de cliente"). Fica sempre sinalizada por uma faixa dourada com a saída
  de volta ao admin — como o "ver como" do superadmin do Acelera Catálogo.
*/
export default function PainelCliente({ usuario, aoVoltarAdmin, aoSair, aoVoltarSite }) {
  const [pagina, setPagina] = useState('geral')

  useEffect(() => { document.getElementById('pn-conteudo')?.scrollTo(0, 0) }, [pagina])

  const grupos = [
    {
      titulo: 'Painel',
      itens: [
        { id: 'geral', rotulo: PAGINAS.geral, Icone: LayoutDashboard, ativo: pagina === 'geral', aoClicar: () => setPagina('geral') },
        { id: 'projetos', rotulo: PAGINAS.projetos, Icone: FolderKanban, ativo: pagina === 'projetos', aoClicar: () => setPagina('projetos') },
      ],
    },
    {
      titulo: 'Em breve',
      itens: [
        { id: 'impacto', rotulo: 'Impacto', Icone: Leaf, emBreve: true },
        { id: 'relatorios', rotulo: 'Relatórios', Icone: FileText, emBreve: true },
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
      caminho={['Painel do cliente', PAGINAS[pagina]]}
      usuario={usuario}
      aviso={aviso}
      aoSair={aoSair}
      aoVoltarSite={aoVoltarSite}
    >
      {pagina === 'geral' ? <PaginaVisaoGeral key="geral" /> : <PaginaProjetos key="projetos" />}
    </PainelShell>
  )
}
