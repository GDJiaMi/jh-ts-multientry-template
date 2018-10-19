/**
 * 根组件
 */
import React from 'react'
import { Router } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { LocaleProvider } from 'antd'
import { Title } from '@gdjiami/rc-components'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import history from '@src/history'
import stores from './stores'
import Routes from './Routes'
import './style.css'

export default class App extends React.Component {
  public render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Provider {...stores}>
          <Router history={history}>
            <Title.Provider>
              <Routes />
            </Title.Provider>
          </Router>
        </Provider>
      </LocaleProvider>
    )
  }
}

moment.locale('zh-cn')
