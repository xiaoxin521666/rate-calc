const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    // 免密钥公共汇率接口
    const res = await axios.get('https://api.exchangerate.host/latest?base=UAH&symbols=CNY');
    const rate = res.data.rates.CNY.toFixed(4);
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
