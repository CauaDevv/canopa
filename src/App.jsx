import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Cabecalho from './components/layout/Cabecalho'
import LinhasOnduladas from './components/ui/LinhasOnduladas'
import Logo from './components/ui/Logo'
import ComoFunciona from './secoes/ComoFunciona'
import CampoMagnetico from './secoes/CampoMagnetico'
import Confianca from './secoes/Confianca'
import DuasPontas from './secoes/DuasPontas'
import Faixa from './secoes/Faixa'
import Hero from './secoes/Hero'
import Impacto from './secoes/Impacto'
import Jornada from './secoes/Jornada'
import Rodape from './secoes/Rodape'
import Simulador from './secoes/Simulador'
import Sobre from './secoes/Sobre'

// o painel (gráficos, tabelas, tela de acesso) só desce quando alguém abre o acesso da equipe
const AcessoAdmin = lazy(() => import('./painel/AcessoAdmin'))

// a janela do formulário também: não aparece na página e só é baixada (e montada) quando preciso
const carregarContato = () => import('./secoes/Contato')
const Contato = lazy(carregarContato)

export default function App() {
  const [menu, setMenu] = useState(false)
  const [acesso, setAcesso] = useState(false)
  const [contatoAberto, setContatoAberto] = useState(false)
  const [contatoMontado, setContatoMontado] = useState(false)
  const origem = useRef(null)

  const abrirContato = useCallback((quem) => {
    origem.current = quem || document.activeElement
    setContatoMontado(true)
    setContatoAberto(true)
  }, [])
  const fecharContato = useCallback(() => {
    setContatoAberto(false)
    const el = origem.current
    requestAnimationFrame(() => el?.isConnected && el.focus({ preventScroll: true }))
  }, [])

  // todo link para o contato (botão final, "Quero participar", menu, rodapé) abre a janela
  useEffect(() => {
    const aoClicar = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = e.target.closest?.('a[href="#contato"], a[href="#formulario"]')
      if (!link) return
      e.preventDefault()
      abrirContato(link)
    }
    document.addEventListener('click', aoClicar, true)
    return () => document.removeEventListener('click', aoClicar, true)
  }, [abrirContato])

  // enquanto a janela está aberta a página por trás fica parada (o SmoothScroll para o Lenis ao ver esta classe)
  useEffect(() => {
    document.documentElement.classList.toggle('intro-ativo', contatoAberto)
    return () => document.documentElement.classList.remove('intro-ativo')
  }, [contatoAberto])

  // aquece o bloco do formulário quando o navegador está ocioso: o primeiro clique não espera download
  useEffect(() => {
    const quando = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 3500))
    const id = quando(() => carregarContato())
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id))
  }, [])

  return (
    <>
      <Cabecalho menu={menu} setMenu={setMenu} aoEntrar={() => setAcesso(true)} />
      <main id="inicio">
        <Hero />
        <Sobre />
        <DuasPontas />
        <Jornada />
        <ComoFunciona />
        <Impacto />
        <Simulador />
        <Confianca />
        <Faixa />
        <CampoMagnetico href="#formulario" />
      </main>
      <Rodape aoAcessar={() => setAcesso(true)} />
      {contatoMontado && (
        <Suspense fallback={null}>
          <Contato aberto={contatoAberto} aoFechar={fecharContato} />
        </Suspense>
      )}
      {acesso && (
        <Suspense fallback={null}>
          <AcessoAdmin onClose={() => setAcesso(false)} Logo={Logo} Lines={LinhasOnduladas} />
        </Suspense>
      )}
    </>
  )
}
