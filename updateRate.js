const axios = require('axios');
const fs = require('fs');

// 获取实时汇率：USD中间价交叉换算 UAH/CNY
async function getExchangeRate() {
  try {
    // 全球通用免费汇率接口，Github Actions海外环境无拦截
    const response = await axios.get("https://v6.exchangerate-api.com/v6/latest/USD");
    const rates = response.data.conversion_rates;

    const usd_to_cny = rates.CNY; // 1美元兑人民币
    const usd_to_uah = rates.UAH; // 1美元兑乌克兰格里夫纳

    // 计算 1 UAH = 多少 CNY，逻辑不会颠倒
    const uah_to_cny = Number((usd_to_cny / usd_to_uah).toFixed(4));
    console.log(`✅ 汇率获取成功：1 UAH = ${uah_to_cny} CNY`);
    return uah_to_cny;
  } catch (err)
    console.error("❌ 汇率接口请求失败，使用备用固定参考值", err.message);
    // 兜底静态汇率，和你手机今日行情对齐
    return 0.1513;
  }
}

// 修改index.html内两处汇率文本
async function refreshHtmlRate() {
  const rate = await getExchangeRate();
  let htmlContent = fs.readFileSync("./index.html", "utf-8");

  // 替换页面展示文字 1 UAH = xx.xxxx CNY
  htmlContent = htmlContent.replace(/1 UAH = [0-9.]+ CNY/g, `1 UAH = ${rate} CNY`);
  // 替换JS计算变量 const uah2cny = xxx;
  htmlContent = htmlContent.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${rate};`);

  fs.writeFileSync("./index.html", htmlContent, "utf-8");
  console.log("✅ index.html汇率文本与计算变量更新完成");
}

// 执行更新
refreshHtmlRate();
