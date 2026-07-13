const axios = require('axios');
const fs = require('fs');

async function getRate() {
  // 已填入你的专属API密钥
  const API_KEY = "06eeef79e5d09c416e10ce2a";
  try {
    // 请求以UAH（乌克兰格里夫纳）为基准的最新汇率
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/UAH`;
    const resp = await axios.get(url, { timeout: 12000 });
    const data = resp.data;

    // 校验数据是否正常返回人民币汇率
    if (!data?.rates?.CNY) {
      throw new Error("接口未获取到人民币CNY汇率数据");
    }

    // 1乌克兰币兑换人民币，保留4位小数
    const uahToCny = Number(data.rates.CNY.toFixed(4));
    console.log(`实时汇率 1 UAH = ${uahToCny} CNY`);

    // 读取本地网页文件
    let html = fs.readFileSync("index.html", "utf8");
    // 替换页面文字展示的汇率
    html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
    // 替换网页JS内用于换算的汇率变量
    html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
    // 写回文件
    fs.writeFileSync("index.html", html, "utf8");
    console.log("网页汇率更新完成");
  } catch (err) {
    console.error("获取汇率失败：", err.message);
    process.exit(1);
  }
}

// 执行函数
getRate();
