// pages/fcm/detail.js
// const innerAudioContext = wx.createInnerAudioContext();
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recording: false,
    fileName: "",
    fileSize: "",
    filePath: "",
    fileType:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this
      that.setData({
        fileName: options.fileName,
        fileSize: options.fileSize,
        fileType: options.fileType,
        filePath: encodeURI(options.filePath)
      })
      // if (that.data.fileType == 'ggaudio' || that.data.fileType == 'ypaudio'){
        
      //   innerAudioContext.src = that.data.filePath;
      // }
      
  },
  //点击播放录音
  gotoPlay: function (e) {
    var that = this
    //点击开始播放
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1000
    })
    // innerAudioContext.play();
    // that.updateTime(that)
    // // wx.playVoice({
    // //   filePath: filePath,
    // //   success: function () {
    // //     wx.showToast({
    // //       title: '播放结束',
    // //       icon: 'success',
    // //       duration: 1000
    // //     })
    // //   },
    // //   fail:function(res){
    // //     console.log(res);
    // //   }
    // // })
    // innerAudioContext.onError((res) => {
    //   console.log(res.errMsg)
    //   console.log(res.errCode)
    // })
    

    backgroundAudioManager.title = that.data.fileName
    backgroundAudioManager.epname = that.data.fileName
    backgroundAudioManager.singer = ''
    backgroundAudioManager.coverImgUrl = ''
    backgroundAudioManager.src = that.data.filePath // 设置了 src 之后会自动播放
    //back.play();
    that.setData({
      recording: true
    })
    backgroundAudioManager.onEnded(() => {
      that.setData({
        recording: false
      })
    })
  },
  //点击播放录音
  stopPlay: function (e) {
    var that = this
    //点击开始播放
    wx.showToast({
      title: '停止播放',
      icon: 'success',
      duration: 1000
    })
    // innerAudioContext.play();
    // that.updateTime(that)
    // // wx.playVoice({
    // //   filePath: filePath,
    // //   success: function () {
    // //     wx.showToast({
    // //       title: '播放结束',
    // //       icon: 'success',
    // //       duration: 1000
    // //     })
    // //   },
    // //   fail:function(res){
    // //     console.log(res);
    // //   }
    // // })
    // innerAudioContext.onError((res) => {
    //   console.log(res.errMsg)
    //   console.log(res.errCode)
    // })


    backgroundAudioManager.stop();
    that.setData({
      recording: false
    })
  },
  // updateTime: function (that) {
  //   innerAudioContext.onTimeUpdate((res) => {
  //     //更新时把当前的值给slide组件里的value值。slide的滑块就能实现同步更新
  //     console.log("duratio的值：", innerAudioContext.duration)
  //     var duration = innerAudioContext.duration.toFixed(2) * 100
  //     var curTimeVal = innerAudioContext.currentTime.toFixed(2) * 100
  //     that.setData({
  //       currentProgress: (curTimeVal / duration) * 100
  //     })
  //   })
  //   innerAudioContext.onEnded(() => {
  //     wx.showToast({
  //         title: '播放结束',
  //         icon: 'success',
  //         duration: 1000
  //       })
  //   })
  //   },
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    backgroundAudioManager.stop()
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