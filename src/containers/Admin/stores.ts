/**
 * 在这里汇集所有需要注入的model
 */
import app, { AppModel } from './model'

const stores = {
  app,
}

export { AppModel }

export type Stores = typeof stores

export default stores
