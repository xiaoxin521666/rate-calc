const axios = require('axios');
const fs = require('fs');

async function getExchangeRate() {
    const response = await axios.get("https://open.er-api.com/v6/latest/UAH", {
        timeout: 10000
    });
    const rates = response.data.rates;
    if (!rates || typeof rates.CNY !== "number" || isNaN(rates.CNY)) {
        throw new Error("汇率接口数据异常，终止运行，不修改页面");
    }
    // 直接取实时原始汇率，无任何系数、无保底
    const realRate = Number(rates.CNY.toFixed(4));
    return realRate;
}

async function refreshHtmlRate() {
    const originHtml = fs.readFileSync("./index.html", "utf8");
    const realRate = await getExchangeRate();

    // 提取页面当前旧汇率
    const oldRateMatch = originHtml.match(/const uah2cny = ([0-9.]+);/);
    const oldRate = oldRateMatch ? Number(oldRateMatch[1]) : 0;

    // 汇率无变化，直接退出，不修改文件
    if (oldRate === realRate) {
        console.log(`实时汇率无变化(${realRate})，无需更新页面`);
        return;
    }

    // 替换页面展示文字与计算变量
    let newHtml = originHtml.replace(/今日自动更新汇率：1UAH = [0-9.]+ CNY/g,
        `今日自动更新汇率：1UAH = ${realRate} CNY`);
    newHtml = newHtml.replace(/const uah2cny = [0-9.]+;/g,
        `const uah2cny = ${realRate};`);

    fs.writeFileSync("./index.html", newHtml, "utf-8");
    console.log(`更新完成，实时汇率：1 UAH = ${realRate} CNY`);
}

refreshHtmlRate();
