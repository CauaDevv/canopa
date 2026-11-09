/*
  DADOS DE DEMONSTRAÇÃO do painel do cliente. Nada aqui é real: parceiros e
  beneficiários são fictícios e existem só para mostrar como a visão do cliente vai
  ficar. Quando houver backend, esta camada é trocada por chamadas à API; as telas
  só leem `PROJETOS` e os totais derivados abaixo.

  Os totais NÃO são digitados: saem da soma dos projetos, para a demonstração ser
  coerente (a tabela, as métricas e a rosca sempre fecham entre si).
*/

// cores dos tipos validadas com a skill dataviz (L entre 0,43 e 0,77; chroma ≥ 0,10;
// CVD ΔE ≥ 9,9). O dourado tem contraste 2,3:1 com o branco, por isso a rosca sempre
// vem com legenda de valores visível, nunca só a cor.
export const TIPOS = {
  escola: { rotulo: 'Escolas', cor: '#0589a3' },
  creche: { rotulo: 'Creches', cor: '#e19b00' },
  instituto: { rotulo: 'Institutos e ONGs', cor: '#3f9d6e' },
}

export const STATUS = {
  operacao: { rotulo: 'Em operação' },
  instalacao: { rotulo: 'Instalação' },
}

// as mesmas etapas da "Jornada do projeto" do site
export const ETAPAS = ['Inscrição', 'Parceria', 'Instalação', 'Em operação']

export const PROJETOS = [
  { id: 'p1', parceiro: 'Empresa Aurora', beneficiario: 'Escola Comunitária Viver Bem', tipo: 'escola', investimento: 52000, economiaAnual: 13400, co2: 7.9, kwp: 21.6, status: 'operacao', etapa: 4, desde: 'mar/2026' },
  { id: 'p2', parceiro: 'Grupo Horizonte', beneficiario: 'Instituto Esperança e Vida', tipo: 'instituto', investimento: 38500, economiaAnual: 9980, co2: 5.8, kwp: 15.8, status: 'operacao', etapa: 4, desde: 'mai/2026' },
  { id: 'p3', parceiro: 'Solaris Tech', beneficiario: 'Creche Tia Maria', tipo: 'creche', investimento: 29500, economiaAnual: 7420, co2: 4.4, kwp: 11.9, status: 'instalacao', etapa: 3, desde: 'set/2026' },
  { id: 'p4', parceiro: 'Coop Verde Vale', beneficiario: 'ONG Raízes do Amanhã', tipo: 'instituto', investimento: 25000, economiaAnual: 6760, co2: 4.4, kwp: 10.2, status: 'operacao', etapa: 4, desde: 'jul/2026' },
]

const soma = (lista, campo) => lista.reduce((total, p) => total + p[campo], 0)

export function totais(projetos = PROJETOS) {
  const investimento = soma(projetos, 'investimento')
  const economiaAnual = soma(projetos, 'economiaAnual')
  return {
    investimento,
    economiaAnual,
    co2: Math.round(soma(projetos, 'co2') * 10) / 10,
    kwp: Math.round(soma(projetos, 'kwp') * 10) / 10,
    // retorno anual sobre o investimento: economia do ano ÷ investido
    roi: investimento ? (economiaAnual / investimento) * 100 : 0,
    projetos: projetos.length,
    emOperacao: projetos.filter((p) => p.status === 'operacao').length,
  }
}

// investimento por tipo de beneficiário, do maior para o menor (o maior começa às 12h na rosca)
export function porTipo(projetos = PROJETOS) {
  const mapa = new Map()
  for (const p of projetos) mapa.set(p.tipo, (mapa.get(p.tipo) || 0) + p.investimento)
  return [...mapa.entries()]
    .map(([tipo, valor]) => ({ tipo, valor, ...TIPOS[tipo] }))
    .sort((a, b) => b.valor - a.valor)
}
