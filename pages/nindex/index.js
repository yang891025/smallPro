// pages/nindex/index.js

//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: null,
    product: null,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    txtAds: "北京金信桥信息技术有限公司",
    advertise: null
  },
  /*
   * 首页banner
   */
  setBanner: function() {
    let that = this;
    wx.request({
      url: app.globalData.api + "/banner.cbs",
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        that.setData({
          hasSuccess: true,
          banner: res.data.data
        })
      },
      fail: function(res) {
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
   * 首页文字广告
   */
  setTxtAds: function() {
    let that = this;

  },

  /*
   * 产品项目
   */
  setProduct: function() {
    let that = this;
    wx.request({
      url: app.globalData.api + "/source.cbs",
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        that.setData({
          hasSuccess: true,
          product: res.data.data
        })
      },
      fail: function(res) {
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
  // /**
  //  * 首页两块子banner
  //  */
  // setSubBanner: function () {
  //   let that = this;
  //   util.fetch('http://api.cyb.kuaiqiangche.com/event/advertise/index', function (data) {
  //     that.setData({
  //       advertise: data.data
  //     });
  //   });
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setBanner();
    // that.setTxtAds();
    that.setProduct();
    // that.setModule();
  },
  tbsstore: function() {
    wx.showToast({
      title: '开发中...',
      image: "../../images/fail.png"
    })
  },
  /**
   * 跳转外联页面
   */
  openUrl: function(event) {
    var path = event.currentTarget.dataset.url;
    var small = event.currentTarget.dataset.small;
    //console.log("path = " + path)
    //path = path.substring(path.indexOf("/"));
    if (small == '1') {
      wx.navigateTo({
        url: path
      })
    } else {
      wx.navigateTo({
        url: "/pages/outurl/website1?path=" + encodeURIComponent(path)
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})