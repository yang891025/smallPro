// pages/sbp/cloudList.js
//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    pageSize: 1,
    fileType: "",
    filePath: "",
    isend: false,
    windowWidth: 0, //页面视图宽度
    windowHeight: 0, //视图高度
    imgMargin: 6, //图片边距: 单位px
    imgWidth: 0,  //图片宽度: 单位px
    topArr: [0, 0], //存储每列的累积top
    sort: "timeup"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      fileType: options.fileType,
      filePath: options.filePath,
    });
    //获取页面宽高度
    wx.getSystemInfo({
      success: function (res) {
        //console.log(res)
        var windowWidth = res.windowWidth;
        var imgMargin = that.data.imgMargin;
        //两列，每列的图片宽度
        var imgWidth = (windowWidth - imgMargin * 3) / 2;

        that.setData({
          windowWidth: windowWidth,
          windowHeight: res.windowHeight,
          imgWidth: imgWidth
        }, function () {
          that.setProduct();//初始化数据
        });
      },
    });
   
  },

  /*
     * 文件列表
     */
  setProduct: function () {
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
      success: function (res) {
       
        if (parseInt(res.statusCode) == 200) {
          if (res.data.data.length < 10) {
            that.setData({
              isend: true,
            })
          }
          var tmpArr = [];
          for (let i = 0; i < res.data.data.length; i++) {
            var index = i;
            var obj = {
              src: res.data.data[index].url,
              fileName: res.data.data[index].fileName,
              height: 0,
              top: 0,
              left: 0,
            }
            tmpArr.push(obj);
          }
          that.setData({
            hasSuccess: true,
            fileList: duanziInfoBefore.concat(tmpArr),
            pageSize: pageSizeBefore + 1
          })
          duanziInfoBefore = "";
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/fail.png'
          })
        }
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading()
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

  //加载图片
  loadImage: function (e) {

    var index = e.currentTarget.dataset.index; //图片所在索引
    var imgW = e.detail.width, imgH = e.detail.height; //图片实际宽度和高度
    var imgWidth = this.data.imgWidth; //图片宽度
    var imgScaleH = imgWidth / imgW * imgH; //计算图片应该显示的高度

    var dataList = this.data.fileList;
    var margin = this.data.imgMargin;  //图片间距
    //第一列的累积top，和第二列的累积top
    var firtColH = this.data.topArr[0], secondColH = this.data.topArr[1];
    var obj = dataList[index];

    obj.height = imgScaleH;

    if (firtColH < secondColH) { //表示新图片应该放到第一列
      obj.left = margin;
      obj.top = firtColH + margin;
      firtColH += margin + obj.height;
    }
    else { //放到第二列
      obj.left = margin * 2 + imgWidth;
      obj.top = secondColH + margin;
      secondColH += margin + obj.height;
    }

    this.setData({
      fileList: dataList,
      topArr: [firtColH, secondColH],
    });
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
  showOcr: function (event) {
    var that = this;
    var fileInfo = event.currentTarget.dataset.info;
    wx.navigateTo({
      url: "/pages/outurl/website1?path=" + encodeURIComponent(app.globalData.api + "/pts/cropper/index.cbs?file=" + fileInfo.src + "&openType=1&fileName=" + fileInfo.fileName)
    })
  },

  refresh: function () {
    this.setData({
      fileList: [],
      pageSize: 1,
      isend: false,
    })
    this.setProduct();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isend)
      this.setProduct();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})