/*
 * 全局状态管理
 */
// import Cookies from "js-cookie";

var store = {
  debug: true, // 用于控制后台日志输入，以提示状态修改

  // 普通的静态信息（注：请勿在其他任何地方修改）
  data: {
    brandId: '001728', // coco+jaimeson 品牌ID
    // brandId: '001725', // taylorandsage 品牌ID
    BusinessCode: '001124', // 店铺编码
    // BusinessCode: '001121', // astrneme 店铺编码
    networkErrorMsg: 'Network error, please try again later...', // 提示语：网络错误请重试
    pleaseLoginMsg: 'Oops, Please login first...' // 提示语：请登录
  },

  // // 用户状态信息（已弃用，请使用 Cookies 直接获取）
  // userInfo: {
  //   name: Cookies.get('user-name') || '',
  //   cusCode: Cookies.get('user-cusCode') || '',
  //   encryptCusCode: Cookies.get('user-useridDes') || '',
  //   cusGradeID: Cookies.get('user-cusGradeID') || '',
  //   headPicPath: Cookies.get('user-headPicPath') || '',
  //   recommendCode: Cookies.get('user-recommendCode') || '',
  // },

  // 状态信息，请建立额外方法修改
  state: {
    message: 'Hello!' // 示例 状态信息
  },

  setMessageAction(newValue) {
    // 示例 状态修改
    if (store.debug) console.log('setMessageAction triggered with', newValue)
    store.state.message = newValue
  },

  clearMessageAction() {
    // 示例 状态修改
    if (store.debug) console.log('clearMessageAction triggered')
    store.state.message = ''
  }
}

export default store
