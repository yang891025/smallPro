// pages/uploader/picture.js

var app = getApp();
Page({
  data: {
    files: [],
    fails: [],
    albumIndex: [0, 0],
    albums: [],
    filePath: '',
    // errorText: '错误提示',
    //objectMultiArray: [[],[]],
  },

  /**
   * onload
   */
  onLoad: function(option) {
    var that = this;
    let albumIndex = option.index.split(",");
    that.setData({
      albumIndex: albumIndex,
      filePath: option.filePath
    })
    //console.log(that.data.albumIndex);
    this.setAlbums();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    that.setData({
      albums: that.data.albums
    });
  },
  setAlbums: function() {
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
          //console.log(that.data.albums);
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
  },
  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function () {
    app.globalData.webShowed = true;//标记已经显示过web-view页了
  },
  
  chooseImage: function(e) {
    var that = this;
    var length = 9 - that.data.files.length;
    wx.chooseImage({
      count: length,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths),
        });
      }
    })
  },
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  longTap: function(e) {
    var that = this;
    wx.showModal({
      title: '删除',
      content: '删除当前图片',
      confirmText: "确定",
      cancelText: "取消",
      success: function(res) {
        if (res.confirm) {
          var tempfiles = that.data.files;
          tempfiles.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            files: tempfiles
          })
        }
      }
    });
  },
  uploadImage: function() {
    var that = this;
    if (that.data.albumIndex < 0) {
      wx.showModal({
        title: '图片上传',
        content: '请选择路径'
      })
      return;
    }
    var files = this.data.files;
    this.uploadimg({
      url: 'https://e.tbs.com.cn/cgi-bin/upload.fcgi?method=wxupload', //这里是你图片上传的接口
      path: files //这里是选取的图片的地址数组
    });
  },
  //多张图片上传
  uploadimg: function(data) {
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
          })
        } else { //若图片还没有传完，则继续调用函数
          data.i = i;
          data.success = success;
          data.fail = fail;
          setTimeout(function() {
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
      filePath:e.detail.value
    })
  },
});