/*
 * 项目工具集
 */
import Cookies from 'js-cookie'
// import store from "@/utils/store.js";

// 配置 用户信息名称映射
const userInfoKeyMap = {
  cusCode: 'Cuscode',
  name: 'Name',
  useridDes: 'UseridDes',
  headPicPath: 'HeadPicPath',
  recommendCode: 'RecommendCode',
  cusGradeID: 'CusGradeID' // 用户等级
}

export default {
  // 是否已登录（返回 true | false）
  isLoggedIn() {
    return !!(Cookies.get('user-cusCode') && Cookies.get('user-useridDes'))
  },

  // 保存用户信息到 Cookies，获取方法为 Cookies.get('user-x')
  setUserCookies(userInfoObj) {
    Object.keys(userInfoKeyMap).forEach(function(key, i) {
      Cookies.set('user-' + key, userInfoObj[userInfoKeyMap[key]], {
        expires: 30
      })
    })
    app.updateLoginState();
  },

  // 删除 Cookies 中的所有用户信息
  removeUserCookies() {
    Object.keys(userInfoKeyMap).forEach(function(key, i) {
      Cookies.remove('user-' + key)
    })
    app.updateLoginState();
  }
}
