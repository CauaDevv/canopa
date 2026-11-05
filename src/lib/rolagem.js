/*
  Velocidade de rolagem atual, em px/quadro, escrita pelo Lenis (ver SmoothScroll)
  e lida pelas fitas, que aceleram e inclinam com o gesto do visitante.
  Fica num objeto mutável em vez de estado do React: muda a cada quadro e
  re-renderizar por isso seria desperdício.
*/
export const rolagem = { velocidade: 0 }
