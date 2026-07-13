const axios = require('axios');
const fs = require('fs');

async function getExchangeRate() {
    // 基准货币UAH，直接获取1UAH兑CNY实时数据，无中间币种、无兜底
    const response = await axios.get("https://open.er-api.com/v6/latest/UAH");
    const rates = response.data.rates;
    const uah_to_cny = Number(rates.CNY.toFixed(4));
    console.log(`✅ 实时汇率获取成功：1 UAH = ${uah_to_cny} CNY`);
    return uah_to_cny;
}

async function refreshHtmlRate() {
    const rate = await getExchangeRate();
    let htmlContent = fs.readFileSync("./index.html", "utf8");
    htmlContent = htmlContent.replace(/1 UAH = [0-9.]+ CNY/g, `1 UAH = ${rate} CNY`);
    htmlContent = htmlContent.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${rate};`);
    fs.writeFileSync("./index.html", htmlContent, "utf-8");
    console.log("✅ index.html汇率文本与计算变量更新完成");
}

refreshHtmlRate();
