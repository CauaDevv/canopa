import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, Check, CircleAlert, Handshake, RotateCcw, School } from 'lucide-react'
import { FlowButtonContent } from './FlowButtonContent'
import SimboloSol from './ui/SimboloSol'
import { call } from '../lib/api'
import { EVENTO_FORMULARIO } from '../lib/formulario'
import { gsap, MIDIA } from '../lib/animacao'
import { desenharSol } from '../lib/traco'
import './FormularioContato.css'

/*
  Formulário de contato do CANOPA.

  O contrato com a API não mudou (worker/index.js recebe name, email, phone e
  message). O perfil escolhido ("Como você quer participar?") viaja como primeira
  linha da mensagem — assim aparece na área administrativa sem tocar no servidor.
  Cada etapa concluída acende uma parte do símbolo do sol no painel ao lado
  (onProgresso): perfil = horizonte, nome = disco, contato = raios, mensagem = haste.
*/

const PERFIS = [
  { id: 'empresa', rotulo: 'Empresa patrocinadora', texto: 'Quero apoiar projetos.', Icone: Building2 },
  { id: 'instituicao', rotulo: 'Instituição', texto: 'Escola, ONG ou entidade.', Icone: School },
  { id: 'parceiro', rotulo: 'Outro parceiro', texto: 'Quero contribuir de outra forma.', Icone: Handshake },
]

// o servidor aceita 4000; o prefixo "Perfil: …" ocupa menos de 60
const MAX_MENSAGEM = 3900
const ORDEM = ['perfil', 'name', 'email', 'phone', 'message']
const VAZIO = { perfil: '', name: '', email: '', phone: '', message: '' }

function mascararTelefone(texto) {
  // número internacional (+55…): não mascara, só limpa
  if (texto.trim().startsWith('+')) return '+' + texto.replace(/\D/g, '').slice(0, 15)
  const d = texto.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function telefoneValido(texto) {
  const d = texto.replace(/\D/g, '')
  return texto.trim().startsWith('+') ? d.length >= 8 && d.length <= 15 : d.length >= 10 && d.length <= 11
}

// mensagens que dizem o que corrigir e onde, sem culpar a pessoa
const regras = {
  perfil: (v) => (v ? '' : 'Escolha como você quer participar.'),
  name: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
  email: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) && v.trim().length <= 254 ? '' : 'Digite um e-mail válido, como nome@empresa.com.br.'),
  phone: (v) => (telefoneValido(v) ? '' : 'Informe um telefone com DDD, como (81) 99999-0000.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Conte um pouco mais: escreva pelo menos 10 caracteres.'),
}

function Campo({ id, rotulo, erro, valido, area = false, contador, children }) {
  return (
    <div className="cc-reveal">
      <div className={'cc-campo' + (area ? ' cc-campo--area' : '') + (erro ? ' tem-erro' : '') + (valido ? ' ok' : '')}>
        <label htmlFor={id}>{rotulo}</label>
        {children}
        <span className="cc-ok" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
        {contador}
      </div>
      {erro && (
        <p id={id + '-erro'} className="cc-erro" role="alert">
          <CircleAlert size={16} aria-hidden="true" /> {erro}
        </p>
      )}
    </div>
  )
}

export default function FormularioContato({ onProgresso }) {
  const raiz = useRef(null)
  const [v, setV] = useState(VAZIO)
  const [tocados, setTocados] = useState({})
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [enviado, setEnviado] = useState(null)

  const erros = useMemo(() => Object.fromEntries(ORDEM.map((k) => [k, regras[k](v[k])])), [v])
  const ok = { perfil: !erros.perfil, nome: !erros.name, contato: !erros.email && !erros.phone, mensagem: !erros.message }
  const total = Object.values(ok).filter(Boolean).length
  const chave = `${+ok.perfil}${+ok.nome}${+ok.contato}${+ok.mensagem}`
  const mostrar = (k) => ((tocados[k] || tentou) && erros[k] ? erros[k] : '')

  // avisa o painel ao lado: cada etapa concluída acende uma parte do sol
  useEffect(() => {
    onProgresso?.(enviado ? { perfil: true, nome: true, contato: true, mensagem: true, total: 4, enviado: true } : { ...ok, total })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, enviado])

  const focar = (campo) => {
    const el = campo === 'perfil' ? raiz.current?.querySelector('input[name="perfil"]') : document.getElementById('cc-' + campo)
    el?.focus({ preventScroll: false })
  }

  // o botão final da página chama o formulário: acende o cartão e leva o foco ao primeiro campo pendente
  useEffect(() => {
    const aoChamar = () => {
      const el = raiz.current
      if (!el) return
      el.classList.remove('chamado')
      void el.offsetWidth // reinicia a animação se já estava rodando
      el.classList.add('chamado')
      const pendente = ORDEM.find((k) => erros[k])
      if (pendente === 'perfil') el.querySelector('input[name="perfil"]')?.focus({ preventScroll: true })
      else if (pendente) document.getElementById('cc-' + pendente)?.focus({ preventScroll: true })
      setTimeout(() => el.classList.remove('chamado'), 2200)
    }
    window.addEventListener(EVENTO_FORMULARIO, aoChamar)
    return () => window.removeEventListener(EVENTO_FORMULARIO, aoChamar)
  }, [erros])

  // tela de sucesso: o sol se desenha e o foco vai para o título (leitor de tela anuncia)
  useEffect(() => {
    if (!enviado) return
    const el = raiz.current
    el?.querySelector('.cc-sucesso h3')?.focus({ preventScroll: true })
    if (window.matchMedia(MIDIA.movimento).matches) {
      const sol = el?.querySelector('.cc-sucesso-sol')
      if (sol) {
        const tl = desenharSol(sol, { atraso: 0.1 })
        return () => tl.kill()
      }
    }
  }, [enviado])

  const mudar = (campo) => (e) => {
    const valor = campo === 'phone' ? mascararTelefone(e.target.value) : e.target.value
    setV((p) => ({ ...p, [campo]: valor }))
    if (erroEnvio) setErroEnvio('')
  }
  const sair = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const escolher = (id) => {
    setV((p) => ({ ...p, perfil: id }))
    setTocados((t) => ({ ...t, perfil: true }))
    if (erroEnvio) setErroEnvio('')
  }

  async function enviar(e) {
    e.preventDefault()
    setTentou(true)
    const primeiro = ORDEM.find((k) => erros[k])
    if (primeiro) {
      setErroEnvio('Confira os campos destacados.')
      focar(primeiro)
      return
    }
    setErroEnvio('')
    setEnviando(true)
    try {
      const perfil = PERFIS.find((p) => p.id === v.perfil)
      await call('/messages', {
        method: 'POST',
        body: { name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), message: `Perfil: ${perfil.rotulo}\n\n${v.message.trim()}` },
      })
      setEnviado({ nome: v.name.trim().split(/\s+/)[0] })
      setV(VAZIO)
      setTocados({})
      setTentou(false)
    } catch (erro) {
      setErroEnvio(erro.message)
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    setEnviado(null)
    requestAnimationFrame(() => raiz.current?.querySelector('input[name="perfil"]')?.focus())
  }

  const pronto = total === 4 && !enviando

  return (
    <div ref={raiz} className="cc" id="formulario" tabIndex={-1}>
      {enviado ? (
        <div className="cc-sucesso" role="status">
          <SimboloSol className="cc-sucesso-sol" />
          <h3 tabIndex={-1}>MENSAGEM ENVIADA!</h3>
          <p>
            Obrigado{enviado.nome ? `, ${enviado.nome}` : ''}. Sua mensagem chegou à equipe do CANOPA.
          </p>
          <button type="button" className="cc-outra" onClick={reiniciar}>
            <RotateCcw size={16} aria-hidden="true" /> Enviar outra mensagem
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate aria-label="Formulário de contato">
          <div className="cc-topo cc-reveal">
            <span className="cc-passo">{total} DE 4</span>
            <div className="cc-barra" role="progressbar" aria-label="Progresso do formulário" aria-valuemin={0} aria-valuemax={4} aria-valuenow={total}>
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={i < total ? 'cheio' : undefined} />
              ))}
            </div>
          </div>

          <fieldset className={'cc-perfis' + (mostrar('perfil') ? ' tem-erro' : '')} aria-describedby={mostrar('perfil') ? 'cc-perfil-erro' : undefined}>
            <legend className="cc-reveal">COMO VOCÊ QUER PARTICIPAR?</legend>
            <div className="cc-perfis-grade">
              {PERFIS.map(({ id, rotulo, texto, Icone }) => (
                <label key={id} className="cc-perfil cc-reveal">
                  <input type="radio" name="perfil" value={id} checked={v.perfil === id} onChange={() => escolher(id)} />
                  <span className="cc-perfil-corpo">
                    <span className="cc-perfil-icone"><Icone size={20} strokeWidth={1.6} aria-hidden="true" /></span>
                    <strong>{rotulo}</strong>
                    <small>{texto}</small>
                    <span className="cc-perfil-ok" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                  </span>
                </label>
              ))}
            </div>
            {mostrar('perfil') && (
              <p id="cc-perfil-erro" className="cc-erro" role="alert">
                <CircleAlert size={16} aria-hidden="true" /> {erros.perfil}
              </p>
            )}
          </fieldset>

          <Campo id="cc-name" rotulo="Nome" erro={mostrar('name')} valido={!erros.name}>
            <input id="cc-name" name="name" type="text" autoComplete="name" maxLength={120} placeholder="Como podemos te chamar?" value={v.name} onChange={mudar('name')} onBlur={sair('name')} aria-required="true" aria-invalid={!!mostrar('name')} aria-describedby={mostrar('name') ? 'cc-name-erro' : undefined} />
          </Campo>
          <Campo id="cc-email" rotulo="E-mail" erro={mostrar('email')} valido={!erros.email}>
            <input id="cc-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.com.br" value={v.email} onChange={mudar('email')} onBlur={sair('email')} aria-required="true" aria-invalid={!!mostrar('email')} aria-describedby={mostrar('email') ? 'cc-email-erro' : undefined} />
          </Campo>
          <Campo id="cc-phone" rotulo="Telefone" erro={mostrar('phone')} valido={!erros.phone}>
            <input id="cc-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="(00) 00000-0000" value={v.phone} onChange={mudar('phone')} onBlur={sair('phone')} aria-required="true" aria-invalid={!!mostrar('phone')} aria-describedby={mostrar('phone') ? 'cc-phone-erro' : undefined} />
          </Campo>
          <Campo
            id="cc-message"
            rotulo="Mensagem"
            area
            erro={mostrar('message')}
            valido={!erros.message}
            contador={<span className="cc-contador" aria-hidden="true">{v.message.length}/{MAX_MENSAGEM}</span>}
          >
            <textarea id="cc-message" name="message" rows={4} maxLength={MAX_MENSAGEM} autoComplete="off" placeholder="Conte sobre sua organização e como gostaria de participar…" value={v.message} onChange={mudar('message')} onBlur={sair('message')} aria-required="true" aria-invalid={!!mostrar('message')} aria-describedby={mostrar('message') ? 'cc-message-erro' : undefined} />
          </Campo>

          <div className="cc-reveal">
            <button className={'flow-button canopa-flow cc-enviar' + (pronto ? ' pronto' : '')} type="submit" disabled={enviando}>
              <FlowButtonContent>{enviando ? 'Enviando...' : erroEnvio && total === 4 ? 'Tentar de novo' : 'Enviar mensagem'}</FlowButtonContent>
            </button>
            {erroEnvio && (
              <p className="cc-erro cc-erro-envio" role="alert">
                <CircleAlert size={16} aria-hidden="true" /> {erroEnvio}
              </p>
            )}
            <p className="cc-nota">Ao enviar, você compartilha seus dados com a equipe do CANOPA.</p>
          </div>
        </form>
      )}
    </div>
  )
}
