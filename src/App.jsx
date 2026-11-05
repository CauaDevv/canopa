import { useState } from 'react'
import { AdminAccess } from './components/Accounts'
import Cabecalho from './components/layout/Cabecalho'
import LinhasOnduladas from './components/ui/LinhasOnduladas'
import Logo from './components/ui/Logo'
import ComoFunciona from './secoes/ComoFunciona'
import Confianca from './secoes/Confianca'
import Contato from './secoes/Contato'
import DuasPontas from './secoes/DuasPontas'
import Faixa from './secoes/Faixa'
import Hero from './secoes/Hero'
import Impacto from './secoes/Impacto'
import Jornada from './secoes/Jornada'
import Rodape from './secoes/Rodape'
import Sobre from './secoes/Sobre'

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
        <Contato />
      </main>
      <Rodape aoAcessar={() => setAcesso(true)} />
      {acesso && <AdminAccess onClose={() => setAcesso(false)} Logo={Logo} Lines={LinhasOnduladas} />}
    </>
  )
}
