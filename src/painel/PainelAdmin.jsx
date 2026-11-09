import { useMemo, useRef, useState } from 'react'
import { Building2, Eye, Handshake, Inbox, Mail, MessageSquare, Phone, RefreshCw, School, Search } from 'lucide-react'
import { gsap, MIDIA, useGSAP } from '../lib/animacao'
import { dataHora } from './formatos'
import PainelShell from './PainelShell'

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// o formulário do site grava o perfil como primeira linha da mensagem: "Perfil: Instituição\n\ntexto"
function lerMensagem(texto) {
  const m = /^Perfil: (.+?)\n\n([\s\S]*)$/.exec(texto)
  return m ? { perfil: m[1], corpo: m[2] } : { perfil: '', corpo: texto }
}

const ICONE_PERFIL = (perfil) => (perfil.startsWith('Empresa') ? Building2 : perfil.startsWith('Institui') ? School : Handshake)

function Resumo({ Icone, rotulo, valor }) {
  return (
    <article className="pn-resumo pn-revelar">
      <span className="pn-resumo-icone" aria-hidden="true"><Icone size={18} strokeWidth={1.8} /></span>
      <p><strong>{valor}</strong><span>{rotulo}</span></p>
    </article>
  )
}

/* Painel admin: mensagens recebidas pelo formulário do site + a porta para a visão do cliente. */
export default function PainelAdmin({ usuario, mensagens, atualizando, aoAtualizar, aoVerComoCliente, aoSair, aoVoltarSite }) {
  const raiz = useRef(null)
  const [busca, setBusca] = useState('')

  const itens = useMemo(() => mensagens.map((m) => ({ ...m, ...lerMensagem(m.message) })), [mensagens])
  const resumo = useMemo(() => {
    const semana = Date.now() - 7 * 24 * 3600 * 1000
    return {
      total: itens.length,
      semana: itens.filter((m) => new Date(m.created_at.replace(' ', 'T') + 'Z').getTime() >= semana).length,
      empresas: itens.filter((m) => m.perfil.startsWith('Empresa')).length,
      instituicoes: itens.filter((m) => m.perfil.startsWith('Institui')).length,
    }
  }, [itens])
  const lista = useMemo(() => {
    const q = normalizar(busca.trim())
    return q ? itens.filter((m) => normalizar(`${m.name} ${m.email} ${m.phone} ${m.corpo} ${m.perfil}`).includes(q)) : itens
  }, [itens, busca])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MIDIA.movimento, () => {
        gsap.from(raiz.current.querySelectorAll('.pn-revelar'), { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.07, clearProps: 'transform' })
      })
    },
    { scope: raiz },
  )

  const grupos = [
    { titulo: 'Administração', itens: [{ id: 'mensagens', rotulo: 'Mensagens', Icone: Inbox, ativo: true }] },
    { titulo: 'Visualizar como', itens: [{ id: 'cliente', rotulo: 'Painel do cliente', Icone: Eye, aoClicar: aoVerComoCliente }] },
  ]

  return (
    <PainelShell
      modo="admin"
      grupos={grupos}
      caminho={['Administração', 'Mensagens']}
      usuario={usuario}
      aoSair={aoSair}
      aoVoltarSite={aoVoltarSite}
      acoesTopo={
        <button type="button" className="pn-botao pn-botao--fantasma" onClick={aoAtualizar} disabled={atualizando}>
          <RefreshCw size={15} className={atualizando ? 'girando' : undefined} aria-hidden="true" /> Atualizar
        </button>
      }
    >
      <div ref={raiz} className="pn-pagina pn-pagina--solta">
        <header className="pn-pagina-topo pn-revelar">
          <div>
            <p className="pn-eyebrow pn-eyebrow--escuro">Área administrativa</p>
            <h1>Mensagens recebidas</h1>
            <p>Contatos enviados pelo formulário do CANOPA.</p>
          </div>
          <button type="button" className="pn-botao pn-botao--ouro" onClick={aoVerComoCliente}>
            <Eye size={17} aria-hidden="true" /> Ir ao painel de cliente
          </button>
        </header>

        <div className="pn-resumos">
          <Resumo Icone={MessageSquare} rotulo="mensagens" valor={resumo.total} />
          <Resumo Icone={Inbox} rotulo="nos últimos 7 dias" valor={resumo.semana} />
          <Resumo Icone={Building2} rotulo="de empresas" valor={resumo.empresas} />
          <Resumo Icone={School} rotulo="de instituições" valor={resumo.instituicoes} />
        </div>

        <div className="pn-busca pn-revelar">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail, telefone ou texto" aria-label="Buscar mensagens" />
        </div>

        {itens.length === 0 ? (
          <p className="pn-vazio pn-revelar">Nenhuma mensagem recebida ainda.</p>
        ) : lista.length === 0 ? (
          <p className="pn-vazio">Nenhuma mensagem encontrada para “{busca}”.</p>
        ) : (
          <ul className="pn-mensagens">
            {lista.map((m) => {
              const Icone = ICONE_PERFIL(m.perfil)
              return (
                <li key={m.id} className="pn-mensagem pn-revelar">
                  <header>
                    <strong>{m.name}</strong>
                    {m.perfil && <span className="pn-perfil"><Icone size={13} aria-hidden="true" /> {m.perfil}</span>}
                    <time>{dataHora(m.created_at)}</time>
                  </header>
                  <p className="pn-mensagem-contato">
                    <a href={`mailto:${m.email}`}><Mail size={14} aria-hidden="true" /> {m.email}</a>
                    <span><Phone size={14} aria-hidden="true" /> {m.phone}</span>
                  </p>
                  <p className="pn-mensagem-corpo">{m.corpo}</p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PainelShell>
  )
}
