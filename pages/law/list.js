// pages/law/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleName: "",
    id: "",
    kindlist: [],
    pageSize: 1,
    pageCount: 60,
    allCount: 0,
    condition: '2',
    inputShowed: false,
    inputShowed2: false,
    isSearch: false,
    inputVal: ""
  },
  showInput: function () {
    this.setData({
      inputShowed: true,
      inputShowed2: true
    });
  },
  hideInput: function () {
    this.setData({
      inputShowed: false,
      inputShowed2: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },

  radio1change: function (e) {
    var that = this;
    var temp1 = e.detail.value
    var temp2 = ''
    //console.log(temp1)
    if (temp1.length != 0) {
      if (temp1.length > 1) {
        that.setData({
          condition: "1",
        })
      } else {
        that.setData({
          condition: temp1[0],
        })
      }
    } else {
      that.setData({
        condition: temp2,
      })
      wx.showToast({
        title: '至少全文或标题',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
  },

  // 点击 搜索 按钮后 隐藏搜索记录，并加载数据  
  searchData: function () {
    var that = this;
    if (that.data.condition == '') {
      wx.showToast({
        title: '至少全文或标题',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    if (that.data.inputVal == '') {
      wx.showToast({
        title: '输入不能为空。',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    this.callTrackApi(that.data.inputVal);
  },
  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  inputTyping: function (e) {
    var that = this;
    // // 如果不做这个if判断，会导致 searchLogList 的数据类型由 list 变为 字符串  
    // if ("" != wx.getStorageSync('searchLog')) {
    //   that.setData({
    //     inputVal: e.detail.value,
    //     searchLogList: wx.getStorageSync('searchLog')
    //   });
    // } else {
    that.setData({
      inputVal: e.detail.value,
    });
    // }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      titleName: options.name,
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: that.data.titleName//页面标题为路由参数
    })
    this.reload()
  },
  /**
   * 加载更多
   */
  reload: function () {
    var that = this
    var duanziInfoBefore = this.data.kindlist
    var pageSizeBefore = this.data.pageSize
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    wx.request({
      url: "https://e.tbs.com.cn/interface/codetitle_utf8.cbs",
      data: {
        rid: that.data.id,
        pageNo: that.data.pageSize,
        pageSize: that.data.pageCount
      },
      success: function (res) {
        //console.log(res)
        wx.hideLoading();
        if (parseInt(res.statusCode) == 200) {

          that.setData({
            hasSuccess: true,
            kindlist: duanziInfoBefore.concat(res.data.list),
            allCount: res.data.count,
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
      fail: function (res) {
        wx.hideLoading();
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
   * 点击检索按钮后续操作
   */
  track: function (e) {
    var that = this;
    if (!e.detail.value) {
      wx.showToast({
        title: '输入不能为空。',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    this.callTrackApi(e.detail.value);
  },
  callTrackApi(num) {
    var that = this;
    that.setData({
      kindlist: [],
      pageSize: 1,
      inputVal: num,
      isSearch: true,
      allCount: 0
    })
    this.setData({
      inputShowed2: false
    });
    this.searchReload()
  },

  /**
      * 加载更多
      */
  searchReload: function () {
    var that = this
    var duanziInfoBefore = that.data.kindlist
    var pageSizeBefore = that.data.pageSize
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    // var json = {
    //   title: that.data.inputVal, content: "", issueno: "",
    //   issueDate1: "", issueDate2: "", kindid: that.data.id, effect: "全部", issueun: ""
    // };
    var json = "";
    if (this.data.condition == '1') {
      json = {
        title: this.data.inputVal, content: this.data.inputVal, issueno: "",
        issueDate1: "", issueDate2: "", kindid: this.data.id, effect: "全部", issueun: ""
      };
    } else if (this.data.condition == '2') {
      json = {
        title: this.data.inputVal, content: "", issueno: "",
        issueDate1: "", issueDate2: "", kindid: this.data.id, effect: "全部", issueun: ""
      };
    } else {
      json = {
        title: "", content: this.data.inputVal, issueno: "",
        issueDate1: "", issueDate2: "", kindid: this.data.id, effect: "全部", issueun: ""
      };
    }
    let userStr = JSON.stringify(json);
    // console.log(userStr)
    wx.request({
      url: "https://e.tbs.com.cn/interface/queryLaws_uft8.cbs",
      data: {
        params: userStr,
        wordsegment: 0,
        pageNo: that.data.pageSize,
        pageSize: that.data.pageCount

      },
      success: function (res) {
        //console.log(res)
        wx.hideLoading();
        if (parseInt(res.statusCode) == 200) {

          that.setData({
            hasSuccess: true,
            kindlist: duanziInfoBefore.concat(res.data.list),
            allCount: res.data.count,
            pageSize: pageSizeBefore + 1
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/fail.png'
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
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
   * 跳转外联页面
   */
  showLaw: function (event) {
    var path = event.currentTarget.dataset.src;
    // console.log("path = " + path)
    path = path.substring(path.indexOf("/"));
    wx.navigateTo({
      //url: '/pages/detail/detail?path=' + category
      url: "/pages/outurl/website?path=" + encodeURIComponent("http://e.tbs.com.cn:8091" + path)
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
    var cate = Math.ceil(this.data.allCount / this.data.pageCount)
    if (cate >= this.data.pageSize) {
      if (this.data.isSearch) {
        this.searchReload();
      } else {
        this.reload();
      }
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})