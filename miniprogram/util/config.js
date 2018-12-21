const WEATHER_BASE_API = 'https://free-api.heweather.net/s6/weather/';
const CLOUD_FILE_BASE_PATH = 'https://6d6f-moshang-7c0ba0-1258326249.tcb.qcloud.la/weather/icon/';

module.exports = {
  DEAULT_PLACE: '北京',
  WEATHER_KEY: 'HE1812190947531536-1E3',
  MAP_key: 'N77BZ-XFL2R-LQNWL-WQLCM-2TFJF-UGFPO-EDF',
  CLOUD_FILE_BASE_PATH: CLOUD_FILE_BASE_PATH,
  // 天气信息请求接口地址
  api: {
      // 生活指数
      lifeStyle: `${WEATHER_BASE_API}lifestyle`,
      // 实时天气
      now: `${WEATHER_BASE_API}now`,
      // 逐三小时天气
      hourly: `${WEATHER_BASE_API}hourly`,
      // 近三天天气预报
      forecast: `${WEATHER_BASE_API}forecast`,
      // 常规天气数据集合(包括了上面的所有数据)
      weather: WEATHER_BASE_API,
      // 日出日落
      sunset: 'https://free-api.heweather.net/s6/solar/sunrise-sunset'
  },
  // 不同时间段的背景色，深夜，早上，上午，中午，下午，傍晚，晚上
  bgColor: {},
  detailList: [
    { field: 'sunRaise', text: '日出' },
    { field: 'sunSet', text: '日落' },
    { field: 'pop', text: '降雨概率' },
    { field: 'hum', text: '温度' },
    { field: 'wind', text: '风' },
    { field: 'fl', text: '体感温度' },
    { field: 'pcpn', text: '降雨量' },
    { field: 'pres', text: '气压' },
    { field: 'vis', text: '能见度' },
    { field: 'uv', text: '紫外线指数' }
  ],
  lifeStyle: [
    { field: 'comf', text: '舒适度指数' },
    { field: 'flu', text: '感冒指数' },
    { field: 'drsg', text: '穿衣指数' },
    { field: 'sport', text: '运动指数' },
    { field: 'uv', text: '紫外线指数' },
    { field: 'air', text: '空气污染扩散条件指数' }
  ],
  cityGroup: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'],
  hotCity: ['北京市', '深圳市', '上海市', '广州市', '杭州市', '南京市', '景德镇市', '天津市', '西安市'],
  STORAGE_KEY:{
    INVITED_CITY: 'MOSHANG_INVITED_CITYS',
    CITY_LIST: 'MOSHANG_CITYS'
  }
};