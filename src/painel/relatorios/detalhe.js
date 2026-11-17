import { moeda, numero } from '../../lib/formatos'
import { duracao } from '../../lib/simulador'
import { PROJETOS } from '../dados-demo'
import { INICIO, MESES, OUT, RELATORIOS, economia, kwh, meses, retornoDoProjeto } from './dados'
import { CONTA_SEM, FOTOS, MARCOS, PAINEIS_INSTALADOS, PLACA_W, placasDe } from './projetos'

const NOTA_DEMO = 'Dados de demonstração: parceiros, beneficiários e valores são fictícios.'

/*
  Ficha de um projeto, montada como um relatório (mesmos blocos, mesmo leitor): capa, números,
  retorno do investimento, geração, antes e depois da conta, jornada e os relatórios que falam
  dele. Tudo sai de dados-demo.js, projetos.js e das mesmas funções dos relatórios, então o que
  a pessoa lê aqui fecha com a lista de projetos e com os relatórios.

  Projeto em operação e projeto em instalação têm fichas diferentes: quem ainda não gera não
  tem geração, conta nem retorno para mostrar, e sim andamento e previsão.
*/
export function detalheDoProjeto(id) {
  const p = PROJETOS.find((x) => x.id === id)
  if (!p) return null
  const placas = placasDe(p)
  const operacao = p.status === 'operacao'
  const relacionados = RELATORIOS.filter((r) => !r.projetos || r.projetos.includes(id))
    .sort((a, b) => Number(Boolean(b.projetos)) - Number(Boolean(a.projetos))) // os que falam só deste projeto vêm primeiro

  const base = {
    id: `projeto-${id}`,
    tipo: operacao ? 'projeto' : 'instalacao',
    titulo: p.beneficiario,
    periodo: 'dados até outubro de 2026',
    foto: FOTOS[id],
    andamento: !operacao,
    chamada: operacao ? `Apadrinhado por ${p.parceiro}, em operação desde ${p.desde}.` : `Instalação em andamento. Apadrinhado por ${p.parceiro}.`,
    dataRotulo: operacao ? `Em operação desde ${p.desde}` : 'Operação prevista para dezembro de 2026',
  }

  const notasFinais = {
    tipo: 'notas',
    titulo: 'Como lemos estes dados',
    itens: operacao
      ? [
          NOTA_DEMO,
          'A geração do mês é calculada a partir da economia nas contas e de uma tarifa de R$ 0,95 por kWh, com variação típica das estações do ano.',
          'A conta "sem energia solar" é uma referência fixa da demonstração; no projeto real ela vem do histórico de faturas da instituição.',
          'O retorno previsto divide o investimento pela economia anual, sem manutenção nem reajuste da energia.',
        ]
      : [
          NOTA_DEMO,
          'As datas futuras são previsões e podem mudar com a vistoria da distribuidora.',
          'A economia e o CO₂ são estimativas do projeto; os valores medidos começam a aparecer quando ele entrar em operação.',
        ],
  }

  const relacionadosBloco = {
    tipo: 'relacionados',
    eyebrow: 'Relatórios',
    titulo: 'Relatórios que falam deste projeto',
    subtitulo: 'Abra qualquer um para ver o projeto no contexto do conjunto.',
    ids: relacionados.map((r) => r.id),
  }

  const numerosBloco = (titulo, eyebrow) => ({
    tipo: 'numeros',
    variante: 'escuro',
    eyebrow,
    titulo,
    itens: [
      { rotulo: 'Investimento', valor: p.investimento, formato: 'moeda', nota: `Apadrinhado por ${p.parceiro}` },
      { rotulo: operacao ? 'Economia por ano' : 'Economia esperada', valor: p.economiaAnual, formato: 'moeda', unidade: operacao ? undefined : 'por ano', nota: 'Na conta de energia da instituição' },
      { rotulo: operacao ? 'Potência instalada' : 'Potência', valor: p.kwp, formato: 'dec', unidade: 'kWp', nota: `${placas} placas de ${PLACA_W} W` },
      { rotulo: operacao ? 'CO₂ evitado' : 'CO₂ a evitar', valor: p.co2, formato: 'dec', unidade: 't por ano', nota: 'Estimativa de demonstração' },
    ],
  })

  /* ---------- em instalação ---------- */
  if (!operacao) {
    const feitas = PAINEIS_INSTALADOS[id] ?? 0
    return {
      ...base,
      resumo: [],
      blocos: [
        {
          tipo: 'progresso',
          eyebrow: 'Andamento',
          titulo: 'Quanto da instalação já está pronta',
          valor: feitas / placas,
          rotulo: 'dos painéis instalados',
          detalhes: [
            { rotulo: 'Painéis instalados', valor: `${feitas} de ${placas}` },
            { rotulo: 'Etapa atual', valor: 'Instalação dos painéis' },
            { rotulo: 'Operação prevista', valor: 'Dezembro de 2026' },
          ],
        },
        numerosBloco('O projeto quando estiver em operação', 'O que vem por aí'),
        { tipo: 'tempo', eyebrow: 'Jornada', titulo: 'O que já aconteceu e o que falta', subtitulo: 'Atualizado a cada etapa concluída.', marcos: MARCOS[id] },
        relacionadosBloco,
        notasFinais,
      ],
    }
  }

  /* ---------- em operação ---------- */
  const r = retornoDoProjeto(id)
  const ms = meses(INICIO[id], OUT)
  const sem = CONTA_SEM[id]
  const com = ms.map((m) => Math.max(45, Math.round(sem - economia(p, m))))
  const media = com.reduce((s, v) => s + v, 0) / com.length
  const retornoMeses = (p.investimento / p.economiaAnual) * 12
  const geracao = ms.map((m) => kwh(p, m))
  const total = geracao.reduce((s, v) => s + v, 0)

  return {
    ...base,
    resumo: [],
    blocos: [
      numerosBloco('O projeto em uma olhada', 'Em números'),
      {
        tipo: 'progresso',
        eyebrow: 'Retorno do investimento',
        titulo: 'Quanto do investimento já voltou',
        valor: r.fracao,
        rotulo: 'já voltou em economia',
        detalhes: [
          { rotulo: 'Economia até agora', valor: moeda(r.acumulado) },
          { rotulo: 'Retorno total previsto em', valor: `cerca de ${duracao(retornoMeses)}` },
          { rotulo: 'Ritmo atual', valor: `${moeda(p.economiaAnual)} por ano` },
        ],
      },
      {
        tipo: 'barras',
        eyebrow: 'Geração',
        titulo: 'A energia que o sol entregou, mês a mês',
        subtitulo: `${numero(total)} kWh gerados desde ${p.desde}. As barras acompanham as estações do ano.`,
        modo: 'empilhado',
        formato: 'int',
        unidade: 'kWh',
        categorias: ms.map((m) => MESES[m]),
        series: [{ id: 'geracao', nome: 'Geração mensal', cor: '#2bc4d3', valores: geracao }],
      },
      {
        tipo: 'barras',
        eyebrow: 'Antes e depois',
        titulo: 'A conta de luz, mês a mês',
        subtitulo: 'A barra clara é quanto a instituição pagaria sem energia solar; a escura é o que ela pagou.',
        modo: 'sobreposto',
        formato: 'moeda',
        unidade: 'R$',
        categorias: ms.map((m) => MESES[m]),
        series: [
          { id: 'sem', nome: 'Sem energia solar', cor: '#5d8c92', valores: ms.map(() => sem) },
          { id: 'com', nome: 'Com energia solar', cor: '#2bc4d3', valores: com },
        ],
      },
      {
        tipo: 'destaque',
        variante: 'ouro',
        frase: ['A conta caiu de ', { d: moeda(sem) }, ' para cerca de ', { d: `${moeda(media)} por mês` }, '. Desde ', p.desde, ', ', { d: moeda(r.acumulado) }, ' ficaram com a instituição.'],
      },
      { tipo: 'tempo', eyebrow: 'Jornada', titulo: 'Do cadastro ao sol funcionando', subtitulo: 'As mesmas quatro etapas da jornada do CANOPA.', marcos: MARCOS[id] },
      relacionadosBloco,
      notasFinais,
    ],
  }
}
