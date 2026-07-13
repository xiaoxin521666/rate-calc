const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/UAH');
    const rate = res.data.rates.CNY;
    console.log("当前1乌克兰格里夫纳 =", rate, "人民币");
    
    let html = fs.readFileSync('index.html','utf8');
    html = html.replace(/UAH兑人民币: [0-9.]+/g, `UAH兑人民币: ${rate.toFixed(4)}`);
    fs.writeFileSync('index.html', html);
  } catch(e) {
    console.error("汇率获取失败", e);
    process.exit(1);
  }
}
getRate();
