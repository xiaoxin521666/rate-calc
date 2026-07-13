const axios = require('axios');
const fs = require('fs');

// 抓取乌克兰格里夫纳UAH兑CNY人民币汇率
async function getRate() {
  try {
    // 公开汇率接口
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/UAH');
    const rate = res.data.rates.CNY;
    console.log("当前1乌克兰格里夫纳 =", rate, "人民币");
    
    // 读取你的页面
    let html = fs.readFileSync('index.html','utf8');
    // 替换页面内汇率数字（你页面里写汇率的地方）
    html = html.replace(/UAH兑人民币: [0-9.]+/g, `UAH兑人民币: ${rate.toFixed(4)}`);
    fs.writeFileSync('index.html', html);
  } catch(e) {
    console.error("汇率获取失败", e);
    process.exit(1);
  }
}
getRate();
