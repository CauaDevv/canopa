/*
  Acesso à API do CANOPA (Cloudflare Worker em worker/index.js). Fica aqui, e não
  dentro de um componente, porque o formulário de contato e a área administrativa
  falam com o mesmo servidor.
*/
const API = import.meta.env.VITE_CANOPA_API || 'https://canopa-api.canopa.workers.dev'

export async function call(path, { method = 'GET', body, token } = {}) {
  if (!API) throw new Error('O serviço de dados ainda não está configurado.')
  const resposta = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(dados.error || 'Não foi possível conectar. Tente novamente.')
  return dados
}
