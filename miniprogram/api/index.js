const config = require('../util/config');

// 引入SDK核心类
const QQMapWX = require('../libs/qqmap-wx-jssdk.min');

const qqMapWX = new QQMapWX({
    key: config.MAP_key
});

// 数据接口
const weatherOption = {
    location: config.DEAULT_PLACE,
    key: config.WEATHER_KEY
};

// 获取当前位置
const getLocation = function() {
    return new Promise((resolve, reject) => {
        wx.getLocation({
            type: 'gcj02',
            success(res) {
                resolve(res);
            },
            fail(err) {
                reject(err);
            }
        });
    });
};

// 获取城市列表
function getCityList() {
  // 从缓存取
  let data = wx.getStorageSync(config.STORAGE_KEY.CITY_LIST)
  if (data) {
    return Promise.resolve(data);
  }

  return new Promise((resolve, reject) => {
      qqMapWX.getCityList({
          success(res) {
            res = sortCity(res.result[1]);

            // 写入缓存
            wx.setStorage({
              key: config.STORAGE_KEY.CITY_LIST,
              data: res
            });
            resolve(res);
          },
          fail(res) {
              reject(res);
          }
      });
  });
}

function sortCity(data){
  let outData = {};
  data.forEach(item => {
    let {pinyin,location, ...attr} = item;
    pinyin = pinyin.join('').toUpperCase();
    location = `${location.lng},${location.lat}`
    let key = pinyin[0];
    if(outData[key]){
      outData[key].push({
        pinyin,
        location,
        ...attr
      });
    }else{
      outData[key] = [{
        pinyin,
        ...attr
      }];
    }
  });

  for(let key in outData){
    let item = outData[key];
    outData[key] = item.sort((a, b) => {
      return a.pinyiname > b.pinyiname ? 1 : -1;
    });
  }

  return outData;
}

// 逆地址 坐标->描述
function reverseGeocoder(option) {
  return new Promise((resolve, reject) => {
    qqMapWX.reverseGeocoder({
      location: {
        latitude: option.latitude,
        longitude: option.longitude
      },
      success(res) {
        resolve(res.result)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

// 获取访问过的城市列表
function getInvitedCity() {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: config.STORAGE_KEY.INVITED_CITY,
      success(res) {
        resolve(JSON.parse(res.data));
      },
      fail(err){
        reject(err);
      }
    });
  });
}

// 通过关键字搜索 
function getSuggestion(keyword){
  return new Promise((resolve, reject) => {
    qqMapWX.getSuggestion({
      keyword,
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err)
      }
    });
  });
}

// 记录历史访问的城市
function setInvitedCity(city) {

  let newList = [], obj = {};
  for(let i = 0, item; item= city[i++];){
    if(!obj[item.locatePlace]){
      obj[item.locatePlace] = 1;
      newList.push(item);
    }

    if(newList.length === 6){
      break;
    }
  }

  wx.setStorage({
    key: config.STORAGE_KEY.INVITED_CITY,
    data: JSON.stringify(newList) 
  });
}

function wxRequest(option, url = config.api.weather) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: url,
            method: 'GET',
            data: {
                ...weatherOption,
                ...option
            },
            success(res) {
                resolve(res.data);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

/**
 * 获取常规天气数据集合
 */ 
const getWeather = function(option) {
    return wxRequest(option);
};

// 获取日出日落
function getHourly(option) {
  return wxRequest(option, config.api.hourly);
}

module.exports = {
  getLocation,
  getCityList,
  getSuggestion,
  reverseGeocoder,
  getWeather,
  getHourly,
  getInvitedCity,
  setInvitedCity
}