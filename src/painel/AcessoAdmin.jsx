import { lazy, Suspense, useState } from 'react'
import { X } from 'lucide-react'
import { FlowButtonContent } from '../components/FlowButtonContent'
import { call } from '../lib/api'
import PainelAdmin from './PainelAdmin'

// a visão do cliente (visão geral, projetos, relatórios) só desce quando alguém abre "Ir ao painel de cliente"
const PainelCliente = lazy(() => import('./PainelCliente'))

/*
  Acesso da equipe: tela de entrada e, depois do login, o painel. A sessão é um token
  em memória (some ao fechar). `modo` alterna entre a visão admin e a visão do cliente;
  trocar de modo NÃO é outro login — a visão do cliente é só uma pré-visualização.
*/
export default function AcessoAdmin({ onClose, Logo, Lines }) {
  const [token, setToken] = useState('')
  const [usuario, setUsuario] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [atualizando, setAtualizando] = useState(false)
  const [modo, setModo] = useState('admin')

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setOcupado(true)
    const form = new FormData(e.currentTarget)
    try {
      const { token: sessao } = await call('/login', { method: 'POST', body: { email: form.get('email'), password: form.get('password') } })
      const dados = await call('/messages', { token: sessao })
      setMensagens(dados.messages)
      setUsuario(String(form.get('email') || ''))
      setToken(sessao)
      setModo('admin')
    } catch (err) {
      setErro(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function atualizar() {
    setAtualizando(true)
    try {
      const dados = await call('/messages', { token })
      setMensagens(dados.messages)
    } catch (err) {
      // sessão expirada: volta para a tela de entrada com o motivo
      setToken('')
      setErro(err.message)
    } finally {
      setAtualizando(false)
    }
  }

  async function sair() {
    try { await call('/logout', { method: 'POST', token }) } catch { /* a sessão expira sozinha */ }
    setToken('')
    setMensagens([])
    setModo('admin')
  }

  if (token) {
    return modo === 'cliente' ? (
      <Suspense fallback={null}>
        <PainelCliente usuario={usuario} aoVoltarAdmin={() => setModo('admin')} aoSair={sair} aoVoltarSite={onClose} />
      </Suspense>
    ) : (
      <PainelAdmin
        usuario={usuario}
        mensagens={mensagens}
        atualizando={atualizando}
        aoAtualizar={atualizar}
        aoVerComoCliente={() => setModo('cliente')}
        aoSair={sair}
        aoVoltarSite={onClose}
      />
    )
  }

  return (
    <div className="login-page" data-lenis-prevent>
      <Lines side="left" />
      <Lines side="right" />
      <button className="login-close" onClick={onClose} aria-label="Voltar para a página"><X /></button>
      <div className="login-layout">
        <div className="login-brand">
          <Logo />
          <p>Acesso da equipe administradora do CANOPA</p>
        </div>
        <div className="login-card">
          <form className="login-form" onSubmit={entrar}>
            <span className="section-label"><i /> BEM-VINDO DE VOLTA</span>
            <h2>ENTRAR NO <span>CANOPA</span></h2>
            <label>E-mail<input type="email" name="email" autoComplete="username" required placeholder="Seu e-mail cadastrado" /></label>
            <label>Senha<input type="password" name="password" autoComplete="current-password" required placeholder="Insira sua senha" /></label>
            <button type="submit" className="flow-button canopa-flow" disabled={ocupado}>
              <FlowButtonContent>{ocupado ? 'Entrando...' : 'Continuar'}</FlowButtonContent>
            </button>
            {erro && <p className="auth-error" role="alert">{erro}</p>}
            <div className="login-divider" />
            <p>Acesso reservado à administração do projeto.</p>
          </form>
        </div>
      </div>
    </div>
  )
}
