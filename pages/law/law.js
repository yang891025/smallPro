// pages/law/law.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lawList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.request({
      url: "https://e.tbs.com.cn/interface/getLawKind.cbs",
      success: function (res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200)) {
          that.setData({
            hasSuccess: true,
            lawList: res.data
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/fail.png'
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        that.setData({
          hasSuccess: false
        })
        wx.showToast({
          title: '访问失败',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },

  list:function(event){
    var id = event.currentTarget.dataset.id
    var name = event.currentTarget.dataset.name
    wx.navigateTo({
      url: "/pages/law/list?id=" + id +"&name=" + name 
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})