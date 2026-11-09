import { Icon } from './Icon'

/** Shared visual layer: links stay links and submit buttons keep their behavior. */
export function FlowButtonContent({ children }: { children: string }) {
  return <>
    <span className="flow-button__arrow flow-button__arrow--in" aria-hidden="true"><Icon /></span>
    <span className="flow-button__text">{children}</span>
    <span className="flow-button__circle" aria-hidden="true" />
    <span className="flow-button__arrow flow-button__arrow--out" aria-hidden="true"><Icon /></span>
  </>
}
