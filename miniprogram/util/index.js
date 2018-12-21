const WEEK_DAY = ['日', '一', '二', '三', '四', '五', '六'];
const DAY_TIME = {
  lateNight: '深夜',
  morning: '早上',
  lateMorning: '上午',
  noon: '中午',
  afternoon: '下午',
  evening: '傍晚',
  night: '晚上'
};

function transDate(date){
  date = date || new Date();
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    date = new Date(date);
  }
  return date;
}

// 返回当前日期的星期
function getWeekDay(date){
  date = transDate(date);
  return `星期${WEEK_DAY[date.getDay()]}`;
}

// 返回a/b格式日期和星期
function getDate(date) {
  date = transDate(date);
  return {
    weekDay: `星期${WEEK_DAY[date.getDay()]}`,
    date: `${date.getDate()}/${date.getMonth() + 1}`
  };
}

// 获取问候语
function getTimeText(){
  let hour = new Date().getHours();
  if (hour > 0 && hour <= 5) {
    return DAY_TIME.lateNight;
  } else if (hour > 5 && hour <= 9) {
    return DAY_TIME.morning;
  } else if (hour > 9 && hour <= 11) {
    return DAY_TIME.lateMorning;
  } else if (hour > 11 && hour <= 13) {
    return DAY_TIME.noon;
  } else if (hour > 13 && hour <= 17) {
    return DAY_TIME.afternoon;
  } else if (hour > 17 && hour <= 19) {
    return DAY_TIME.evening;
  } else {
    return DAY_TIME.night;
  }
}

// 缓冲节流
function throttling(fn, delay){
  let lastTime = 0;
  return function(){
    let now = new Date().getTime();
    if (now - lastTime >= delay) {
      fn.apply(this, arguments);
      lastTime = now;
    }
  }
}


module.exports = {
  transDate,
  getWeekDay,
  getDate,
  getTimeText,
  throttling
}