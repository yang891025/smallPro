//app.js
App({
  globalData: {
    api: "https://e.tbs.com.cn",
    userInfo: null,
    code: '',
    webShowed: false //标记web-view页面是否已经显示过了
  },
  onLaunch: function() {
    //wx.clearStorageSync();
    // // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    if (wx.getStorageSync("LoginKey") != "") {
      wx.request({
        url: this.globalData.api + "/CheckLogin.cbs",
        data: {
          loginId: wx.getStorageSync("LoginKey"),
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        success: res4 => {
          if ((parseInt(res4.statusCode) == 200) && res4.data.result) {
            wx.setStorageSync("LoginKey", "")
            wx.setStorageSync("openid", "")
            wx.setStorageSync("account", "")
            wx.setStorageSync("mobile", "")
            // 登录
            wx.login({
              success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                this.globalData.code = res.code;
                // 获取用户信息
                wx.getSetting({
                  success: res1 => {
                    if (!res1.authSetting['scope.userInfo']) {
                      wx.reLaunch({
                        url: '/pages/login/login',
                      })
                    } else {
                      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                      wx.getUserInfo({
                        success: res2 => {
                          // 可以将 res 发送给后台解码出 unionId
                          this.globalData.userInfo = res2.userInfo
                          wx.request({
                            url: this.globalData.api + "/smallRoutine_store_wx.cbs",
                            data: {
                              code: res.code,
                              userinfo: res2.userInfo
                            },
                            success: function(res3) {
                              //console.log(res3)
                              if ((parseInt(res3.statusCode) == 200) && res3.data.result) {
                                wx.setStorageSync("LoginKey", res3.data.loginId)
                                wx.setStorageSync("openid", res3.data.openid)
                                wx.setStorageSync("account", res3.data.account)
                                wx.setStorageSync("mobile", res3.data.mobile)
                                if (res.data.mobile == "") {
                                  wx.reLaunch({
                                    url: '/pages/login/mobile',
                                  })
                                }
                              } else {
                                wx.showToast({
                                  title: res3.data.msg,
                                  image: '../../images/fail.png'
                                })
                              }
                            },
                            fail: function(backres) {
                              wx.showToast({
                                title: '登陆失败，请稍候重试',
                                image: '../../images/fail.png'
                              })
                            }
                          })
                        },
                        fail: function() {
                          wx.reLaunch({
                            url: '/pages/login/login',
                          })
                        }
                      })
                    }
                  }
                })
              }
            })
          } else {
            if (wx.getStorageSync("mobile") == "") {
              wx.reLaunch({
                url: '/pages/login/mobile',
              })
            }
          }
        }
      })

    } else {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.globalData.code = res.code;
          // 获取用户信息
          wx.getSetting({
            success: res1 => {
              if (!res1.authSetting['scope.userInfo']) {
                wx.reLaunch({
                  url: '/pages/login/login',
                })
              } else {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res2 => {
                    // 可以将 res 发送给后台解码出 unionId
                    this.globalData.userInfo = res2.userInfo
                    wx.request({
                      url: this.globalData.api + "/smallRoutine_store_wx.cbs",
                      data: {
                        code: res.code,
                        userinfo: res2.userInfo
                      },
                      success: function(res3) {
                        //console.log(res3)
                        if ((parseInt(res3.statusCode) == 200) && res3.data.result) {
                          wx.setStorageSync("LoginKey", res3.data.loginId)
                          wx.setStorageSync("openid", res3.data.openid)
                          wx.setStorageSync("account", res3.data.account)
                          wx.setStorageSync("mobile", res3.data.mobile)
                          if (res.data.mobile == "") {
                            wx.reLaunch({
                              url: '/pages/login/mobile',
                            })
                          }
                        } else {
                          wx.showToast({
                            title: res3.data.msg,
                            image: '../../images/fail.png'
                          })
                        }
                      },
                      fail: function(backres) {
                        wx.showToast({
                          title: '登陆失败，请稍候重试',
                          image: '../../images/fail.png'
                        })
                      }
                    })
                  },
                  fail: function() {
                    wx.reLaunch({
                      url: '/pages/login/login',
                    })
                  }
                })
              }
            }
          })
        }
      })
    }
  }

})