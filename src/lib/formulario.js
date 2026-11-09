/*
  O botão final da página (CampoMagnetico) leva até o formulário. A rolagem é do
  Lenis (SmoothScroll trata todo link "#…"); aqui só se avisa o formulário, depois
  que a rolagem chega, para ele acender e levar o foco ao primeiro campo pendente.
*/
export const EVENTO_FORMULARIO = 'canopa:abrir-formulario'

// 1,1 s é a duração das âncoras no SmoothScroll; com movimento reduzido a rolagem é instantânea
const ESPERA_ROLAGEM_MS = 1250

export function chamarFormulario() {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.setTimeout(() => window.dispatchEvent(new CustomEvent(EVENTO_FORMULARIO)), reduzido ? 80 : ESPERA_ROLAGEM_MS)
}
