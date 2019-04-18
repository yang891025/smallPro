// pages/fcm/fcm.js
//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setProduct();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /*
     * 产品项目
     */
  setProduct: function () {
    let that = this;
    wx.request({
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "getSource",
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function (res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          that.setData({
            hasSuccess: true,
            product: res.data.data
          })
        }else{
          wx.reLaunch({
            url: '/pages/login/login',
          })
          wx.showToast({
            title: '重新登陆',
          })
        }
      },
      fail: function (res) {
        wx.hideLoading()
        that.setData({
          hasSuccess: false
        })
        console.log(res)
        wx.showToast({
          title: '访问失败',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },

  /**
  * 跳转外联页面
  */
  openUrl: function (event) {
    var index = event.currentTarget.dataset.index;
    var path = event.currentTarget.dataset.path;
    var resid = event.currentTarget.dataset.resid;
    var resdis = event.currentTarget.dataset.resdis;
    wx.navigateTo({
      url: "/pages/fcm/fileList?fileType=" + resid + "&filePath=" + path + "&pathName=" + resdis + "&index=" + index
    })
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