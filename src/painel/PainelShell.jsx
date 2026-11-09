import { useEffect, useState } from 'react'
import { ChevronsLeft, ChevronsRight, Globe, LogOut, Menu, X } from 'lucide-react'
import SimboloSol from '../components/ui/SimboloSol'
import { useMediaQuery } from '../components/use-media-query'
import { iniciais } from './formatos'
import './painel.css'

const CHAVE_RECOLHIDO = 'canopa_painel_lateral'

/*
  Casca do painel (a do Acelera Catálogo, na paleta do CANOPA): barra lateral escura
  agrupada e recolhível, topo com caminho (breadcrumb), faixa de aviso opcional e a
  área de conteúdo com rolagem própria. Serve ao painel admin e à visão do cliente;
  quem a usa só descreve os grupos de navegação.

  `grupos`: [{ titulo, itens: [{ id, rotulo, Icone, ativo, emBreve, aoClicar }] }]
*/
export default function PainelShell({ modo, grupos, caminho, usuario, aviso, acoesTopo, rodapeLateral, aoSair, aoVoltarSite, children }) {
  const celular = useMediaQuery('(max-width: 900px)')
  const [recolhido, setRecolhido] = useState(() => {
    try { return localStorage.getItem(CHAVE_RECOLHIDO) === '1' } catch { return false }
  })
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(CHAVE_RECOLHIDO, recolhido ? '1' : '0') } catch { /* sem persistência o menu continua funcional */ }
  }, [recolhido])

  useEffect(() => {
    if (!menuAberto) return
    const aoTeclar = (e) => e.key === 'Escape' && setMenuAberto(false)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [menuAberto])

  useEffect(() => { if (!celular) setMenuAberto(false) }, [celular])

  const fechar = () => setMenuAberto(false)
  const escondida = celular && !menuAberto

  return (
    <div className={'pn pn--' + modo + (recolhido && !celular ? ' recolhido' : '') + (menuAberto ? ' menu-aberto' : '')} data-lenis-prevent>
      <a className="pn-pular" href="#pn-conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('pn-conteudo')?.focus() }}>Pular para o conteúdo</a>
      {menuAberto && <button type="button" className="pn-veu" tabIndex={-1} aria-label="Fechar menu" onClick={fechar} />}

      <aside className="pn-lateral" aria-label="Menu do painel" inert={escondida} aria-hidden={escondida || undefined}>
        <div className="pn-marca">
          <SimboloSol className="pn-marca-sol" />
          <span className="pn-rotulo">CANOPA</span>
          {celular && (
            <button type="button" className="pn-icone" onClick={fechar} aria-label="Fechar menu"><X size={18} /></button>
          )}
        </div>

        <nav className="pn-nav" aria-label="Navegação do painel">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <h3 className="pn-rotulo">{g.titulo}</h3>
              <ul>
                {g.itens.map(({ id, rotulo, Icone, ativo, emBreve, aoClicar }) => (
                  <li key={id}>
                    <button
                      type="button"
                      className="pn-item"
                      aria-current={ativo ? 'page' : undefined}
                      disabled={emBreve}
                      title={recolhido ? rotulo : undefined}
                      onClick={() => { aoClicar?.(); fechar() }}
                    >
                      <Icone size={19} strokeWidth={1.7} aria-hidden="true" />
                      <span className="pn-rotulo">{rotulo}</span>
                      {emBreve && <em className="pn-breve pn-rotulo">em breve</em>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pn-pe">
          {rodapeLateral}
          <button type="button" className="pn-item" onClick={aoVoltarSite} title={recolhido ? 'Voltar ao site' : undefined}>
            <Globe size={19} strokeWidth={1.7} aria-hidden="true" />
            <span className="pn-rotulo">Voltar ao site</span>
          </button>
          <button type="button" className="pn-item pn-recolher" onClick={() => setRecolhido((r) => !r)} aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}>
            {recolhido ? <ChevronsRight size={19} /> : <ChevronsLeft size={19} />}
            <span className="pn-rotulo">Recolher menu</span>
          </button>
          <div className="pn-usuario">
            <span className="pn-avatar" aria-hidden="true">{iniciais(usuario)}</span>
            <span className="pn-usuario-texto pn-rotulo">
              <strong>{modo === 'cliente' ? 'Visão do cliente' : 'Administração'}</strong>
              <small>{usuario}</small>
            </span>
            <button type="button" className="pn-icone pn-rotulo" onClick={aoSair} aria-label="Sair da conta" title="Sair da conta"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <div className="pn-coluna" inert={menuAberto && celular}>
        {aviso}
        <header className="pn-topo">
          {celular && (
            <button type="button" className="pn-icone" onClick={() => setMenuAberto(true)} aria-label="Abrir menu" aria-expanded={menuAberto}>
              <Menu size={20} />
            </button>
          )}
          <nav className="pn-caminho" aria-label="Você está em">
            {caminho.map((parte, i) => (
              <span key={parte} aria-current={i === caminho.length - 1 ? 'page' : undefined}>{parte}</span>
            ))}
          </nav>
          <div className="pn-acoes-topo">
            {acoesTopo}
            <button type="button" className="pn-botao pn-botao--fantasma pn-botao--voltar" onClick={aoVoltarSite}>Voltar ao site</button>
          </div>
        </header>
        <main id="pn-conteudo" className="pn-rolagem" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
