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
    const midRate = Number(rates.CNY.toFixed(4));
    const spreadFactor = 0.1513 / midRate;
    const phoneLikeRate = Number((midRate * spreadFactor).toFixed(4));
    return { midRate, phoneLikeRate };
}

async function refreshHtmlRate() {
    // 先完整读取页面，网络报错直接退出，原文件不改动
    const originHtml = fs.readFileSync("./index.html", "utf8");
    const { midRate, phoneLikeRate } = await getExchangeRate();

    // 替换页面展示文字
    let newHtml = originHtml.replace(/今日自动更新汇率：1UAH = [0-9.]+ CNY/g,
        `今日自动更新汇率：1UAH = ${phoneLikeRate} CNY`);
    // 替换计算用汇率变量
    newHtml = newHtml.replace(/const uah2cny = [0-9.]+;/g,
        `const uah2cny = ${phoneLikeRate};`);

    // 全部处理完成再写入文件
    fs.writeFileSync("./index.html", newHtml, "utf-8");
    console.log(`更新完成，对齐手机汇率：1 UAH = ${phoneLikeRate} CNY`);
}

refreshHtmlRate();
