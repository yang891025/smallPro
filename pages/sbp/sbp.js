// pages/sbp/sbp.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    fails: [],
    filePath: '',
    fileName: '',
    fileUrl: '',
    fileType: 'yppic',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFilePath();
  },
  getFilePath: function () {
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
          if (res.data.msg == "loginDown"){
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

          }else{
            wx.showModal({
              title: '提示',
              showCancel:false,
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
  open: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择', '从云端图册中选择'],
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseImage(1);
          } else if (res.tapIndex == 1) {
            that.chooseImage(2);
          } else {
            wx.navigateTo({
              url: "cloudList?filePath=" + that.data.filePath + "&fileType=" + that.data.fileType
            })
          }
        }
      }
    });
  },
  chooseImage: function (type) {
    var that = this;
    if(type == 1){
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          //console.log(res);
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            files: res.tempFilePaths,
            fileName: res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1),
          });
          that.uploadImage();
        }
      })

    }else{
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          //console.log(res);
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            files: res.tempFilePaths,
            fileName: res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1),
          });
          that.uploadImage();
        }
      })

    }

  },
  uploadImage: function () {
    var that = this;
    var files = this.data.files;

    this.uploadimg({
      url: app.globalData.api + '/cgi-bin/upload.fcgi?method=wxupload', //这里是你图片上传的接口
      path: files //这里是选取的图片的地址数组
    });
  },
  //多张图片上传
  uploadimg: function (data) {
    var that = this,
      i = data.i ? data.i : 0, //当前上传的哪张图片
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
      }, //这里是上传图片时一起上传的数据
      success: (resp) => {
        if (resp.statusCode == 200) {
          success++; //图片上传成功，图片上传成功的变量+1
        } else {
          that.setData({
            fails: that.data.fails.concat(data.path[i]),
          });
          fail++; //图片上传失败，图片上传失败的变量+1
        }
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {
        that.setData({
          fails: that.data.fails.concat(data.path[i]),
        });
        fail++; //图片上传失败，图片上传失败的变量+1
        //console.log("fails = " + that.data.fails );
      },
      complete: () => {
        i++; //这个图片执行完上传后，开始上传下一张
        if (i == data.path.length) { //当图片传完时，停止调用          
          that.setData({
            files: that.data.fails,
            fails: []

          })
          wx.hideLoading();
          wx.showModal({
            title: '图片上传',
            content: '成功：' + success + " 失败：" + fail,
            success: function (res) {
              if (res.cancel) {
                //点击取消,默认隐藏弹框
              } else {
                //点击确定
                wx.navigateTo({
                  url: "/pages/outurl/website1?path=" + encodeURIComponent(app.globalData.api + "/pts/cropper/index.cbs?file=" + that.data.fileUrl + that.data.fileName + "&openType=1&fileName=" + that.data.fileName)
                })
              }
            },
          })
        } else { //若图片还没有传完，则继续调用函数
          data.i = i;
          data.success = success;
          data.fail = fail;
          setTimeout(function () {
            that.uploadimg(data);
          }, 1000);

        }
      }
    });
  },
  /**
   * 调用自定义pick
   * 在这里处理回调
   * 
   */
  pickConfrim(e) {

    this.setData({
      filePath: e.detail.value
    })
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