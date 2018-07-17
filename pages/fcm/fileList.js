// pages/fcm/fileList.js
//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    index: [],
    pageSize: 1,
    fileType: "",
    filePath: "",
    isend: false,
    pathName: "",
    reName: "",
    showModal: false,
    inputValue: '',
    title: '',
    conformBtn:"",
    sort:"timeup"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      fileType: options.fileType,
      index: options.index,
      filePath: options.filePath,
      pathName: options.pathName,
    })
    wx.setNavigationBarTitle({
      title: options.pathName,
    })
    this.setProduct();
  },
  /*
   * 文件列表
   */
  setProduct: function() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    var duanziInfoBefore = that.data.fileList
    var pageSizeBefore = that.data.pageSize
    wx.request({
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "getFiles",
        fileType: that.data.fileType,
        filePath: that.data.filePath,
        page: that.data.pageSize,
        sort: that.data.sort,
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        if (parseInt(res.statusCode) == 200) {
          if (res.data.data.length < 10) {
            that.setData({
              isend: true,
            })
          }
          that.setData({
            hasSuccess: true,
            fileList: duanziInfoBefore.concat(res.data.data),
            pageSize: pageSizeBefore + 1
          })
          duanziInfoBefore = "";
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/fail.png'
          })
        }
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

  open: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['图片', '录音', '小视频'],
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: "/pages/uploader/picture?filePath=" + that.data.filePath + "&index=" + that.data.index
            })
          } else if (res.tapIndex == 1) {
            wx.navigateTo({
              url: "/pages/uploader/audio?filePath=" + that.data.filePath + "&index=" + that.data.index
            })
          } else {
            wx.navigateTo({
              url: "/pages/uploader/video?filePath=" + that.data.filePath + "&index=" + that.data.index
            })
          }
        }
      }
    });
  },
  do: function(event) {
    var that = this
    var fileInfo = event.currentTarget.dataset.info
    wx.showActionSheet({
      itemList: ['打开','删除', '重命名', '属性','下载'],

      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
             that.showDir(event)
          }else if (res.tapIndex == 1) {
            wx.showModal({
              title: '提示',
              content: '删除文件 ' + fileInfo.fileName,
              success: function(res) {
                if (res.confirm) {
                  that.deleteFile(that.data.filePath + fileInfo.fileName, fileInfo.isDirectory)
                }
              }
            })

          } else if (res.tapIndex == 2) {
            that.showDialogBtn(fileInfo.fileName);
          } else if (res.tapIndex == 3) {
            wx.showToast({
              title: '暂无权限',
            })
          } else if (res.tapIndex == 4) {
            wx.showToast({
              title: '暂无权限',
            })
          }
        }
      }
    });
  },

  deleteFile: function(filePath, isDir) {
    let that = this;
    wx.showLoading({
      title: '正在进行...',
    })
    wx.request({
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "deleteFile",
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
        filePath: filePath,
        isDir: isDir
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          wx.showToast({
            title: res.data.msg,
          })
          that.setData({
            fileList: [],
            pageSize: 1,
            isend: false,
          })
          that.setProduct();
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
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


  showDir: function(event) {
    var that = this;
    var fileInfo = event.currentTarget.dataset.info

    if (fileInfo.isDirectory == 1) {
      wx.navigateTo({
        url: "/pages/fcm/fileList?fileType=" + that.data.fileType + "&filePath=" + that.data.filePath + fileInfo.fileName + "/&pathName=" + fileInfo.fileName + "&index=" + that.data.index
      })
    } else {
      if (that.data.fileType == "word" || that.data.fileType == "pdf" || that.data.fileType == "ppt" || that.data.fileType == "bgwj") {
        wx.showLoading({
          title: '加载中...'
        });
        const downloadTask = wx.downloadFile({
          url: encodeURI(fileInfo.url), //仅为示例，并非真实的资源
          success: function(res) {
            if (res.statusCode === 200) {
              var filePath = res.tempFilePath
              wx.openDocument({
                filePath: filePath,
                success: function(res) {
                  wx.showToast({
                    title: '打开文档成功'
                  });
                },
                complete: function() {
                  wx.hideLoading()
                }
              })
            } else {
              wx.showToast({
                title: '预览失败'
              });
            }

          },
          fail: function(rres) {
            wx.showToast({
              title: rres.errMsg
            });
          },
          complete: function() {
            wx.hideLoading()
          }
        })

        downloadTask.onProgressUpdate((res) => {
          wx.showLoading({
            title: "加载(" + res.progress + '%)'
          });
        })
      } else if (that.data.fileType == "yppic" || that.data.fileType == "ggpic") {
        var urls = [];
        for (var item in that.data.fileList) {

          if (that.data.fileList[item].isDirectory == 0) {
            var url = encodeURI(that.data.fileList[item].url)
            urls.push(url)
          }
        }
        wx.previewImage({
          current: encodeURI(fileInfo.url), // 当前显示图片的http链接
          urls: urls // 需要预览的图片http链接列表
        })
      } else {
        wx.navigateTo({
          url: "/pages/fcm/detail?fileType=" + that.data.fileType + "&fileName=" + fileInfo.fileName + "&fileSize=" + fileInfo.fileSize + "&filePath=" + fileInfo.url,
        })
      }
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
    if (app.globalData.webShowed) {
      console.log("onShow");
      app.globalData.webShowed = false; //标记已经显示过web-view页了
      this.setData({
        fileList: [],
        pageSize: 1,
        isend: false,
      })
      this.setProduct();
    }
  },
  /**
   * 弹窗
   */
  showDialogBtn: function(fileName) {
    this.setData({
      reName: fileName,
      showModal: true,
      inputValue: fileName,
      title:"重命名",
      conformBtn:"onConfirm"
    })
  },

  /**
    * 新建文件夹弹窗
    */
  showNewBtn: function () {
    this.setData({
      reName: "新建文件夹",
      showModal: true,
      inputValue: "新建文件夹",
      title: "新建文件夹",
      conformBtn: "onNewDir"
    })
  },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onNewDir: function() {
    this.hideModal();
    this.addDir();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
    
    if (this.data.reName == this.data.inputValue) {
      wx.showToast({
        title: '名称未改变',
      })
    } else {
      this.reNameFile();
    }

  },
  reNameFile: function() {
    let that = this;
    wx.request({
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "reNameFile",
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
        oldName: that.data.filePath + that.data.reName,
        newName: that.data.filePath + that.data.inputValue,
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          wx.showToast({
            title: res.data.msg,
          })
          that.setData({
            fileList: [],
            pageSize: 1,
            isend: false,
          })
          that.setProduct();
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
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
  addDir: function () {
    let that = this;
    wx.request({
      url: app.globalData.api + "/getFcm.cbs",
      data: {
        action: "addDir",
        loginId: wx.getStorageSync("LoginKey"),
        account: wx.getStorageSync("account"),
        dirName: that.data.filePath + that.data.inputValue,
      },
      header: {
        "Content-Type": JSON
      },
      method: 'GET',
      success: function (res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          wx.showToast({
            title: res.data.msg,
          })
          that.setData({
            fileList: [],
            pageSize: 1,
            isend: false,
          })
          that.setProduct();
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
      },
      fail: function (res) {
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
  inputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  newFile: function(event) {
    var that = this
    var fileInfo = event.currentTarget.dataset.info
    wx.showActionSheet({
      itemList: ['新建文件', '新建文件夹'],

      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            wx.showToast({
              title: '暂无权限',
            })
          } else if (res.tapIndex == 1) {
            that.showNewBtn()
          } else if (res.tapIndex == 2) {
            wx.showToast({
              title: '暂无权限',
            })
          }
        }
      }
    });
  },
  order: function(event) {
    var that = this
    wx.showActionSheet({
      itemList: ['修改时间↑', '修改时间↓', '名称↑', '名称↓', '大小↑', '大小↓'],
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort:"timeup"
            })
            that.setProduct();
          } else if (res.tapIndex == 1) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort: "timedown"
            })
            that.setProduct();
          } else if (res.tapIndex == 2) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort: "nameup"
            })
            that.setProduct();
          } else if (res.tapIndex == 3) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort: "namedown"
            })
            that.setProduct();
          } else if (res.tapIndex == 4) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort: "sizeup"
            })
            that.setProduct();
          } else if (res.tapIndex == 5) {
            that.setData({
              fileList: [],
              pageSize: 1,
              isend: false,
              sort: "sizedown"
            })
            that.setProduct();
          }
        }
      }
    });
    
  },
  refresh: function() {
    this.setData({
      fileList: [],
      pageSize: 1,
      isend: false,
    })
    this.setProduct();
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
    if (!this.data.isend)
      this.setProduct();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})