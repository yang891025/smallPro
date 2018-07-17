// pages/outurl/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var app = getApp();
    var that = this;
    if (!app.globalData.webShowed) {
    wx.navigateTo({
      url: "/pages/outurl/website?path=1"
    })
    }else{
      app.globalData.webShowed = false;//标记已经显示过web-view页了
      wx.switchTab({
        url: "/pages/index/index"
      });  
      // wx.reLaunch({
      //   url: "/pages/index/index"
      // });
    }
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
  onShareAppMessage(options) {
    console.log(options.webViewUrl)
  }
})