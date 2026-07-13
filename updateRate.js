const axios = require('axios');
const fs = require('fs');

async function getRate() {
  try {
    // 免费汇率接口：获取乌克兰格里夫纳(UAH)全部兑换汇率
    const resp = await axios.get("https://open.er-api.com/v6/latest/UAH", {
      timeout: 10000
    });
    const data = resp.data;
    // 校验接口返回数据
    if (!data?.rates || !data.rates.CNY) {
      throw new Error("接口未获取到CNY汇率数据");
    }
    // 1乌克兰格里夫纳 = 多少人民币，保留4位小数
    const oneUahToCny = Number(data.rates.CNY.toFixed(4));
    console.log(`实时汇率：1 UAH = ${oneUahToCny} CNY`);

    // 读取本地index.html并替换两处汇率
    let html = fs.readFileSync("index.html", "utf8");
    // 替换页面展示文字
    html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${oneUahToCny} CNY`);
    // 替换页面JS汇率变量
    html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${oneUahToCny};`);
    fs.writeFileSync("index.html", html, "utf8");
    console.log("网页汇率更新完成");
  } catch (err) {
    console.error("获取汇率失败：", err.message);
    process.exit(1);
  }
}
getRate();
