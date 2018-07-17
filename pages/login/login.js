const app = getApp();
var util = require('../../utils/md5.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tabs: [{
        name: "微信登录"
      },
      {
        name: "账号登录"
      },
      {
        name: "手机登录"
      }
    ], //展示的数据
    slideOffset: 0, //指示器每次移动的距离
    activeIndex: 0, //当前展示的Tab项索引
    sliderWidth: 0, //指示器的宽度,计算得到
    contentHeight: 0, //页面除去头部Tabbar后，内容区的总高度，计算得到
    username: '',
    password: '',
    buttonType: 'default',
    phoneNum: '',
    code: '',
    send: 'default',
    second: 60,
    verifyText: '获取验证码',
    showTopTips: false,
    errorText: '错误提示',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          //计算相关宽度
          sliderWidth: res.windowWidth / that.data.tabs.length,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          contentHeight: res.windowHeight - res.windowWidth / 750 * 68 //计算内容区高度，rpx -> px计算
        });
      }
    });
  },
  showTopTips: function (errorMsg) {
    var that = this;
    this.setData({
      showTopTips: true,
      errorText: errorMsg
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  bindChange: function(e) {
    var current = e.detail.current;
    this.setData({
      activeIndex: current,
      sliderOffset: this.data.sliderWidth * current
    });
    //console.log("bindChange:" + current);
  },
  navTabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    //console.log("navTabClick:" + e.currentTarget.id);
  },
  /**
   * 密码赋值函数
   */
  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
    //console.log(e.detail.value)
  },
  /**
   * 用户名赋值函数
   */
  usernameInput: function(e) {
    this.setData({
      username: e.detail.value
    })
    //console.log(e.detail.value)
  },
  login_in: function() {
    var that = this
    if (this.data.username == "") {
      this.showTopTips('请输入用户名');
      // wx.showToast({
      //   title: ,
      //   icon: 'none'
      // })
      return
    }
    if (this.data.password == "") {
      this.showTopTips('密码不可为空');
      // wx.showToast({
      //   title: '密码不可为空',
      //   icon: 'none'
      // })
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.request({
      url: app.globalData.api + "/login.cbs",
      data: {
        account: this.data.username,
        pwd: (util.hexMD5(this.data.password)).substring(2).toUpperCase()
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          wx.setStorageSync("LoginKey", res.data.loginId)
          wx.setStorageSync("account", res.data.account)
          wx.setStorageSync("mobile", res.data.mobile)
          if (res.data.mobile == "") {
            wx.reLaunch({
              url: '/pages/login/mobile',
            })
          } else {
            wx.reLaunch({
              url: '/pages/nindex/index',
            })
          }
        } else {
          that.showTopTips(res.data.msg);
          // wx.showToast({
          //   title: res.data.msg,
          //   image: '../../images/fail.png'
          // })
        }
      },
      fail: function(res) {
        wx.hideLoading();
      }
    })
  },

  // 手机号部分
  userPhone: function(e) {
    let phoneNum = e.detail.value
    if (phoneNum.length === 11) {
      let checkedNum = this.checkPhoneNum(phoneNum)
      if (checkedNum) {
        this.setData({
          phoneNum: phoneNum
        })
        //console.log('phoneNum' + this.data.phoneNum)
        this.activeButton()
      }
    } else {
      this.setData({
        phoneNum: ''
      })
      this.activeButton()
    }
  },

  checkPhoneNum: function(phoneNum) {
    let str = /^1\d{10}$/
    if (str.test(phoneNum)) {
      return true
    } else {
      this.showTopTips('手机号不正确');
      // wx.showToast({
      //   title: '手机号不正确',
      //   image: '../../images/fail.png'
      // })
      return false
    }
  },

  // 验证码
  addCode: function(e) {
    this.setData({
      code: e.detail.value
    })

    this.activeButton()
    // console.log('code=' + this.data.code)
  },
  //获取验证码
  sendMsg: function() {
    if (this.data.send == 'primary') {
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
      wx.request({
        url: app.globalData.api + "/sendSMSCheckCode.cbs",
        data: {
          mobile: this.data.phoneNum
        },
        header: {
          'content-type': 'application/json',
          //'Cookie': sessionId
        },
        method: 'GET',
        success: function(res) {
          wx.setStorageSync("sessionId", res.header["Set-Cookie"])
          
          wx.showToast({
            title: res.data.msg,
            icon: 'success'
          })
        },
        complete: function() {
          wx.hideLoading();
        }
      })
      this.setData({
        alreadySend: true,
        send: 'default'
      })
      this.timer()
    }
  },

  // 按钮
  activeButton: function() {
    let {
      phoneNum,
      code
    } = this.data
    //console.log(code)
    if (phoneNum) {
      this.setData({
        send: 'primary',
      })
    } else {
      this.setData({
        send: 'default',
      })
    }
    if (phoneNum && code) {
      this.setData({
        buttonType: 'primary',
      })
    } else {
      this.setData({
        buttonType: 'default',
      })
    }
  },
  //倒计时
  timer: function() {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          this.setData({
            second: this.data.second - 1,
            verifyText: (this.data.second - 1) + "s 之后重新获取"
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              alreadySend: false,
              send: 'primary',
              verifyText: "获取验证码"
            })
            resolve(setTimer)
          }
        }, 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  //提交登录
  onSubmit: function() {
    var that = this;
    if (that.data.buttonType == 'primary') {
      var sessionId = wx.getStorageSync('sessionId')
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
      wx.request({
        url: app.globalData.api + "/loginByMobile.cbs",
        data: {
          mobile: that.data.phoneNum,
          smsCheckCode: that.data.code
        },
        header: {
          'content-type': 'application/json',
          'Cookie': sessionId
        },
        method: 'GET',
        success: function(res) {
          wx.hideLoading();
          if ((parseInt(res.statusCode) == 200) && res.data.result) {
            wx.showToast({
              title: '验证成功',
              icon: 'success'
            })
            wx.setStorageSync("LoginKey", res.data.msg)
            wx.setStorageSync("mobile", that.data.phoneNum)
            wx.redirectTo({
              url: '/pages/nindex/index',
            })
          } else {
            that.showTopTips(res.data.msg);
            // wx.showToast({
            //   title: res.data.msg,
            //   image: '../../images/fail.png'
            // })
          }
        },
        fail: function(res) {
          wx.hideLoading();
          console.log(res)
        },
      })
    } else {
      if (this.data.send == 'primary') {
        this.showTopTips('验证码不正确');
        // wx.showToast({
        //   title: '验证码不正确',
        //   image: '../../images/fail.png'
        // })
      } else {
        this.showTopTips('手机号码不正确');
        // wx.showToast({
        //   title: '手机号码不正确',
        //   image: '../../images/fail.png'
        // })
      }
    }
  },
  bindGetUserInfo: function(e) {
    var that = this
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        app.globalData.userInfo = res.userInfo
        wx.login({
          success: res1 => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({
              url: app.globalData.api + "/smallRoutine_store_wx.cbs",
              data: {
                code: res1.code,
                userinfo: res.userInfo
              },
              success: function(res3) {
                // console.log(res3)
                if ((parseInt(res3.statusCode) == 200) && res3.data.result) {
                  wx.showToast({
                    title: '登陆成功',
                    icon: 'success'
                  })
                  wx.setStorageSync("LoginKey", res3.data.loginId)
                  wx.setStorageSync("openid", res3.data.openid)
                  wx.setStorageSync("account", res3.data.account)
                  wx.setStorageSync("mobile", res3.data.mobile)
                  if (res3.data.mobile == "") {
                    wx.reLaunch({
                      url: '/pages/login/mobile',
                    })
                  } else {
                    wx.reLaunch({
                      url: '/pages/nindex/index',
                    })
                  }
                } else {
                  that.showTopTips(res3.data.msg);
                  // wx.showToast({
                  //   title: res3.data.msg,
                  //   image: '../../images/fail.png'
                  // })
                }
              },
              fail: function(backres) {
                that.showTopTips('登陆失败，请稍候重试');
                // wx.showToast({
                //   title: '登陆失败，请稍候重试',
                //   image: '../../images/fail.png'
                // })
              },
              complete: function() {
                wx.hideLoading();
              }
            })
          }
        })


      },
      fail: function(backres) {
        that.showTopTips('拒绝授权，请重试');
        // wx.showToast({
        //   title: '拒绝授权，请重试',
        //   image: '../../images/fail.png'
        // })
      }
    })
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true,
    // })

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})