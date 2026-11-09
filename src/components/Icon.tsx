import type { CSSProperties } from 'react'

// só a seta é usada (FlowButtonContent); os outros 12 ícones eram de outro projeto
const SETA = 'M5 12h14m-6-6 6 6-6 6'

export function Icon({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <svg className={'icon ' + className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={SETA} /></svg>
}
