const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    const res = await axios.get('https://v6.exchangerate-api.com/v6/latest/UAH');
    const rate = res.data.rates.CNY;
    console.log("汇率：1UAH =", rate, "CNY");
    
    let html = fs.readFileSync('index.html','utf8');
    html = html.replace(/UAH兑人民币: [0-9.]+/g, `UAH兑人民币: ${rate.toFixed(4)}`);
    fs.writeFileSync('index.html', html);
  } catch(e) {
    console.error("执行失败：", e);
    process.exit(1);
  }
}
getRate();
