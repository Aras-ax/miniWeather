//index.js
const app = getApp();
const api = require('../../api/index.js');
const util = require('../../util/index.js');
const config = require('../../util/config.js');
const regeneratorRuntime = require('../../libs/regenerator.js');

Page({
  data: {
    logged: false,
    backStyle: '',
    takeSession: false,
    gretting: '',
    location: '', //位置信息,用于请求数据信息(格式:经度,纬度)
    locatePlace: '', //位置描述信息
    hourData: [], //未来逐三小时天气信息
    dayData:[], //最近三天天气信息
    nowData: {}, //当前的天气信息
    lifeStyleData: {},
    hasLoadData: false,
    summary: '',
    itemList: '',
    dateMess: {},
    detailList: config.detailList,
    lifeStyle: config.lifeStyle
  },

  onShow: function() {
    this.setData({
      gretting: util.getTimeText() + '好'
    })
    this.init();
  },

  onPullDownRefresh() {
    this.getWeatherData();
    // wx.showNavigationBarLoading()
  },

  stopRefresh() {
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  // 初始化操作
  async init(){
    await this.getLocation();
    this.setData({
      dateMess: util.getDate()
    });
    this.getWeatherData();
  },

  // 获取位置信息
  async getLocation(){
    if (app.globalData.location) {
      this.setData({
        location: app.globalData.location,
        locatePlace: app.globalData.locatePlace
      });
      return;
    }

    await api.getLocation().then((res) => {
      let { latitude, longitude} = res;
      // 设置数据
      this.setData({
        location: `${longitude},${latitude}`
      });
      app.globalData.location = this.data.location;

      // 根据位置信息请求天气和对应的地区描述
      this.getLocateName({ latitude, longitude });
    }).catch((res) => {
      console.log(res);
      this.setData({
        locatePlace: '北京市',
        location: '北京市'
      });
    });
  },

  // 获取位置信息描述
  async getLocateName(option){
    await api.reverseGeocoder(option).then((res) => {
      res = res.address_component;
      this.setData({
        locatePlace: `${res.city}${res.district}`
      });
      app.globalData.locatePlace = this.data.locatePlace;
    }).catch((res) => {
      console.log(res);
    });
  },

  // 获取天气相关信息
  async getWeatherData(){
    await api.getWeather({
      location: this.data.location
    }).then((res) => {
      this.stopRefresh();
      this.setData({
        hasLoadData: true
      });
      res.HeWeather6 && this.formatData(res.HeWeather6[0]);
      }).catch((res) => {
      this.stopRefresh();
      console.log(res);
      this.getWeatherData();
    });
  },

  // 格式化数据为需要的数据类型 
  formatData(data){
    this.setBgStyle(+data.now.cond_code);
    this.formatNowData(data);
    this.formHourData(data.hourly);
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
        wind: `${data.now.wind_dir}`,
        fl: `${data.now.fl}°`, //体感温度
        pcpn: `${data.now.pcpn}毫米`, //降雨量
        pres: `${data.now.pres}百帕`, //气压
        vis: `${data.now.vis}公里`, //能见度
        uv: todayData.uv_index //紫外线 
      },
      hourData: [{
        time: '现在',
        icon: `${config.CLOUD_FILE_BASE_PATH}${data.now.cond_code}.png`,
        tmp: `${data.now.tmp}°`,
        wind: data.now.wind_dir
      }],
      summary: `今天：${todayData.cond_txt_d}，当前气温${data.now.tmp}°，最高气温${todayData.tmp_max}°，风速${data.now.wind_spd}公里/小时。`
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
    let outData = [];
    data.forEach((item, index) => {
      if (index === 0) {
        return true;
      }

      let dateObj = util.getDate(item.date);
      outData.push({
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
      dayData: outData
    });
  },

  formHourData(data){
    let outData = this.data.hourData;

    data.forEach(item => {
      outData.push({
        time: util.getHour(item.time),
        icon: `${config.CLOUD_FILE_BASE_PATH}${item.cond_code}.png`,
        tmp: `${item.tmp}°`,
        wind: item.wind_dir
      });
    });

    this.setData({
      hourData: outData
    });
  },
  
  changeLocation() {
    wx.navigateTo({
      url: '../city/city'
    });
  },

  setBgStyle(code){
    let hour = new Date().getHours(),
    isDayTime = hour >= 7 && hour <= 18,
    bgObj = {};

    if((code >= 100 && code <= 103) || (code >= 200 && code <= 204)){
      bgObj = config.bgColor.sun;
    }else if(code >= 500 && code <= 515){
      bgObj = config.bgColor.smog;
    }else{
      bgObj = config.bgColor.rain;
    }

    this.setData({
      backStyle: bgObj.css + (isDayTime ? '' : '-n')
    });

    this.setBackColor(isDayTime ? bgObj.color : bgObj.colorn);
  },

  setBackColor(color){
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: color,
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    });

    wx.setBackgroundColor({
      backgroundColor: color, // 窗口的背景色为白色
      backgroundColorTop: color
    })
  }
})
