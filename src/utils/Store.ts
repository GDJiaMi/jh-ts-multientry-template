/**
 * 用于被mobx model 继承，实现model之间通信
 */
export default class Store {
  private static listeners: { [key: string]: Function[] } = {}
  protected addEventListener(name: string, callback: () => void) {
    if (Store.listeners[name]) {
      Store.listeners[name].push(callback)
    } else {
      Store.listeners[name] = [callback]
    }
  }

  protected emit(name: string) {
    const list = Store.listeners[name]
    if (list) {
      list.forEach(callback => callback())
    }
  }
}
