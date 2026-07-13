const axios = require('axios');
const fs = require('fs');

async function getExchangeRate() {
    const response = await axios.get("https://open.er-api.com/v6/latest/UAH", {
        timeout: 15000
    });
    // 打印完整返回数据，方便排错
    console.log("接口返回完整数据：", response.data);
    const rates = response.data.rates;
    // 放宽校验逻辑，防止结构细微变动报错
    if (!rates || rates.CNY === undefined || isNaN(Number(rates.CNY))) {
        throw new Error("汇率接口数据异常，终止运行，不修改页面");
    }
    const realRate = Number(Number(rates.CNY).toFixed(4));
    return realRate;
}

async function refreshHtmlRate() {
    const originHtml = fs.readFileSync("./index.html", "utf8");
    const realRate = await getExchangeRate();
    console.log("当前获取实时汇率：", realRate);

    const oldRateMatch = originHtml.match(/const uah2cny = ([0-9.]+);/);
    const oldRate = oldRateMatch ? Number(oldRateMatch[1]) : 0;

    if (oldRate === realRate) {
        console.log(`实时汇率无变化(${realRate})，无需更新页面`);
        return;
    }

    let newHtml = originHtml.replace(/今日自动更新汇率：1UAH = [0-9.]+ CNY/g,
        `今日自动更新汇率：1UAH = ${realRate} CNY`);
    newHtml = newHtml.replace(/const uah2cny = [0-9.]+;/g,
        `const uah2cny = ${realRate};`);

    fs.writeFileSync("./index.html", newHtml, "utf-8");
    console.log(`更新完成，实时汇率：1 UAH = ${realRate} CNY`);
}

refreshHtmlRate();
