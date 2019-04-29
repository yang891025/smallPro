// pages/vts/vts.js
var app = getApp();
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
recorderManager.onStart(() => {
  console.log('recorder start')
});
//错误回调
recorderManager.onError((res) => {
  console.log(res);
});
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileType: 'ypaudio',
    filePath: '',
    fileName: '',
    fileUrl: '',
    recording: false,
    uploadfile: false,
    voices: [], //音频数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '配置个人信息...',
    })
    wx.request({
      url: app.globalData.api + "/pts/tool.cbs",
      data: {
        method: "getCloudDir",
        fileType: that.data.fileType,
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function (res) {
        wx.hideLoading();
        if (parseInt(res.statusCode) == 200 && res.data.result) {
          that.setData({
            filePath: res.data.filePath,
            fileUrl: res.data.url,
          })
        } else {
          if (res.data.msg == "loginDown") {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.data.msg,
              success: function (res) {
                if (res.cancel) {
                  //点击取消,默认隐藏弹框
                } else {
                  //点击确定
                  wx.reLaunch({
                    url: '/pages/login/login',
                  })
                  wx.showToast({
                    title: '重新登陆',
                  })
                }
              },
            })

          } else {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.data.msg,
              success: function (res) {
                if (res.cancel) {
                  //点击取消,默认隐藏弹框
                } else {
                  //点击确定
                  wx.navigateBack({
                    delta: 1
                  })
                }
              },
            })
          }
        }
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '访问失败',
          success: function (res) {
            if (res.cancel) {
              //点击取消,默认隐藏弹框
            } else {
              //点击确定
              wx.navigateBack({
                delta: 1
              })
            }
          },
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.globalData.webShowed = true; //标记已经显示过web-view页了
  },

  getSearch: function (e) {
    var that = this;
    var text = e.currentTarget.dataset.text;
    wx.navigateTo({
      url: "/pages/outurl/website1?path=" + encodeURIComponent(app.globalData.api + "/vts/participle/index.cbs?participle=" + text)
    })
  },

  touchdown: function () {
    console.log("手指按下了...")
    console.log("new date : " + new Date)
    var _this = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log("录音授权成功");
              //_this.startRecord();

            },
            fail() {
              console.log("第一次录音授权失败");
              wx.showModal({
                title: '提示',
                content: '您未授权录音，功能将无法使用',
                showCancel: true,
                confirmText: "授权",
                confirmColor: "#52a2d8",
                success: function (res) {
                  if (res.confirm) {
                    //确认则打开设置页面（重点）
                    wx.openSetting({
                      success: (res) => {
                        console.log(res.authSetting);
                        if (!res.authSetting['scope.record']) {
                          //未设置录音授权
                          console.log("未设置录音授权");
                          wx.showModal({
                            title: '提示',
                            content: '您未授权录音，功能将无法使用',
                            showCancel: false,
                            success: function (res) {

                            },
                          })
                        } else {
                          //第二次才成功授权
                          //_this.startRecord();
                        }
                      },
                      fail: function () {
                        console.log("授权设置录音失败");
                      }
                    })
                  } else if (res.cancel) {
                    console.log("cancel");
                  }
                },
                fail: function () {
                  console.log("openfail");
                }
              })
            }
          })
        } else {
          _this.startRecord();
        }

      }
    })

  },

  //手指按下
  startRecord: function () {
    var _this = this;
    speaking.call(this);
    this.setData({
      isSpeaking: true
    })
    const options = {
      duration: 60000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 64000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    
  },
  //手指抬起
  touchup: function () {
    var _this = this;
    this.setData({
      isSpeaking: false,
    })
    clearInterval(this.timer)
    // wx.stopRecord()
    recorderManager.stop();
    recorderManager.onStop((res) => {
      var tempFilePath = res.tempFilePath;
      _this.setData({
        files: tempFilePath,
        fileName: tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1),
      });
      _this.upload(tempFilePath);

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

  },
  upload: function (files) {
    var that = this;
    this.uploadaudio({
      url: app.globalData.api +'/cgi-bin/upload.fcgi?method=wxupload', //这里是你音频上传的接口
      path: files //这里是选取的音频的地址数组
    });
  },
  //多个音频上传
  uploadaudio: function (data) {
    var that = this;
    wx.showLoading({
      title: "语音识别",
      mask: true,
    })
    wx.uploadFile({
      method: 'POST',
      url: data.url,
      filePath: data.path,
      name: 'file', //这里根据自己的实际情况改
      formData: {
        'user': that.data.filePath
      }, //这里是上传音频时一起上传的数据
      success: (resp) => {
        
        if (resp.statusCode == 200) {
          wx.request({
            method: 'GET',
            url: app.globalData.api + "/vts/tool.cbs",
            data: {
              method: "getVoiceRrecognition",
              fileType: that.data.fileType,
              fileName: that.data.fileName,
              loginId: wx.getStorageSync("LoginKey"),
              account: wx.getStorageSync("account"),
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              
              if (parseInt(res.statusCode) == 200) {
                that.setData({
                  voices: res.data.items.concat(that.data.voices)
                })
              }else if (!res.data.result) {
                wx.reLaunch({
                  url: '/pages/login/login',
                })
                wx.showToast({
                  title: '重新登陆',
                })
              }
            },
            complete: () => {
              wx.hideLoading();
            }
          })
        } else {
          wx.showModal({
            title: '语音识别',
            content: "语音上传失败",
          })
        }
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {
        wx.showModal({
          title: '语音识别',
          content: "语音上传失败",
        })
      }
    });
  },
})
//麦克风帧动画
function speaking() {
  var _this = this;
  //话筒帧动画
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}