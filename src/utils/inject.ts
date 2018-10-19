import { inject as ij } from 'mobx-react'
import { Omit } from 'react-router'

export type InjectReturn<I, P extends I> = (
  Comp: React.ComponentType<P>,
) => React.ComponentClass<Omit<P, keyof I>>
/**
 * I 注入的props
 * P 组件所有的props
 */
export default function inject<I, P extends I = I>(
  props: (store: any) => I,
): InjectReturn<I, P>
export default function inject<I, P extends I = I>(
  ...stores: string[]
): InjectReturn<I, P>
export default function inject<I, P extends I = I>(
  ...args: any[]
): InjectReturn<I, P> {
  return (
    Comp: React.ComponentType<P>,
  ): React.ComponentClass<Omit<P, keyof I>> => {
    // @ts-ignore
    return ij(...args)(Comp)
  }
}

export type PropsMapper = (...args: any[]) => any
export type ExtractMobxInjectProps<T extends PropsMapper> = ReturnType<T>
