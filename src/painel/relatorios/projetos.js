import { PROJETOS } from '../dados-demo'

/*
  Dados de demonstração que só existem para a ficha de cada projeto e para os relatórios que falam
  dele: datas da jornada, andamento da instalação e a conta de luz de antes. Ficam num arquivo
  próprio para a ficha (detalhe.js) e os relatórios (dados.js) lerem o MESMO número: a creche e a
  escola aparecem nos dois lugares e não podem divergir.

  Nada aqui é real (parceiros e beneficiários são fictícios, ver dados-demo.js).
*/

const projeto = (id) => PROJETOS.find((p) => p.id === id)

export const PLACA_W = 550
export const placasDe = (p) => Math.ceil((p.kwp * 1000) / PLACA_W)

// painéis já instalados nos projetos em instalação
export const PAINEIS_INSTALADOS = { p3: 14 }

// quanto cada instituição pagava de luz por mês ANTES da energia solar (referência fixa da demonstração)
export const CONTA_SEM = { p1: 1290, p2: 960, p4: 650 }

// foto de capa de cada projeto (todas existem em public/images/fotos)
export const FOTOS = { p1: 'paineis-campo', p2: 'paineis-aerea', p3: 'paineis-aerea', p4: 'paineis-campo' }

/* a jornada de cada projeto: as mesmas quatro etapas do site (inscrição, parceria, instalação, operação) */
const instalado = PAINEIS_INSTALADOS.p3
const totalCreche = placasDe(projeto('p3'))

export const MARCOS = {
  p1: [
    { titulo: 'Inscrição', data: '12 de janeiro de 2026', texto: 'A escola apresentou sua necessidade e a conta de energia dos últimos meses.', estado: 'feito' },
    { titulo: 'Parceria', data: '3 de fevereiro de 2026', texto: `${projeto('p1').parceiro} apadrinhou o projeto e o investimento foi confirmado.`, estado: 'feito' },
    { titulo: 'Instalação', data: '2 a 18 de março de 2026', texto: 'Instalação dos painéis, inversores e do sistema de monitoramento.', estado: 'feito' },
    { titulo: 'Em operação', data: 'Desde 25 de março de 2026', texto: 'Ligação à rede da distribuidora e geração acompanhada todos os meses.', estado: 'atual' },
  ],
  p2: [
    { titulo: 'Inscrição', data: '20 de fevereiro de 2026', texto: 'O instituto apresentou sua necessidade e as contas de energia dos últimos meses.', estado: 'feito' },
    { titulo: 'Parceria', data: '14 de março de 2026', texto: `${projeto('p2').parceiro} apadrinhou o projeto e o investimento foi confirmado.`, estado: 'feito' },
    { titulo: 'Instalação', data: '13 a 29 de abril de 2026', texto: 'Instalação dos painéis, inversores e do sistema de monitoramento.', estado: 'feito' },
    { titulo: 'Em operação', data: 'Desde 5 de maio de 2026', texto: 'Ligação à rede da distribuidora e geração acompanhada todos os meses.', estado: 'atual' },
  ],
  p3: [
    { titulo: 'Inscrição', data: '9 de junho de 2026', texto: 'A creche apresentou sua necessidade e as contas de energia.', estado: 'feito' },
    { titulo: 'Parceria', data: '1º de setembro de 2026', texto: `${projeto('p3').parceiro} apadrinhou o projeto.`, estado: 'feito' },
    { titulo: 'Instalação dos painéis', data: 'Em andamento · atualizado em 28 de outubro', texto: `${instalado} de ${totalCreche} painéis instalados no telhado; a equipe segue com a parte elétrica.`, estado: 'atual' },
    { titulo: 'Vistoria da distribuidora', data: 'Previsto para novembro de 2026', texto: 'A distribuidora confere o sistema antes de autorizar a ligação.', estado: 'futuro' },
    { titulo: 'Em operação', data: 'Previsto para dezembro de 2026', texto: 'Ligação à rede e início do acompanhamento mensal de geração.', estado: 'futuro' },
  ],
  p4: [
    { titulo: 'Inscrição', data: '2 de abril de 2026', texto: 'A ONG apresentou sua necessidade e as contas de energia dos últimos meses.', estado: 'feito' },
    { titulo: 'Parceria', data: '5 de maio de 2026', texto: `${projeto('p4').parceiro} apadrinhou o projeto e o investimento foi confirmado.`, estado: 'feito' },
    { titulo: 'Instalação', data: '8 a 24 de junho de 2026', texto: 'Instalação dos painéis, inversores e do sistema de monitoramento.', estado: 'feito' },
    { titulo: 'Em operação', data: 'Desde 1º de julho de 2026', texto: 'Ligação à rede da distribuidora e geração acompanhada todos os meses.', estado: 'atual' },
  ],
}
