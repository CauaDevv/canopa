import { useEffect, useRef, useState } from 'react'

/*
  Faz uma lista de números "rolar" até o novo alvo (ease-out, ~0,5 s), partindo de onde
  eles estão agora: se o alvo muda no meio do caminho, a animação continua dali, sem
  tranco. Quem pediu menos movimento recebe o valor final na hora.

  `alvo` precisa ser estável (useMemo): uma lista nova a cada render reiniciaria o efeito.
  A lista não muda de tamanho entre chamadas; se mudar, pula direto para o alvo.
*/
export default function useAnimado(alvo, duracao = 520) {
  const [valor, setValor] = useState(alvo)
  const atual = useRef(alvo)

  useEffect(() => {
    const de = atual.current
    if (de === alvo) return
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzido || !duracao || de.length !== alvo.length) {
      atual.current = alvo
      setValor(alvo)
      return
    }
    let quadro = 0
    const inicio = performance.now()
    const passo = (agora) => {
      const k = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - (1 - k) ** 3
      const proximo = k === 1 ? alvo : alvo.map((v, i) => de[i] + (v - de[i]) * suave)
      atual.current = proximo
      setValor(proximo)
      if (k < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, duracao])

  return valor
}
