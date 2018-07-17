// pages/uploader/video.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    video: false,
    size: 0,
    albumIndex: [0, 0],
    albums: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    let albumIndex = options.index.split(",");
    that.setData({
      albumIndex: albumIndex,
      filePath: options.filePath
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    wx.request({
      method: 'GET',
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "getCloudDir",
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if((parseInt(res.statusCode) == 200) && res.data.result){
          that.setData({
            albums: res.data.data
          });
        } else if (!res.data.result){
          wx.reLaunch({
            url: '/pages/login/login',
          })
          wx.showToast({
            title: '重新登陆',
          })
        }
      },
    })
  },

  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function () {
    app.globalData.webShowed = true;//标记已经显示过web-view页了
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

  },


  /**
   * 选择 / 拍摄视频
   * @author abei<abei@nai8.me>
   */
  addVideo: function() {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      compressed: false,
      camera: 'back',
      success: function(res) {
        that.setData({
          video: res.tempFilePath,
          size: (res.size / (1024 * 1024)).toFixed(2)
        })
      }
    })
  },

  formSubmit: function(e) {
    var that = this;
    if (that.data.albumIndex < 0) {
      wx.showModal({
        title: '视频上传',
        content: '请选择路径'
      })
      return;
    }
    // var albumId = that.data.albums[that.data.albumIndex].id;

    if (that.data.video == false) {
      wx.showModal({
        title: '视频上传',
        content: '请录制或选择一个小视频'
      })
      return false;
    }

    // if (that.data.size > 1024 * 1024 * 2) {
    //   wx.showModal({
    //     title: '视频上传',
    //     content: '很抱歉，视频最大允许4M，当前为' + (that.data.size / (1024 * 1024)).toFixed(2) + 'M'
    //   })
    //   return false;
    // }

    wx.showLoading({
      title: '提交中'
    });
    
    const uploadTask = wx.uploadFile({
      url: "https://e.tbs.com.cn/cgi-bin/upload.fcgi?method=wxupload",
      filePath: that.data.video,
      name: 'file', //这里根据自己的实际情况改
      formData: {
        'user': that.data.filePath
      },
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          wx.showModal({
            title: '视频上传',
            content: '上传成功',
          })
        }else{
          wx.showModal({
            title: '视频上传',
            content: '上传失败',
          })
        }
      },      
      fail: (res) => {
        wx.showModal({
          title: '视频上传',
          content: '上传失败',
        })
      },
    })
    uploadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: res.progress + '%'
      });
    })

  },

  pickConfrim(e) {
    this.setData({
      filePath: e.detail.value
    })
  },
})