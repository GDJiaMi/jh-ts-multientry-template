import P, { h } from 'preact'
import { log } from 'js/utils/common'
import 'css/a.css'

console.log('fuckxx')

export default class H extends P.Component<void, void> {
  public componentDidMount() {
    log('hi')
  }
  public render() {
    return <div>hello</div>
  }
}
