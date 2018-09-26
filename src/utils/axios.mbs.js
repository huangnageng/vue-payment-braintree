/*
 * axios 实例
 * 全局请求、回应的默认配置，拦截与处理
 */
import axios from 'axios'
import api from '../../config/api.js'
import store from '@/utils/store.js'
import Cookies from 'js-cookie'

// 默认配置
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.timeout = 30000

let urlPrefix
if (process.env.NODE_ENV === 'production') {
  // urlPrefix = api.origin
  // 生成环境就走这里
  urlPrefix = 'http:xxxx'
} else if (process.env.NODE_ENV === 'development') {
  urlPrefix = '/api'
}

// 创建实例，配置默认参数
let axiosMbs = axios.create({
  baseURL: urlPrefix + '/service/invoke',
  method: 'post',
  responseType: 'json',
  globalLoader: false, // 是否于请求发起时在页面显示 loader
  globalErrorTips: true, // 是否于请求出错时在页面弹出错误信息
  loginValidation: false, // 是否需要登录验证（如果为 true，在登录状态失效时跳转到登录页）
  params: {
    authtype: 'basic'
  },

  // 静态默认参数
  data: {
    network: 'WiFi', // 网络类型 2G 3G 4G WiFi
    ordersource: '7', // 来源[wap:4 touch:7 iphone:10 android:11 ipad:13]
    brandCode: store.data.brandId,
    brandId: store.data.brandId
  }
})

// 拦截请求
axiosMbs.interceptors.request.use(
  config => {
    config.globalLoader && app.riseLoader()

    // 如果需要登录验证，就通过 Cookies 获取登录状态信息（获取失败时：提示登录、跳转到登录页、抛出错误并取消请求）
    if (config.loginValidation) {
      const cusCode = Cookies.get('user-cusCode')
      const encryptCusCode = Cookies.get('user-useridDes')
      if (!cusCode || !encryptCusCode) {
        config.globalLoader && app.declineLoader()
        app.$dialog.toast({
          mes: store.data.pleaseLoginMsg,
          timeout: 2400,
          icon: 'error'
        })
        app.$router.push({
          path: '/sign/signIn',
          query: {
            backurl:
              app.$route.path +
              '?' +
              Object.entries(app.$route.query)
                .map(o => o[0] + '=' + o[1])
                .join('&')
          }
        })
        throw new axios.Cancel(
          'Operation canceled by the user: Please login before request(' +
            config.url +
            ')'
        )
      } else {
        config.data = Object.assign(
          {},
          { cusCode, encryptCusCode },
          config.data
        )
      }
    }
    return config
  },
  error => {
    if (error.config.globalErrorTips) {
      app.$dialog.toast({
        mes: store.data.networkErrorMsg,
        timeout: 2400,
        icon: 'error'
      })
    }

    return Promise.reject(error)
  }
)

// 拦截回应
axiosMbs.interceptors.response.use(
  response => {
    if (response.config && response.config.globalLoader) {
      app.declineLoader()
    }
    return response
  },
  error => {
    if (error.config && error.config.globalLoader) {
      app.declineLoader()
    }
    if (error.config && error.config.globalErrorTips) {
      app.$dialog.toast({
        mes: store.data.networkErrorMsg,
        timeout: 2400,
        icon: 'error'
      })
    }
    return Promise.reject(error)
  }
)

export default axiosMbs
