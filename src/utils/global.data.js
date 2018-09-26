const userInfo = {
  cuscode: '34176846',
  EncryptCusCode: '35F56807DB55B5C2F63DEB3C60AAA58C',
  brandId: '001728', //品牌id
  BusinessCode:'001124',//店铺编码
  CusGradeID: 0 //用户等级
  // cuscode: '34158840',
  // EncryptCusCode: '9CA6FB2692274A56BE3E9097CD370C3F'
}

function isNullOrEmpty(str) {
  //判断是否为空
  if (str == null) {
    return true
  } else {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '').length == 0
  }
}
function xssCheck(str, reg) {
  //过滤非法字符
  return str
    ? str.replace(
        reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g,
        function(a, b) {
          if (b) {
            return a
          } else {
            return {
              '<': '&lt;',
              '&': '&amp;',
              '"': '&quot;',
              '>': '&gt;',
              "'": '&#39;'
            }[a]
          }
        }
      )
    : ''
}

const tips = {
  networkError: 'Network error, please try again later...'
}

// export { userInfo }
export default {
  userInfo: userInfo,
  isNullOrEmpty: isNullOrEmpty,
  xssCheck: xssCheck,
  tips
}
