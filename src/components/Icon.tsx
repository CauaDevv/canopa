import type { CSSProperties } from 'react'

export type IconName = 'arrow' | 'check' | 'clock' | 'catalog' | 'chat' | 'people' | 'lock' | 'spark' | 'refresh' | 'price' | 'video' | 'plus' | 'close'
const paths: Record<IconName, string> = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  catalog: 'M4 4h7l2 2h7v14H4zM8 10h8M8 14h5',
  chat: 'M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 1 1 18-4M8 10h8m-8 4h5',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  lock: 'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4m-4 5v2',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
  refresh: 'M20 7v5h-5M4 17v-5h5m10.2-4.7a8 8 0 0 0-13-2M4.8 16.7a8 8 0 0 0 13 2',
  price: 'M12 2v20m4-16h-6a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7',
  video: 'M3 5h12v14H3zM15 9l6-3v12l-6-3',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
}
export function Icon({ name, className = '', style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg className={'icon ' + className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
