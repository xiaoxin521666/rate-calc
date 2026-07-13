const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    // 稳定开源汇率接口，基准USD，同时包含UAH、CNY
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', {
      timeout: 10000
    });
    const data = res.data;
    // 容错：接口异常直接退出
    if (!data || !data.rates || !data.rates.UAH || !data.rates.CNY) {
      throw new Error("接口返回汇率数据缺失");
    }
    // 1美元兑UAH、1美元兑CNY，换算1UAH=多少CNY
    const usdToUah = data.rates.UAH;
    const usdToCny = data.rates.CNY;
    const oneUahToCny = (usdToCny / usdToUah).toFixed(4);

    console.log("汇率：1 UAH =", oneUahToCny, "CNY");
    
    // 读取并修改html两处汇率文本
    let html = fs.readFileSync('index.html','utf8');
    html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${oneUahToCny} CNY`);
    html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${oneUahToCny};`);

    fs.writeFileSync('index.html', html, 'utf8');
  } catch(e) {
    console.error("执行失败：", e);
    process.exit(1);
  }
}
getRate();
