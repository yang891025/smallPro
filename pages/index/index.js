//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    dirInfo: [],
    hasSuccess: false,
  },
  onLoad: function () {
    var that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.setNavigationBarTitle({
      title: "应用商店"//页面标题为路由参数
    })
    wx.request({
      url: app.globalData.api + "/wx_get_dirList.cbs",
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function (res) {
        wx.hideLoading();
        that.setData({
          hasSuccess: true,
          dirInfo: res.data.data
        })
      },
      fail: function (res) {
        wx.hideLoading()
        that.setData({
          hasSuccess: false
        })
        //console.log(res)
        wx.showToast({
          title: '访问失败',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },
  listclick: function (event) {
    var text = event.currentTarget.dataset.text
    wx.navigateTo({
      url: '/pages/applist/applist?path=' + text,
    })
  }
})
