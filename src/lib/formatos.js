const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// o Intl separa "R$" do valor com espaço não-quebrável; um espaço comum copia melhor
export const moeda = (v) => brl.format(v).replace(/ /g, ' ')

export const decimal = (v, casas = 1) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v)

export const percentual = (v, casas = 1) => `${decimal(v, casas)}%`

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
export const numero = (v) => inteiro.format(Math.round(v))

// eixo de gráfico: por extenso abaixo de 10 mil (1.250), compacto depois (10 mil, 2,5 mi)
export function compacto(v) {
  if (v < 10000) return numero(v)
  if (v < 1e6) {
    const k = v / 1000
    return `${decimal(k, Number.isInteger(k) ? 0 : 1)} mil`
  }
  const m = v / 1e6
  return `${decimal(m, Number.isInteger(m) ? 0 : 1)} mi`
}

// teto "redondo" de um gráfico: o menor de 1, 1,5, 2, 3, 4, 5, 6, 8 ou 10 × potência de dez que cabe o valor (a metade também é um número limpo)
const PASSOS_DO_TETO = [1, 1.5, 2, 3, 4, 5, 6, 8, 10]
export function tetoRedondo(valor) {
  const potencia = 10 ** Math.floor(Math.log10(valor))
  const n = valor / potencia
  return (PASSOS_DO_TETO.find((p) => n <= p) ?? 10) * potencia
}

// created_at vem do D1 como "AAAA-MM-DD HH:MM:SS" em UTC
export function dataHora(criadoEm) {
  return new Date(criadoEm.replace(' ', 'T') + 'Z').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

export const iniciais = (texto) =>
  (texto || '').split(/[@\s.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'CA'
