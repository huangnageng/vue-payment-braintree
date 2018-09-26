// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

let debug = false // 是否输出状态改变的信息
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  // 请勿直接修改 data，而是通过 methods 间接修改，以便追踪状态
  // data: {
  //   loaderCount: 0, // 全局 loader 数量（只用于控制 loader 显示与否，视图中的全局 loader 始终唯一）
  //   isLoggedIn: common.isLoggedIn() // 登录状态
  // },

  methods: {
    // 增加 loader（请与 declineLoader 配套使用）
    riseLoader() {
      app.loaderCount += 1
      debug && console.log('global loader rised: ' + app.loaderCount)
    },

    // 减少 loader（请与 riseLoader 配套使用）
    declineLoader() {
      app.loaderCount -= 1
      debug && console.log('global loader declined: ' + app.loaderCount)
    },

    updateLoginState() {
      app.isLoggedIn = common.isLoggedIn()
      debug && console.log('login state changed: ' + app.isLoggedIn)
    }
  },
  beforeCreate() {
    window.app = this
  }
})
