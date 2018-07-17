// pages/law/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_condition_value: '3',
    search_type: '0',
    inputVal: "", // 搜索的内容  
    search_k: '1,2,3,4',
    inputShowed: false,
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  radio1change: function (e) {
    var that = this;
    var temp1 = e.detail.value
    var temp2 = ''
    //console.log(temp1)
    if (temp1.length != 0) {
      if (temp1.length > 1){
        that.setData({
          search_condition_value: "1",
        })
      }else{
        that.setData({
          search_condition_value: temp1[0],
        })
      }
    } else {
      that.setData({
        search_condition_value: temp2,
      })
      wx.showToast({
        title: '至少全文或标题',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    //console.log(that.data.search_condition_value)
  },
  radio2change: function (e) {
    var that = this;
    that.setData({
      search_type: e.detail.value,
    })
  },
  checkchange: function (e) {
    var that = this;
    var temp1 = e.detail.value
    var temp2 = ''
    // console.log(temp1)
    if (temp1.length != 0) {
      for (var i = 0; i < temp1.length; i++) {
        temp2 = temp2 + temp1[i] + ',';
      }
      temp2 = temp2.substring(0, temp2.length - 1)
      that.setData({
        search_k: temp2,
      })
    } else {
      that.setData({
        search_k: temp2,
      })
      wx.showToast({
        title: '请至少选择一个库',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
  },

  // 点击 搜索 按钮后 隐藏搜索记录，并加载数据  
  searchData: function () {
    var that = this;
    if (that.data.search_k == '') {
      wx.showToast({
        title: '请至少选择一个库',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    if (that.data.search_condition_value == '') {
      wx.showToast({
        title: '至少全文或标题',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    this.toTrackPage(that.data.inputVal);
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
  callTrackApi(num) {
    var that = this;
    wx.navigateTo({
      url: "/pages/law/search?type=" + that.data.search_type + "&condition=" + that.data.search_condition_value + "&search_k=" + that.data.search_k + "&search_w=" + num
    })
  },
  track: function (e) {
    var that = this;
    if (that.data.search_k == '') {
      wx.showToast({
        title: '请至少选择一个库',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    if (that.data.search_condition_value == '') {
      wx.showToast({
        title: '至少全文或标题',
        duration: 1500,
        icon: 'warn'
      });
      return;
    }
    this.toTrackPage(e.detail.value);
  },
  toTrackPage(number) {
    if (!number) {
      wx.showToast({
        title: '输入不能为空。',
        duration: 1500,
        icon: 'warn'
      });

      return;
    }
    this.callTrackApi(number);
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