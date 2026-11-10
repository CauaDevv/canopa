/*
  Modelo do simulador de economia ("Quanto a sua instituição poderia economizar?").
  Funções puras, sem React: a tela só desenha o que sai daqui.

  É uma ESTIMATIVA para dar ordem de grandeza, não uma proposta: o valor real depende
  da visita técnica, do contrato com a distribuidora e do projeto. Por isso toda
  premissa está nomeada abaixo e a tela a mostra ("Ver tabela e premissas"); o site
  promete estimativas "com suas fontes e premissas", e é isto que cumpre a promessa.

  Fontes e escolhas (conferidas em nov/2026):
  - custoKwp: preços de sistemas on-grid no Brasil ficam entre R$ 2,4 e R$ 3,2 por Wp
    (Greener e Solfácil, 2024-2025; cotação pública de 2025 em ~R$ 3,2 mil/kWp).
    Usamos a ponta alta da faixa, que inclui instalação, para não prometer demais.
  - co2PorKwh: fator médio do Sistema Interligado Nacional em 2023, 38,5 kg CO₂/MWh
    (MCTI). A rede brasileira é limpa, então o CO₂ evitado por kWp é pequeno de
    propósito: usar o fator de países com rede a carvão inflaria o número.
  - horas de sol (hsp): médias regionais aproximadas do Atlas Brasileiro de Energia Solar.
  - tarifa, cobertura, rendimento: valores típicos; mudam de distribuidora para distribuidora.
*/

import { compacto, numero, tetoRedondo } from './formatos'

// o gráfico e as telas do simulador importam daqui; os formatadores moraram em formatos.js para os relatórios também usarem
export { compacto, numero }

export const PREMISSAS = {
  tarifa: 0.95, // R$ por kWh, com impostos
  custoKwp: 3200, // R$ por kWp instalado
  cobertura: 0.9, // fatia da conta que o sistema cobre (o resto é taxa mínima e encargos)
  contaMinima: 40, // R$ por mês que sempre sobra, qualquer que seja a geração
  placaW: 550, // potência de cada placa
  anos: 25, // vida útil considerada
  perdaAnual: 0.005, // as placas perdem ~0,5% de produção por ano
  manutencao: 0.01, // 1% do custo do sistema por ano (limpeza, seguro, troca do inversor)
  rendimento: 0.8, // perdas do sistema (calor, cabos, inversor, sujeira)
  co2PorKwh: 0.0385, // kg de CO₂ evitado por kWh gerado
}

// horas de sol pleno por dia, por região
export const REGIOES = [
  { nome: 'Norte', hsp: 4.6 },
  { nome: 'Nordeste', hsp: 5.5 },
  { nome: 'Centro-Oeste', hsp: 5.2 },
  { nome: 'Sudeste', hsp: 4.9 },
  { nome: 'Sul', hsp: 4.4 },
]
export const REGIAO_INICIAL = 'Sudeste'

// escolas, creches e ONGs: contas de algumas centenas a poucos milhares de reais
export const CONTA = { min: 300, max: 6000, passo: 50, inicial: 1800 }
export const REAJUSTE = { min: 3, max: 10, passo: 0.5, inicial: 5 }

export function calcular({ conta, hsp, reajuste }) {
  const p = PREMISSAS
  const kwh = conta / p.tarifa
  const kwp = (kwh * p.cobertura) / (hsp * 30 * p.rendimento)
  const placas = Math.ceil((kwp * 1000) / p.placaW)
  const custo = kwp * p.custoKwp
  const nova = Math.max(p.contaMinima, conta * (1 - p.cobertura))
  const mes = Math.max(0, conta - nova)
  const manutencao = custo * p.manutencao

  const acumulado = [0]
  let total = 0
  let retornoMeses = 0
  let kwhGerado = 0
  for (let ano = 1; ano <= p.anos; ano++) {
    const producao = 1 - p.perdaAnual * (ano - 1)
    const bruto = mes * 12 * (1 + reajuste / 100) ** (ano - 1) * producao
    const liquido = bruto - manutencao
    if (!retornoMeses && liquido > 0 && total + liquido >= custo) {
      retornoMeses = (ano - 1) * 12 + ((custo - total) / liquido) * 12
    }
    total += liquido
    acumulado.push(total)
    kwhGerado += kwh * p.cobertura * 12 * producao
  }

  return {
    conta,
    hsp,
    reajuste,
    nova,
    mes,
    kwp,
    placas,
    custo,
    acumulado,
    total,
    retornoMeses, // 0 = não se paga dentro do período
    co2: (kwhGerado * p.co2PorKwh) / 1000, // toneladas no período
    escala: tetoRedondo(Math.max(total, custo) * 1.08),
  }
}

// "3 anos e 2 meses", "8 meses"
export function duracao(meses) {
  let anos = Math.floor(meses / 12)
  let resto = Math.round(meses % 12)
  if (resto === 12) {
    anos += 1
    resto = 0
  }
  const a = anos ? `${anos} ${anos > 1 ? 'anos' : 'ano'}` : ''
  const m = resto ? `${resto} ${resto > 1 ? 'meses' : 'mês'}` : ''
  return a && m ? `${a} e ${m}` : a || m || 'menos de 1 mês'
}

// frase para leitor de tela (a tela muda a cada gesto; só o resultado final é lido)
export const frase = (r) =>
  `Com conta de R$ ${numero(r.conta)} por mês, a economia estimada em ${PREMISSAS.anos} anos é de R$ ${numero(r.total)}. ` +
  `O sistema de ${r.placas} placas se paga em ${r.retornoMeses ? duracao(r.retornoMeses) : `mais de ${PREMISSAS.anos} anos`}.`
