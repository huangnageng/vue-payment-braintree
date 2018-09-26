/*
 * 通用工具集
 */
export default {
  // 日期相关
  date: (() => {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'Auguest',
      'September',
      'October',
      'November',
      'December'
    ]
    return {
      getDayName(num, fullName) {
        num = Number(num)
        return fullName ? dayNames[num] : dayNames[num].slice(0, 3)
      },
      getMonthName(num, fullName) {
        num = Number(num) - 1
        return fullName ? monthNames[num] : monthNames[num].slice(0, 3)
      }
    }
  })(),

  // 本地临时存储
  sessionStorage: {
    getObj: function(name) {
      var item
      try {
        item = JSON.parse(sessionStorage.getItem(name))
      } catch (e) {
        console.log(e)
      }
      return item
    },
    setObj: function(name, obj) {
      try {
        sessionStorage.setItem(name, JSON.stringify(obj))
      } catch (e) {
        console.log(e)
      }
    }
  },

  // 本地永久存储
  localStorage: {
    getObj: function(name) {
      var item
      try {
        item = JSON.parse(localStorage.getItem(name))
      } catch (e) {
        console.log(e)
      }
      return item
    },
    setObj: function(name, obj) {
      try {
        localStorage.setItem(name, JSON.stringify(obj))
      } catch (e) {
        console.log(e)
      }
    }
  },

  loadScript: (url, callback) => {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    if (script.readyState) {
      //IE
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null
          if (callback !== undefined) callback()
        }
      }
    } else {
      //Others: Firefox, Safari, Chrome, and Opera
      script.onload = function(res) {
        if (callback !== undefined) callback()
      }
    }
    script.src = url
    document.body.appendChild(script)
  },
  //判断是否为空
  isNullOrEmpty: str => {
    if (str == null) {
      return true
    } else {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '').length == 0
    }
  },
  //过滤非法字符
  xssCheck: (str, reg) => {
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
  },
  //判断邮箱有效性
  JudgeEmail: email => {
    var reg = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
    return reg.test(email)
  }
}
