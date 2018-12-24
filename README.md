# miniWeather
天气预报微信小程序

# 快速体验
![小程序二维码](./QECode.jpg)

# 涉及接口
腾讯地图API: [`微信小程序JavaScript SDK`](https://lbs.qq.com/qqmap_wx_jssdk/index.html)

和风天气API: [`常规天气数据集合`](https://www.heweather.com/documents/api/)

# 线上问题

1. 发布上线后数据无法显示或者显示空白问题
> 解决方案：添加接口请求白名单
> 
> 操作路径：`微信公众平台` > `开发` > `开发设置` > `服务器域名` > `request合法域名`
> 
> 添加如下域名
> 
> `https://free-api.heweather.net` 和风天气接口

> `https://apis.map.qq.com` 腾讯地图接口

2. 缺少转发功能
```
    wx.showShareMenu({
        withShareTicket: true
    });
```