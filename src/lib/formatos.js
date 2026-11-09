const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// o Intl separa "R$" do valor com espaço não-quebrável; um espaço comum copia melhor
export const moeda = (v) => brl.format(v).replace(/ /g, ' ')

export const decimal = (v, casas = 1) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v)

export const percentual = (v, casas = 1) => `${decimal(v, casas)}%`

// created_at vem do D1 como "AAAA-MM-DD HH:MM:SS" em UTC
export function dataHora(criadoEm) {
  return new Date(criadoEm.replace(' ', 'T') + 'Z').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

export const iniciais = (texto) =>
  (texto || '').split(/[@\s.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'CA'
