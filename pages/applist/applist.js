//applist.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dirPath: '',
    appName: '',
    category: '',
    applist: [],
    hasSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      dirPath: options.path
    })
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.setNavigationBarTitle({
      title: that.data.dirPath//页面标题为路由参数
    })
    wx.request({
      url: app.globalData.api + "/wx_get_dirList.cbs?path=" + that.data.dirPath,
      success: function (res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          that.setData({
            hasSuccess: true,
            applist: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/fail.png'
          })
        }
      },
      fail: function (res) {
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
   * 检查是否付款
   */
  checkPay: function (event) {
    var that = this;
    that.setData({
      appName: event.currentTarget.dataset.id,
      category: event.currentTarget.dataset.cate,
    })
    var text = event.currentTarget.dataset.text;
    var price = event.currentTarget.dataset.price;
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.request({
      url: app.globalData.api + "/CheckPay.cbs?" + text + "&loginId=" + wx.getStorageSync("LoginKey") + "&clientId=wxfb206c9f5d6af29f",
      success: function (res) {
        wx.hideLoading();
        if ((parseInt(res.statusCode) == 200) && res.data.result) {
          that.down_file(event);
        } else {
          wx.showModal({
            title: '提交订单',
            content: '商品:' + that.data.appName + '\r\n来自:  北京金信桥公司\r\n应付金额: ' + price + '元\r\n\r\n是否确认下单？',
            success: function (res) {
              if (res.confirm) {
                that.OutOrder(price)
              } else if (res.cancel) {
                wx.showToast({
                  title: '取消下单',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
          // that.UnifiedOrder(price)
          // wx.showToast({
          //   title: '调起支付流程',
          //   image: '../../images/fail.png'
          // })
        }
      },
      fail: function (res) {
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
  //下单
  OutOrder: function (price) {
    var that = this;
    wx.request({
      url: 'https://e.tbs.com.cn/SmallProOrder.cbs',
      method: 'GET',
      data: {
        'openid': wx.getStorageSync("openid"),
        'body': that.data.appName,
        'total_fee': price,
        'clientId': 'wxfb206c9f5d6af29f',
        'loginId': wx.getStorageSync("LoginKey"),
      },
      success: function (res) {
        console.log(res);
        if (res.data.result) {
          that.UnifiedOrder(price, res.data.msg)
          wx.showToast({
            title: '调起支付流程',
            image: '../../images/fail.png'
          })

        } else {
          wx.showToast({
            title: '下单失败',
            icon: 'none',
            duration: 2000,
          })
        }
      }
    })
  },


  //下单
  UnifiedOrder: function (price, Order) {
    var that = this;
    wx.request({
      url: 'https://e.tbs.com.cn/UnifiedOrder.cbs',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        'openid': wx.getStorageSync("openid"),
        'body': that.data.appName,
        'out_trade_no': Order,
        'total_fee': price,
        'loginId': wx.getStorageSync("LoginKey"),
      },
      success: function (res) {
        console.log(res);
        var prepay_id = res.data.prepay_id;
        console.log("统一下单返回 prepay_id:" + prepay_id);
        that.sign(prepay_id);
      }
    })
  },
  //签名
  sign: function (prepay_id) {
    var that = this;
    wx.request({
      url: 'https://e.tbs.com.cn/sign.cbs',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        'repay_id': prepay_id,
        'loginId': wx.getStorageSync("LoginKey"), F
      },
      success: function (res) {
        that.requestPayment(res.data);

      }
    })
  },
  //申请支付
  requestPayment: function (obj) {
    var that = this;
    wx.requestPayment({
      'timeStamp': obj.timeStamp,
      'nonceStr': obj.nonceStr,
      'package': obj.package,
      'signType': obj.signType,
      'paySign': obj.paySign,
      'success': function (res) {
        console.log(res)
        wx.navigateTo({
          url: '/pages/detail/detail?path=' + that.data.category + '&appName=' + that.data.appName
        })
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        })
      },
      'fail': function (res) {
        console.log(res)
        wx.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  down_file: function (event) {
    var path = event.currentTarget.dataset.src;
    wx.showLoading({
      title: '下载文件中...',
      mask: true,
    })
    console.log('下载路径:', path)
    const downloadTask = wx.downloadFile({
      url: encodeURI(path), //仅为示例，并非真实的资源  
      success: function (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容 
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }
        //console.log(res)
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000,
          mask: true,
        })
      }
    })
    downloadTask.onProgressUpdate((res) => {
      console.log('下载进度', res.progress)
      console.log('已经下载的数据长度', res.totalBytesWritten)
      console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })
  },
  showapp: function (event) {
    var category = event.currentTarget.dataset.text
    var appName = event.currentTarget.dataset.id
    var flag = event.currentTarget.dataset.flag
    var path = event.currentTarget.dataset.path
    if (flag == 1) {
      wx.navigateTo({
        url: path
        //url: '/pages/outurl/detail?path=' + category + '&appName=' + appName
      })
    } else {
      wx.navigateTo({
        url: '/pages/detail/detail?path=' + category + '&appName=' + appName
        //url: '/pages/outurl/detail?path=' + category + '&appName=' + appName
      })
    }
  },
  showSmall: function (event) {
    var path = event.currentTarget.dataset.src
    wx.navigateTo({
      url: path
      //url: '/pages/outurl/detail?path=' + category + '&appName=' + appName
    })
  }
})