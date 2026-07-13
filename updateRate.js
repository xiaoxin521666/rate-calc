const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    // 改为基准货币CNY，获取UAH汇率，数据结构稳定
    const res = await axios.get('https://api.exchangerate.host/latest?base=CNY&symbols=UAH', {
      timeout: 10000
    });
    // 1人民币等于多少UAH，反向换算1UAH兑CNY
    const oneCnyToUah = res.data.rates.UAH;
    const rate = (1 / oneCnyToUah).toFixed(4);
    console.log("汇率：1 UAH =", rate, "CNY");
    
    let html = fs.readFileSync('index.html','utf8');
    // 替换页面展示文字
    html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${rate} CNY`);
    // 替换JS计算变量
    html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${rate};`);

    fs.writeFileSync('index.html', html, 'utf8');
  } catch(e) {
    console.error("执行失败：", e);
    process.exit(1);
  }
}
getRate();
