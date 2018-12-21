//index.js
const app = getApp();
const api = require('../../api/index.js');
const util = require('../../util/index.js');
const config = require('../../util/config.js');
const regeneratorRuntime = require('../../libs/regenerator.js');

Page({
  data:{
    cityGroup: config.cityGroup,
    fileterList: ['#'].concat(config.cityGroup),
    cityList: {}
  },
  onShow(){
    this.init();
  },

  init(){
    this.getCity();
  },

  // 获取城市列表
  getCity(){
    api.getCityList().then(res => {
      this.setData({
        cityList: res
      });
    }).catch(err => {
      console.log(err);
    })
  }
});
