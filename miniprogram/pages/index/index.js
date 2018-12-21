//index.js
const app = getApp();
const api = require('../../api/index.js');
const util = require('../../util/index.js');
const config = require('../../util/config.js');
const regeneratorRuntime = require('../../libs/regenerator.js');

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    gretting: '早上好',
    location: '', //位置信息,用于请求数据信息(格式:经度,纬度)
    locatePlace: '', //位置描述信息
    hourData: [], //未来逐三小时天气信息
    dayData:[], //最近三天天气信息
    nowData: {}, //当前的天气信息
    lifeStyleData: {},
    summary: '',
    itemList: '',
    dateMess: {},
    detailList: config.detailList,
    lifeStyle: config.lifeStyle
  },

  onShow: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                gretting: `${res.userInfo.nickName}, ${util.getTimeText()}好`,
                dateMess: util.getDate()
              })
            }
          })
        }
      }
    });

    this.init();
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        gretting: `${res.userInfo.nickName}, ${util.getTimeText()}好`,
        dateMess: util.getDate()
      })
    }
  },
  // 初始化操作
  async init(){
    await this.getLocation();
    this.getWeatherData();
  },

  // 获取位置信息
  async getLocation(){
    await api.getLocation().then((res) => {
      let { latitude, longitude} = res;
      // 设置数据
      this.setData({
        location: `${longitude},${latitude}`
      });

      // 根据位置信息请求天气和对应的地区描述
      this.getLocateName({ latitude, longitude });
    }).catch((res) => {
      console.log(res);
    });
  },

  // 获取位置信息描述
  async getLocateName(option){
    await api.reverseGeocoder(option).then((res) => {
      res = res.address_component;
      this.setData({
        locatePlace: `${res.city}${res.district}`
      });
    }).catch((res) => {
      console.log(res);
    });
  },

  // 获取天气相关信息
  async getWeatherData(){
    await api.getWeather({
      location: this.data.location
    }).then((res) => {
      res.HeWeather6 && this.formatData(res.HeWeather6[0]);
    }).catch((res) => {
      console.log(res);
    });

    await api.getHourly({
      location: this.data.location
    }).then((res) => {
      res.HeWeather6 && this.formHourData(res.HeWeather6[0]);
    }).catch((res) => {
      console.log(res);
    });
  },

  // 格式化数据为需要的数据类型 
  formatData(data){
    this.formatNowData(data);
    this.formatLifeStyle(data.lifestyle);
    this.formatDayData(data.daily_forecast);
  },

  // 格式化当天的数据 
  formatNowData(data){
    let todayData = data.daily_forecast[0];
    this.setData({
      nowData: {
        tmp: data.now.tmp, //当前温度
        iconUrl: `${config.CLOUD_FILE_BASE_PATH}${data.now.cond_code}.png`,
        cond: data.now.cond_txt,
        tmpMin: todayData.tmp_min,
        tmpMax: todayData.tmp_max,
        sunSet: todayData.ss, 
        sunRaise: todayData.sr,
        pop: `${todayData.pop}%`, // 降雨概率
        hum: `${data.now.hum}%`, // 湿度
        wind: `${data.now.wind_dir} ${data.now.wind_spd}公里/时`,
        fl: `${data.now.fl}°`, //体感温度
        pcpn: `${data.now.pcpn}毫米`, //降雨量
        pres: `${data.now.pres}百帕`, //气压
        vis: `${data.now.vis}公里`, //能见度
        uv: todayData.uv_index //紫外线 
      },
      summary: `今天：${todayData.cond_txt_d}，当前气温${data.now.tmp}°，最高气温${todayData.tmp_max}°。`
    });
  },

  formatLifeStyle(data) {
    let styleData = {};
    data.forEach(item => {
      styleData[item.type] = `${item.brf}: ${item.txt}`;
    });
    this.setData({
      lifeStyleData: styleData
    });
  },

  formatDayData(data){
    let outdata = [];
    data.forEach(item => {
      let dateObj = util.getDate(item.date);
      outdata.push({
        weekDay: dateObj.weekDay,
        date: dateObj.date,
        sunRaise: `${item.sr}`,
        sunSet: `${item.ss}`,
        tmp: `${item.tmp_min}°~${item.tmp_max}°`,
        condDay: `${config.CLOUD_FILE_BASE_PATH}${item.cond_code_d}.png`,
        condNight: `${config.CLOUD_FILE_BASE_PATH}${item.cond_code_n}.png`,
        wind: `${item.wind_sc}`
      });
    });

    this.setData({
      dayData: outdata
    });
  },

  formHourData(data){
    console.log(data);
  }
})
