// pages/login/mobile.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alreadySend: false,
    showTopTips: false,
    send: 'default',
    second: 60,
    verifyText: '获取验证码',
    errorText: '错误提示',
    phoneNum: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  // 手机号部分
  userPhone: function (e) {
    let phoneNum = e.detail.value
    if (phoneNum.length === 11) {
      let checkedNum = this.checkPhoneNum(phoneNum)
      if (checkedNum) {
        this.setData({
          phoneNum: phoneNum
        })
      }
    } else {
      this.setData({
        phoneNum: ''
      })
    }
  },

  checkPhoneNum: function (phoneNum) {
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

  //获取验证码
  sendMsg: function () {

    if (!this.data.alreadySend) {
      if (this.data.phoneNum != "") {
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
          success: function (res) {
            wx.setStorageSync("sessionId", res.header["Set-Cookie"])
            wx.showToast({
              title: res.data.msg,
              icon: 'success'
            })
          },
          complete: function () {
            wx.hideLoading();
          }
        })
        this.setData({
          alreadySend: true,
        })
        this.timer()
      } else {
        this.showTopTips('手机号不正确');
        // wx.showToast({
        //   title: '手机号码不正确',
        //   image: '../../images/fail.png'
        // })
      }
    }
  },
  //倒计时
  timer: function () {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          this.setData({
            second: this.data.second - 1,
            verifyText: (this.data.second - 1) + "s 重新获取"
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              alreadySend: false,
              verifyText: "获取验证码"
            })
            resolve(setTimer)
          }
        }
        , 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  // 验证码
  addCode: function (e) {
    this.setData({
      code: e.detail.value
    })
    this.activeButton()
    // console.log('code=' + this.data.code)
  },
  // 按钮
  activeButton: function () {
    let { phoneNum, code } = this.data
    if (phoneNum && code) {
      this.setData({
        send: 'primary',
      })
    } else {
      this.setData({
        send: 'default',
      })
    }
  },
  //提交绑定
  onSubmit: function () {
    var that = this;
    if (that.data.send == 'primary') {
      var sessionId = wx.getStorageSync('sessionId')
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
      wx.request({
        url: app.globalData.api + "/modifyMobile.cbs",
        data: {
          mobile: that.data.phoneNum,
          smsCheckCode: that.data.code,
          account: wx.getStorageSync("account"),
          loginId: wx.getStorageSync("LoginKey")
        },
        header: {
          'content-type': 'application/json',
          'Cookie': sessionId
        },
        method: 'GET',
        success: function (res) {
          wx.hideLoading();
          if ((parseInt(res.statusCode) == 200) && res.data.result) {
            wx.showToast({
              title: res.data.msg,
              icon: 'success'
            })
            wx.setStorageSync("mobile", that.data.phoneNum)
            wx.reLaunch({
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
        fail: function (res) {
          wx.hideLoading();
          //console.log(res)
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
  backLogin:function(){
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})