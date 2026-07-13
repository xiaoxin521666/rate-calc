const axios = require('axios');
const fs = require('fs');

async function getRate() {
  const API_KEY = "06eeef79e5d09c416e10ce2a";
  try {
    let url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/CNY`;
    let resp = await axios.get(url, { timeout: 12000 });
    let data = resp.data;
    let cnyToUah;

    // 兼容处理：CNY基准无UAH则切换UAH基准
    if (!data?.rates?.UAH) {
      url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/UAH`;
      resp = await axios.get(url, { timeout: 12000 });
      data = resp.data;
      if (!data?.rates?.CNY) throw new Error("无CNY汇率");
      const uahToCny = Number(data.rates.CNY.toFixed(4));
      updateHtml(uahToCny);
      return;
    }
    cnyToUah = data.rates.UAH;
    const uahToCny = Number((1 / cnyToUah).toFixed(4));
    updateHtml(uahToCny);

  } catch (err) {
    console.error("获取汇率失败：", err.message);
    process.exit(1);
  }
}

function updateHtml(uahToCny) {
  console.log(`实时汇率 1 UAH = ${uahToCny} CNY`);
  let html = fs.readFileSync("index.html", "utf8");
  html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
  html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
  fs.writeFileSync("index.html", html, "utf8");
  console.log("网页汇率更新完成");
}

getRate();
