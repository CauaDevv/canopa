import { lazy, Suspense, useState } from 'react'
import Cabecalho from './components/layout/Cabecalho'
import LinhasOnduladas from './components/ui/LinhasOnduladas'
import Logo from './components/ui/Logo'
import { chamarFormulario } from './lib/formulario'
import ComoFunciona from './secoes/ComoFunciona'
import CampoMagnetico from './secoes/CampoMagnetico'
import Confianca from './secoes/Confianca'
import Contato from './secoes/Contato'
import DuasPontas from './secoes/DuasPontas'
import Faixa from './secoes/Faixa'
import Hero from './secoes/Hero'
import Impacto from './secoes/Impacto'
import Jornada from './secoes/Jornada'
import Rodape from './secoes/Rodape'
import Sobre from './secoes/Sobre'

// o painel (gráficos, tabelas, tela de acesso) só desce quando alguém abre o acesso da equipe
const AcessoAdmin = lazy(() => import('./painel/AcessoAdmin'))

export default function App() {
  const [menu, setMenu] = useState(false)
  const [acesso, setAcesso] = useState(false)

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
        <Confianca />
        <Faixa />
        <CampoMagnetico href="#formulario" aoClicar={chamarFormulario} />
        <Contato />
      </main>
      <Rodape aoAcessar={() => setAcesso(true)} />
      {acesso && (
        <Suspense fallback={null}>
          <AcessoAdmin onClose={() => setAcesso(false)} Logo={Logo} Lines={LinhasOnduladas} />
        </Suspense>
      )}
    </>
  )
}
