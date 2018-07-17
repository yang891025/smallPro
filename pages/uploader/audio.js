// pages/uploader/audio.js
var app = getApp();
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    albumIndex: [0, 0],
    j: 0,
    albums: [],
    filePath: '',
    recording: false,
    uploadfile: false,
    voices: [], //音频数组
    voiceIndex: [], //选中音频数组
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
      success: function(res) {
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          that.setData({
            albums: res.data.data
          });
        } else if (!res.data.result) {
          wx.reLaunch({
            url: '/pages/login/login',
          })
          wx.showToast({
            title: '重新登陆',
          })
        }
      },
    })
    //获取录音音频列表
    wx.getSavedFileList({
      success: function(res) {
        var voices = [];
        for (var i = 0; i < res.fileList.length; i++) {
          //格式化时间
          var createTime = util.formatDate(res.fileList[i].createTime)
          //将音频大小B转为KB
          var size = (res.fileList[i].size / 1024).toFixed(2);
          var voice = {
            filePath: res.fileList[i].filePath,
            createTime: createTime,
            size: size,
            checked: false
          };
          // console.log("文件路径: " + res.fileList[i].filePath)
          // console.log("文件时间: " + createTime)
          // console.log("文件大小: " + size)
          voices = voices.concat(voice);
        }
        that.setData({
          voices: voices
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.globalData.webShowed = true; //标记已经显示过web-view页了
  },

  radio1change: function(e) {
    var that = this;
    var temp1 = e.detail.value
    that.setData({
      voiceIndex: temp1,
    })
    if (temp1.length > 0) {
      that.setData({
        uploadfile: true,
      })
    } else {
      that.setData({
        uploadfile: false,
      })
    }
  },
  longTap: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '删除',
      content: '删除当前音频',
      confirmText: "确定",
      cancelText: "取消",
      success: function(res) {
        if (res.confirm) {
          var tempfiles = that.data.voices;
          wx.removeSavedFile({
            filePath: tempfiles[index].filePath,
            complete: function(res) {

              tempfiles.splice(index, 1);
              that.setData({
                voices: tempfiles
              })
            }
          })
        }
      }
    });
  },

  touchdown: function() {
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
                success: function(res) {
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
                            success: function(res) {

                            },
                          })
                        } else {
                          //第二次才成功授权
                          //_this.startRecord();
                        }
                      },
                      fail: function() {
                        console.log("授权设置录音失败");
                      }
                    })
                  } else if (res.cancel) {
                    console.log("cancel");
                  }
                },
                fail: function() {
                  console.log("openfail");
                }
              })
            }
          })
        }else{
          _this.startRecord();
        }

      }
    })

  },

  //手指按下
  startRecord: function() {
    var _this = this;
    speaking.call(this);
    this.setData({
      isSpeaking: true
    })
    const options = {
      duration: 60000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
    // //开始录音
    // wx.startRecord({
    //   success: function(res) {
    //     //临时路径,下次进入小程序时无法正常使用
    //     var tempFilePath = res.tempFilePath
    //     //console.log("tempFilePath: " + tempFilePath)
    //     //持久保存
    //     wx.saveFile({
    //       tempFilePath: tempFilePath,
    //       success: function(res) {
    //         //持久路径
    //         //本地文件存储的大小限制为 100M
    //         var savedFilePath = res.savedFilePath
    //         console.log("savedFilePath: " + savedFilePath)
    //       }
    //     })
    //     wx.showToast({
    //       title: '录音成功',
    //       icon: 'success',
    //       duration: 1000
    //     })
    //     //获取录音音频列表
    //     wx.getSavedFileList({
    //       success: function(res) {
    //         var voices = [];
    //         for (var i = 0; i < res.fileList.length; i++) {
    //           //格式化时间
    //           var createTime = util.formatDate(res.fileList[i].createTime)
    //           //将音频大小B转为KB
    //           var size = (res.fileList[i].size / 1024).toFixed(2);
    //           var voice = {
    //             filePath: res.fileList[i].filePath,
    //             createTime: createTime,
    //             size: size,
    //             checked: false
    //           };
    //           console.log("文件路径: " + res.fileList[i].filePath)
    //           console.log("文件时间: " + createTime)
    //           console.log("文件大小: " + size)
    //           voices = voices.concat(voice);
    //         }
    //         _this.setData({
    //           voices: voices
    //         })
    //       }
    //     })
    //   },
    //   fail: function(res) {
    //     //录音失败
    //     wx.showModal({
    //       title: '提示',
    //       content: '录音的姿势不对!',
    //       showCancel: false,
    //       success: function(res) {
    //         if (res.confirm) {
    //           console.log('用户点击确定')
    //           return
    //         }
    //       }
    //     })
    //   }
    // })
  },
  //手指抬起
  touchup: function() {
    var _this = this;
    this.setData({
      isSpeaking: false,
    })
    clearInterval(this.timer)
    // wx.stopRecord()
    recorderManager.stop();
    recorderManager.onStop((res) => {
      var tempFilePath = res.tempFilePath;
      console.log('停止录音', res)
      //持久保存
      wx.saveFile({
        tempFilePath: tempFilePath,
        success: function(res) {
          //持久路径
          //本地文件存储的大小限制为 100M
          var savedFilePath = res.savedFilePath
          console.log("savedFilePath: " + savedFilePath)
        }
      })
      wx.showToast({
        title: '录音成功',
        icon: 'success',
        duration: 1000
      })
      //获取录音音频列表
      wx.getSavedFileList({
        success: function(res) {
          var voices = [];
          for (var i = 0; i < res.fileList.length; i++) {
            //格式化时间
            var createTime = util.formatDate(res.fileList[i].createTime)
            //将音频大小B转为KB
            var size = (res.fileList[i].size / 1024).toFixed(2);
            var voice = {
              filePath: res.fileList[i].filePath,
              createTime: createTime,
              size: size,
              checked: false
            };
            voices = voices.concat(voice);
          }
          _this.setData({
            voices: voices
          })
        }
      })
    })
  },
  //点击播放录音
  gotoPlay: function(e) {

    var fileInfo = e.currentTarget.dataset.key;


    // backgroundAudioManager.title = fileInfo.createTime
    // backgroundAudioManager.epname = fileInfo.createTime
    // backgroundAudioManager.singer = ''
    // backgroundAudioManager.coverImgUrl = ''
    // backgroundAudioManager.src = fileInfo.filePath // 设置了 src 之后会自动播放
    // backgroundAudioManager.onError((res) => {
    //   console.log(res);
    // })
    innerAudioContext.volume=1
    innerAudioContext.autoplay = true
    innerAudioContext.src =  fileInfo.filePath

    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onEnded(() =>{
      //播放结束
      wx.showToast({
        title: '播放结束',
        icon: 'success',
        duration: 1000
      })
    })
    //点击开始播放
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1000
    })
    // wx.playVoice({
    //   filePath: filePath,
    //   success: function() {
    //     wx.showToast({
    //       title: '播放结束',
    //       icon: 'success',
    //       duration: 1000
    //     })
    //   }
    // })
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
    backgroundAudioManager.stop()
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
  upload: function() {
    var that = this;
    if (that.data.albumIndex < 0) {
      wx.showModal({
        title: '音频上传',
        content: '请选择路径'
      })
      return;
    }
    var files = this.data.voiceIndex;
    this.uploadaudio({
      url: 'https://e.tbs.com.cn/cgi-bin/upload.fcgi?method=wxupload', //这里是你音频上传的接口
      path: files //这里是选取的音频的地址数组
    });
  },
  //多个音频上传
  uploadaudio: function(data) {
    var that = this,
      i = data.i ? data.i : 0, //当前上传的哪个音频
      success = data.success ? data.success : 0, //上传成功的个数
      fail = data.fail ? data.fail : 0; //上传失败的个数
    wx.showLoading({
      title: '上传：(' + i + "/" + data.path.length + ")",
      mask: true,
    })
    wx.uploadFile({
      method: 'POST',
      url: data.url,
      filePath: data.path[i],
      name: 'file', //这里根据自己的实际情况改
      formData: {
        'user': that.data.filePath
      }, //这里是上传音频时一起上传的数据
      success: (resp) => {
        if (resp.statusCode == 200) {
          success++; //音频上传成功，音频上传成功的变量+1
          wx.removeSavedFile({
            filePath: data.path[i],
            complete: function(res) {}
          })
        } else {

          fail++; //音频上传失败，音频上传失败的变量+1
        }
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {

        fail++; //音频上传失败，音频上传失败的变量+1
        //console.log("fails = " + that.data.fails );
      },
      complete: () => {
        i++; //这个音频执行完上传后，开始上传下一个
        if (i == data.path.length) { //当音频传完时，停止调用          
          //获取录音音频列表
          wx.getSavedFileList({
            success: function(res) {
              var voices = [];
              for (var j = 0; j < res.fileList.length; j++) {
                //格式化时间
                var createTime = util.formatDate(res.fileList[j].createTime)
                //将音频大小B转为KB
                var size = (res.fileList[j].size / 1024).toFixed(2);
                var voice = {
                  filePath: res.fileList[j].filePath,
                  createTime: createTime,
                  size: size,
                  checked: false
                };
                voices = voices.concat(voice);
              }
              that.setData({
                voices: voices,
                voiceIndex: [],
                uploadfile: false,
              })
            }
          })
          wx.hideLoading();
          wx.showModal({
            title: '音频上传',
            content: '成功：' + success + " 失败：" + fail,
          })
        } else { //若音频还没有传完，则继续调用函数
          data.i = i;
          data.success = success;
          data.fail = fail;
          setTimeout(function() {
            that.uploadaudio(data);
          }, 1000);

        }
      }
    });
  },
  pickConfrim(e) {
    this.setData({
      filePath: e.detail.value
    })
  },
})
//麦克风帧动画
function speaking() {
  var _this = this;
  //话筒帧动画
  var i = 1;
  this.timer = setInterval(function() {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}