//index.js
const app = getApp();
const api = require('../../api/index.js');
const util = require('../../util/index.js');
const config = require('../../util/config.js');
const regeneratorRuntime = require('../../libs/regenerator.js');

Page({
  data: {
    cityGroup: config.cityGroup,
    fileterList: ['#'].concat(config.cityGroup),
    cityList: {},
    toView: 'city_top', //滚动到的位置
    scrollItem: '#',
    locatePlace: '北京市',
    cityPosition: [],
    invitedCity: [],
    hotCity: config.hotCity,
    show: false,
    searchList: []
  },
  onShow() {
    this.init();
  },

  init() {
    this.getInvitedCity();
    this.getCity();
    this.getLocation();
  },

  // 获取城市列表
  getCity() {
    api.getCityList().then(res => {
      this.setData({
        cityList: res
      });

      setTimeout(()=>{
        this.getAllRects();
      }, 20);
    }).catch(err => {
      console.log(err);
    });
  },

  // 获取历史访问过的城市列表
  getInvitedCity(){
    api.getInvitedCity().then(res => {
      console.log(res);
      this.setData({
        invitedCity: res.data
      });
    }).catch(err => {
      console.log(err);
    });
  },

  // 设置历史访问过的城市列表
  setInvitedCity(city) {
    this.data.invitedCity.unshift(city);
    api.setInvitedCity(this.data.invitedCity);
  },

  scrollTo(event){
    let item = event.currentTarget.dataset.item;
    this.setData({
      toView: `city_${item === '#' ? 'top': item}`,
      scrollItem: item
    });
  },

  scroll: util.throttling(function (event) {
    let top = event.detail.scrollTop;
    let index = this.data.cityPosition.findIndex((item) => {
      return item.top > top;
    });
    
    index = index === 0 ? 1 : index;
    index = index === -1 ? this.data.cityPosition.length : index;

    this.setData({
      scrollItem: this.data.cityPosition[index-1].dataset.group
    });
  }, 20),

  getAllRects(){
    wx.createSelectorQuery().selectAll('.city-group').boundingClientRect( (rects) => {
      this.setData({
        cityPosition: rects
      });
    }).exec();
  },

  // 获取位置信息
  async getLocation() {
    this.setData({
      locatePlace: `定位中......`
    });
    await api.getLocation().then((res) => {
      let { latitude, longitude } = res;
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
  async getLocateName(option) {
    await api.reverseGeocoder(option).then((res) => {
      res = res.address_component;
      this.setData({
        locatePlace: `${res.city}${res.district}`
      });
    }).catch((res) => {
      console.log(res);
    });
  },

  //选择城市
  selectCity(event){
    let target = event.target;
    if(target.dataset && target.dataset.name){
      let locatePlace = target.dataset.name;
      this.setInvitedCity(locatePlace);

      this.showWeather({
        location: target.dataset.location || locatePlace,
        locatePlace
      });
    }
  },

  // 设定已选择的城市，切换为天气显示界面
  showWeather(place) {
    app.globalData.location = place.location;
    app.globalData.locatePlace = place.locatePlace;
    // wx.navigateBack({
    //   delta: 1
    // });

    wx.navigateTo({
      url: '../index/index'
    });
  },

  focus(){
    this.setData({
      show: true
    });
  },

  search(event){
    //搜索数据
    let data = event.detail.value;
    if(data === ''){
      this.setData({
        searchList: []
      });
    }else{
      api.getSuggestion(data).then(res =>{
        this.setData({
          searchList: res
        });
      }).catch(err => {
        console.log(err);
      });
    }
  },

  limitSearch: util.throttling(function(e){
    this.search(e);
  }, 100)
});