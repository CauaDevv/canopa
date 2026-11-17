import RelatorioLeitor from './RelatorioLeitor'
import { detalheDoProjeto } from './detalhe'
import './relatorios.css'

/*
  Ficha de um projeto: o leitor dos relatórios com os blocos montados em detalhe.js.
  Fica neste arquivo (e não em PaginaProjetos) para o leitor, os gráficos e o CSS dos
  relatórios só serem baixados quando alguém abre um projeto, junto com o bloco dos relatórios.
*/
export default function ProjetoDetalhe({ id, aoVoltar, aoAbrirRelatorio }) {
  const ficha = detalheDoProjeto(id)
  if (!ficha) return null
  return <RelatorioLeitor key={ficha.id} relatorio={ficha} rotuloVoltar="Projetos" aoVoltar={aoVoltar} aoAbrirRelatorio={aoAbrirRelatorio} />
}
