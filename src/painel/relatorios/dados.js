import { Hammer, FolderKanban, Leaf, Sun, Wallet } from 'lucide-react'
import { decimal, moeda, numero } from '../../lib/formatos'
import { PROJETOS, TIPOS } from '../dados-demo'

/*
  RELATÓRIOS DE EXEMPLO. Nada aqui é real: parceiros, beneficiários e valores são os
  mesmos fictícios do painel (`dados-demo.js`) e todo número dos relatórios SAI deles,
  para o que o cliente lê aqui fechar com a visão geral e a tabela de projetos.

  Um relatório é uma lista de blocos (numeros, barras, calendario, composicao, tempo,
  projetos, progresso, destaque, notas); o leitor só desenha o que está aqui. Quando
  houver backend, esta camada vira chamadas à API e as telas não mudam.

  Convenções da demonstração (todas ditas nas "Notas" de cada relatório):
  - geração em kWh = economia ÷ tarifa (R$ 0,95/kWh), com sazonalidade do Sudeste;
  - os projetos começaram a gerar quando entraram em operação (`INICIO`); quem está
    em instalação ainda não gera;
  - o calendário diário é uma distribuição ilustrativa do total do mês;
  - CO₂ segue os valores do painel (a metodologia final será definida com dados reais).
*/

export const TIPOS_RELATORIO = {
  impacto: { rotulo: 'Impacto', Icone: Leaf },
  geracao: { rotulo: 'Geração', Icone: Sun },
  contas: { rotulo: 'Prestação de contas', Icone: Wallet },
  projeto: { rotulo: 'Projeto', Icone: FolderKanban },
  instalacao: { rotulo: 'Instalação', Icone: Hammer },
}

const TARIFA = 0.95
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const BRUTO = [1.08, 1.04, 1.0, 0.93, 0.86, 0.82, 0.84, 0.92, 0.97, 1.04, 1.07, 1.09]
const SAZONAL = BRUTO.map((v) => (v * 12) / BRUTO.reduce((s, x) => s + x, 0)) // média 1 no ano
const INICIO = { p1: 2, p2: 4, p4: 6 } // mês (0 = janeiro) em que cada projeto começou a gerar
const OUT = 9
const CONSUMO_RESIDENCIA = 160 // kWh por mês, consumo residencial médio usado nas equivalências

const projeto = (id) => PROJETOS.find((p) => p.id === id)
const kwh = (p, m) => (INICIO[p.id] !== undefined && m >= INICIO[p.id] ? Math.round((p.economiaAnual / TARIFA / 12) * SAZONAL[m]) : 0)
const economia = (p, m) => kwh(p, m) * TARIFA
const co2 = (p, m) => (kwh(p, m) ? (p.co2 / 12) * SAZONAL[m] : 0)
const meses = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const somar = (lista, ms, f) => lista.reduce((s, p) => s + ms.reduce((t, m) => t + f(p, m), 0), 0)
const curto = (p) => p.beneficiario.replace(/^(Escola Comunitária|Instituto|Creche|ONG) /, '')
const dia = (iso) => iso.split('-').reverse().join('/')

// distribuição ilustrativa do total do mês em dias (determinística; alguns dias nublados)
function diasDoMes(total, n, nublados) {
  let a = 20261009
  const sorteio = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const pesos = Array.from({ length: n }, (_, i) => (nublados.includes(i) ? 0.38 + sorteio() * 0.2 : 0.85 + sorteio() * 0.4))
  const soma = pesos.reduce((s, x) => s + x, 0)
  const valores = pesos.map((w) => Math.round((total * w) / soma))
  const maior = valores.indexOf(Math.max(...valores))
  valores[maior] += total - valores.reduce((s, x) => s + x, 0) // o total do mês fecha exato
  return valores
}

const NOTA_DEMO = 'Dados de demonstração: parceiros, beneficiários e valores são fictícios.'

/* ---------- 1. Geração · outubro de 2026 ---------- */
function geracaoOutubro() {
  const ativos = PROJETOS
  const total = somar(ativos, [OUT], kwh)
  const dias = diasDoMes(total, 31, [3, 11, 12, 19, 27])
  const melhor = dias.indexOf(Math.max(...dias))
  const media = total / 31
  const fracos = dias.filter((v) => v < media * 0.6).length
  const eco = total * TARIFA
  const c = somar(ativos, [OUT], co2)
  return {
    id: 'geracao-2026-10',
    tipo: 'geracao',
    titulo: 'Geração de energia',
    chamada: 'Como o sol trabalhou em cada projeto durante outubro.',
    periodo: 'outubro de 2026',
    publicado: '2026-11-06',
    novo: true,
    resumo: [
      { rotulo: 'gerados', valor: `${numero(total)} kWh` },
      { rotulo: 'economizados', valor: moeda(eco) },
      { rotulo: 'CO₂ evitado', valor: `${decimal(c, 1)} t` },
    ],
    blocos: [
      {
        tipo: 'numeros',
        variante: 'escuro',
        eyebrow: 'Em números',
        titulo: 'O que o sol entregou em outubro',
        itens: [
          { rotulo: 'Energia gerada', valor: total, formato: 'int', unidade: 'kWh', nota: `${numero(total / 31)} kWh por dia, em média` },
          { rotulo: 'Economia nas contas', valor: eco, formato: 'moeda', nota: 'Soma das três instituições em operação' },
          { rotulo: 'CO₂ evitado', valor: c, formato: 'dec', unidade: 't', nota: 'Estimativa de demonstração' },
          { rotulo: 'Residências equivalentes', valor: total / CONSUMO_RESIDENCIA, formato: 'int', nota: `Consumo médio de ${CONSUMO_RESIDENCIA} kWh por mês` },
        ],
      },
      {
        tipo: 'calendario',
        eyebrow: 'Dia a dia',
        titulo: 'Os dias de outubro, do mais ao menos ensolarado',
        subtitulo: 'Cada quadrado é um dia. Quanto mais escuro, mais energia os projetos geraram.',
        ano: 2026,
        mes: OUT,
        valores: dias,
        unidade: 'kWh',
      },
      {
        tipo: 'destaque',
        frase: [`O melhor dia foi ${melhor + 1} de outubro, com `, { d: `${numero(dias[melhor])} kWh` }, `. Mesmo com ${fracos} dias de céu fechado, o mês fechou em `, { d: `${numero(total)} kWh` }, '.'],
      },
      {
        tipo: 'barras',
        eyebrow: 'Por projeto',
        titulo: 'Quanto cada projeto gerou',
        subtitulo: 'Energia gerada em outubro. A Creche Tia Maria ainda está em instalação.',
        modo: 'empilhado',
        formato: 'int',
        unidade: 'kWh',
        categorias: PROJETOS.map(curto),
        series: [{ id: 'geracao', nome: 'Geração em outubro', cor: '#0a7480', valores: PROJETOS.map((p) => kwh(p, OUT)) }],
        vazio: 'em instalação',
      },
      {
        tipo: 'notas',
        titulo: 'Como lemos estes dados',
        itens: [
          `${NOTA_DEMO}`,
          'A geração do mês é calculada a partir da economia nas contas e de uma tarifa de R$ 0,95 por kWh.',
          'A divisão por dia é uma distribuição ilustrativa do total do mês; com os medidores reais ela passa a ser medida.',
          `A equivalência em residências usa um consumo médio de ${CONSUMO_RESIDENCIA} kWh por mês.`,
        ],
      },
    ],
  }
}

/* ---------- 2. Impacto · 3º trimestre ---------- */
function impactoTrimestre() {
  const t3 = meses(6, 8)
  const ope = PROJETOS.filter((p) => p.status === 'operacao')
  const gerado = somar(ope, t3, kwh)
  const eco = somar(ope, t3, economia)
  const c = somar(ope, t3, co2)
  const ms = meses(2, 8)
  const serie = (tipo) => ms.map((m) => PROJETOS.filter((p) => p.tipo === tipo).reduce((s, p) => s + kwh(p, m), 0))
  return {
    id: 'impacto-2026-t3',
    tipo: 'impacto',
    titulo: 'Impacto do 3º trimestre',
    chamada: 'O sol nasceu para mais instituições a cada mês.',
    periodo: 'julho a setembro de 2026',
    publicado: '2026-10-08',
    foto: 'paineis-aerea',
    resumo: [
      { rotulo: 'gerados', valor: `${numero(gerado)} kWh` },
      { rotulo: 'economizados', valor: moeda(eco) },
      { rotulo: 'CO₂ evitado', valor: `${decimal(c, 1)} t` },
    ],
    blocos: [
      {
        tipo: 'numeros',
        variante: 'escuro',
        eyebrow: 'O trimestre em números',
        titulo: 'Três meses de sol trabalhando',
        itens: [
          { rotulo: 'Energia gerada', valor: gerado, formato: 'int', unidade: 'kWh', nota: `Equivale a ${numero(gerado / (CONSUMO_RESIDENCIA * 3))} residências no trimestre` },
          { rotulo: 'Economia nas contas', valor: eco, formato: 'moeda', nota: 'Dinheiro que ficou nas instituições' },
          { rotulo: 'CO₂ evitado', valor: c, formato: 'dec', unidade: 't', nota: 'Estimativa de demonstração' },
          { rotulo: 'Instituições em operação', valor: ope.length, formato: 'int', nota: `${PROJETOS.length} projetos apadrinhados no total` },
        ],
      },
      {
        tipo: 'destaque',
        variante: 'ouro',
        frase: ['Neste trimestre, ', { d: `${ope.length} instituições` }, ' deixaram de pagar, juntas, ', { d: moeda(eco) }, ' de luz. É o dinheiro que volta para a sala de aula, a merenda e o atendimento.'],
      },
      {
        tipo: 'barras',
        eyebrow: 'Crescimento',
        titulo: 'Cada projeto novo, mais energia',
        subtitulo: 'Geração mensal desde março, por tipo de beneficiário. As barras variam com as estações do ano e dão um salto sempre que um projeto novo entra em operação.',
        modo: 'empilhado',
        formato: 'int',
        unidade: 'kWh',
        categorias: ms.map((m) => MESES[m]),
        series: [
          { id: 'escolas', nome: TIPOS.escola.rotulo, cor: TIPOS.escola.cor, valores: serie('escola') },
          { id: 'institutos', nome: TIPOS.instituto.rotulo, cor: TIPOS.instituto.cor, valores: serie('instituto') },
        ],
      },
      {
        tipo: 'projetos',
        eyebrow: 'Projetos',
        titulo: 'Onde o sol está trabalhando',
        subtitulo: 'Quanto do investimento de cada projeto já voltou em economia.',
        ids: PROJETOS.map((p) => p.id),
      },
      {
        tipo: 'notas',
        titulo: 'Como lemos estes dados',
        itens: [
          NOTA_DEMO,
          'O trimestre considera só os projetos em operação; a Creche Tia Maria entra quando a instalação terminar.',
          'Economia = energia gerada × tarifa de R$ 0,95 por kWh. O CO₂ segue os valores do painel e a metodologia será definida com dados reais.',
        ],
      },
    ],
  }
}

/* ---------- 3. Prestação de contas · acumulado até outubro ---------- */
function prestacaoDeContas() {
  const ms = meses(0, OUT)
  const investido = PROJETOS.reduce((s, p) => s + p.investimento, 0)
  const acumulada = somar(PROJETOS, ms, economia)
  const anual = PROJETOS.reduce((s, p) => s + p.economiaAnual, 0)
  const retorno = (acumulada / investido) * 100
  const partes = [
    { nome: 'Painéis solares', pct: 45 },
    { nome: 'Estruturas e instalação', pct: 22 },
    { nome: 'Inversores e proteção', pct: 15 },
    { nome: 'Projeto e homologação', pct: 10 },
    { nome: 'Monitoramento e seguro', pct: 8 },
  ].map((x) => ({ nome: x.nome, valor: Math.round((investido * x.pct) / 100) }))
  return {
    id: 'contas-2026-10',
    tipo: 'contas',
    titulo: 'Prestação de contas',
    chamada: 'Para onde foi cada real apadrinhado e quanto já voltou.',
    periodo: 'acumulado até outubro de 2026',
    publicado: '2026-11-05',
    resumo: [
      { rotulo: 'investidos', valor: moeda(investido) },
      { rotulo: 'já economizados', valor: moeda(acumulada) },
      { rotulo: 'retorno até aqui', valor: `${decimal(retorno, 1)}%` },
    ],
    blocos: [
      {
        tipo: 'numeros',
        variante: 'escuro',
        eyebrow: 'Resumo',
        titulo: 'O que foi investido e o que voltou',
        itens: [
          { rotulo: 'Investimento total', valor: investido, formato: 'moeda', nota: `${PROJETOS.length} projetos apadrinhados` },
          { rotulo: 'Economia acumulada', valor: acumulada, formato: 'moeda', nota: 'Em contas de energia, desde o início de cada operação' },
          { rotulo: 'Retorno até aqui', valor: retorno, formato: 'pct', nota: 'Economia acumulada ÷ investimento' },
          { rotulo: 'Ritmo atual', valor: anual, formato: 'moeda', unidade: 'por ano', nota: 'Economia anual dos projetos' },
        ],
      },
      {
        tipo: 'composicao',
        eyebrow: 'Destino do investimento',
        titulo: 'Para onde foi cada real',
        subtitulo: 'Distribuição do investimento total entre as etapas de um projeto solar.',
        partes,
      },
      {
        tipo: 'destaque',
        variante: 'ouro',
        frase: ['Cada R$ 1 investido já devolveu ', { d: `R$ ${decimal(acumulada / investido, 2)}` }, ' em economia, e o ritmo atual é de ', { d: `${moeda(anual)} por ano` }, '.'],
      },
      {
        tipo: 'projetos',
        eyebrow: 'Retorno por projeto',
        titulo: 'Quanto já voltou em cada um',
        subtitulo: 'Projetos em instalação ainda não geram economia; o retorno começa quando entram em operação.',
        ids: PROJETOS.map((p) => p.id),
      },
      {
        tipo: 'notas',
        titulo: 'Como lemos estes dados',
        itens: [
          NOTA_DEMO,
          'A divisão do investimento por etapa é ilustrativa; no relatório real ela vem das notas e contratos de cada projeto.',
          'O retorno considera só a economia na conta de energia. Manutenção e troca de inversor entram na avaliação de longo prazo.',
        ],
      },
    ],
  }
}

/* ---------- 4. Projeto · Escola Comunitária Viver Bem ---------- */
function projetoEscola() {
  const p = projeto('p1')
  const ms = meses(2, 8)
  const sem = 1290
  const com = ms.map((m) => Math.max(45, Math.round(sem - economia(p, m))))
  const media = com.reduce((s, v) => s + v, 0) / com.length
  return {
    id: 'projeto-viver-bem',
    tipo: 'projeto',
    titulo: p.beneficiario,
    chamada: `Sete meses de sol na escola, apadrinhada por ${p.parceiro}.`,
    periodo: 'março a setembro de 2026',
    publicado: '2026-10-02',
    foto: 'paineis-campo',
    resumo: [
      { rotulo: 'investimento', valor: moeda(p.investimento) },
      { rotulo: 'economia por ano', valor: moeda(p.economiaAnual) },
      { rotulo: 'potência', valor: `${decimal(p.kwp, 1)} kWp` },
    ],
    blocos: [
      {
        tipo: 'numeros',
        variante: 'escuro',
        eyebrow: 'A escola em números',
        titulo: 'O projeto em uma olhada',
        itens: [
          { rotulo: 'Investimento', valor: p.investimento, formato: 'moeda', nota: `Apadrinhado por ${p.parceiro}` },
          { rotulo: 'Economia por ano', valor: p.economiaAnual, formato: 'moeda', nota: 'Na conta de energia da escola' },
          { rotulo: 'Potência instalada', valor: p.kwp, formato: 'dec', unidade: 'kWp', nota: `${Math.ceil((p.kwp * 1000) / 550)} placas de 550 W` },
          { rotulo: 'CO₂ evitado', valor: p.co2, formato: 'dec', unidade: 't por ano', nota: 'Estimativa de demonstração' },
        ],
      },
      {
        tipo: 'barras',
        eyebrow: 'Antes e depois',
        titulo: 'A conta de luz da escola, mês a mês',
        subtitulo: 'A barra clara é quanto a escola pagaria sem energia solar; a escura é o que ela pagou.',
        modo: 'sobreposto',
        formato: 'moeda',
        unidade: 'R$',
        categorias: ms.map((m) => MESES[m]),
        series: [
          { id: 'sem', nome: 'Sem energia solar', cor: '#bcdcdb', valores: ms.map(() => sem) },
          { id: 'com', nome: 'Com energia solar', cor: '#0a7480', valores: com },
        ],
      },
      {
        tipo: 'destaque',
        variante: 'ouro',
        frase: ['A conta da escola caiu de ', { d: moeda(sem) }, ' para cerca de ', { d: `${moeda(media)} por mês` }, '. O que sobra fica para o que importa: a sala de aula.'],
      },
      {
        tipo: 'tempo',
        eyebrow: 'Jornada',
        titulo: 'Do cadastro ao sol funcionando',
        subtitulo: 'As mesmas quatro etapas da jornada do CANOPA.',
        marcos: [
          { titulo: 'Inscrição', data: '12 de janeiro de 2026', texto: 'A escola apresentou sua necessidade e a conta de energia dos últimos meses.', estado: 'feito' },
          { titulo: 'Parceria', data: '3 de fevereiro de 2026', texto: `${p.parceiro} apadrinhou o projeto e o investimento foi confirmado.`, estado: 'feito' },
          { titulo: 'Instalação', data: '2 a 18 de março de 2026', texto: 'Instalação dos painéis, inversores e do sistema de monitoramento.', estado: 'feito' },
          { titulo: 'Em operação', data: 'Desde 25 de março de 2026', texto: 'Ligação à rede da distribuidora e geração acompanhada todos os meses.', estado: 'atual' },
        ],
      },
      {
        tipo: 'notas',
        titulo: 'Como lemos estes dados',
        itens: [
          NOTA_DEMO,
          'A conta "sem energia solar" é uma referência fixa de R$ 1.290 por mês; no relatório real ela vem do histórico de faturas da escola.',
          'A conta "com energia solar" tem um piso: a taxa mínima da distribuidora continua sendo cobrada.',
        ],
      },
    ],
  }
}

/* ---------- 5. Instalação · Creche Tia Maria (em andamento) ---------- */
function instalacaoCreche() {
  const p = projeto('p3')
  const total = Math.ceil((p.kwp * 1000) / 550)
  const feitas = 14
  return {
    id: 'instalacao-tia-maria',
    tipo: 'instalacao',
    titulo: p.beneficiario,
    chamada: `A instalação está em andamento. Apadrinhada por ${p.parceiro}.`,
    periodo: 'atualizado em 28 de outubro de 2026',
    publicado: '2026-10-28',
    andamento: true,
    foto: 'paineis-aerea',
    resumo: [
      { rotulo: 'dos painéis instalados', valor: `${Math.round((feitas / total) * 100)}%` },
      { rotulo: 'potência', valor: `${decimal(p.kwp, 1)} kWp` },
      { rotulo: 'operação prevista', valor: 'dez/2026' },
    ],
    blocos: [
      {
        tipo: 'progresso',
        eyebrow: 'Andamento',
        titulo: 'Quase metade do caminho já passou',
        valor: feitas / total,
        rotulo: 'dos painéis instalados',
        detalhes: [
          { rotulo: 'Painéis instalados', valor: `${feitas} de ${total}` },
          { rotulo: 'Etapa atual', valor: 'Instalação dos painéis' },
          { rotulo: 'Operação prevista', valor: 'Dezembro de 2026' },
        ],
      },
      {
        tipo: 'numeros',
        variante: 'escuro',
        eyebrow: 'O que vem por aí',
        titulo: 'O projeto quando estiver em operação',
        itens: [
          { rotulo: 'Investimento', valor: p.investimento, formato: 'moeda', nota: `Apadrinhado por ${p.parceiro}` },
          { rotulo: 'Economia esperada', valor: p.economiaAnual, formato: 'moeda', unidade: 'por ano', nota: 'Na conta de energia da creche' },
          { rotulo: 'Potência', valor: p.kwp, formato: 'dec', unidade: 'kWp', nota: `${total} placas de 550 W` },
          { rotulo: 'CO₂ a evitar', valor: p.co2, formato: 'dec', unidade: 't por ano', nota: 'Estimativa de demonstração' },
        ],
      },
      {
        tipo: 'tempo',
        eyebrow: 'Jornada',
        titulo: 'O que já aconteceu e o que falta',
        subtitulo: 'Atualizado a cada etapa concluída.',
        marcos: [
          { titulo: 'Inscrição', data: '9 de junho de 2026', texto: 'A creche apresentou sua necessidade e as contas de energia.', estado: 'feito' },
          { titulo: 'Parceria', data: '1º de setembro de 2026', texto: `${p.parceiro} apadrinhou o projeto.`, estado: 'feito' },
          { titulo: 'Instalação dos painéis', data: 'Em andamento · atualizado em 28 de outubro', texto: `${feitas} de ${total} painéis instalados no telhado; a equipe segue com a parte elétrica.`, estado: 'atual' },
          { titulo: 'Vistoria da distribuidora', data: 'Previsto para novembro de 2026', texto: 'A distribuidora confere o sistema antes de autorizar a ligação.', estado: 'futuro' },
          { titulo: 'Em operação', data: 'Previsto para dezembro de 2026', texto: 'Ligação à rede e início do acompanhamento mensal de geração.', estado: 'futuro' },
        ],
      },
      {
        tipo: 'notas',
        titulo: 'Como lemos estes dados',
        itens: [
          NOTA_DEMO,
          'As datas futuras são previsões e podem mudar com a vistoria da distribuidora.',
          'A economia e o CO₂ são estimativas do projeto; os valores medidos começam a aparecer quando a creche entrar em operação.',
        ],
      },
    ],
  }
}

// do mais recente para o mais antigo
export const RELATORIOS = [geracaoOutubro(), prestacaoDeContas(), instalacaoCreche(), impactoTrimestre(), projetoEscola()].sort((a, b) => b.publicado.localeCompare(a.publicado))

export const relatorioPorId = (id) => RELATORIOS.find((r) => r.id === id)
export const dataPublicado = (r) => dia(r.publicado)

// quanto do investimento de um projeto já voltou em economia, até outubro
export function retornoDoProjeto(id) {
  const p = projeto(id)
  const acumulado = somar([p], meses(0, OUT), economia)
  return { acumulado, fracao: acumulado / p.investimento, co2: somar([p], meses(0, OUT), co2) }
}
