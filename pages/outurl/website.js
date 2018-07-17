// pages/outurl/website.js
Page({

  /**
  * 页面的初始数据
  */
  data: {
    Path: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.path == "1"){
      that.setData({
        Path: "https://e.tbs.com.cn/Store/ShowAppStore.cbs"
      })
    }else{
      that.setData({
        Path: "https://e.tbs.com.cn/Test.cbs?path=" + options.path
      })
    }

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
    // var app = getApp();
    // app.globalData.webShowed = true;//标记已经显示过web-view页了
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