/*
  O formulário de contato vive numa janela que só abre quando alguém clica no botão
  final da página (CampoMagnetico) ou em qualquer link para "#contato"/"#formulario"
  (ver App.jsx). Quando a janela abre, este aviso faz o formulário acender e levar o foco
  ao primeiro campo pendente.
*/
export const EVENTO_FORMULARIO = 'canopa:abrir-formulario'

// espera a janela terminar de aparecer antes de mover o foco (com movimento reduzido não há o que esperar)
export function chamarFormulario(espera = 450) {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const id = window.setTimeout(() => window.dispatchEvent(new CustomEvent(EVENTO_FORMULARIO)), reduzido ? 80 : espera)
  return () => window.clearTimeout(id)
}
