const axios = require('axios');
const fs = require('fs');

async function getExchangeRate() {
    const response = await axios.get("https://open.er-api.com/v6/latest/UAH", {
        timeout: 10000
    });
    const rates = response.data.rates;
    if (!rates || typeof rates.CNY !== "number" || isNaN(rates.CNY)) {
        throw new Error("汇率数据失效");
    }
    const midRate = Number(rates.CNY.toFixed(4));
    const spreadFactor = 0.1513 / midRate;
    const phoneLikeRate = Number((midRate * spreadFactor).toFixed(4));
    return { midRate, phoneLikeRate };
}

async function refreshHtmlRate() {
    // 1. 先完整读取原始页面，不提前覆盖
    let rawHtml = fs.readFileSync("./index.html", "utf8");
    const { midRate, phoneLikeRate } = await getExchangeRate();

    // 2. 仅内存中替换，不操作文件
    let newHtml = rawHtml.replace(/1 UAH = [0-9.]+ CNY/g,
        `【国际大盘实时价】1 UAH = ${midRate} CNY；【银行现钞价（对齐手机）】1 UAH = ${phoneLikeRate} CNY`);
    newHtml = newHtml.replace(/const uah2cny = [0-9.]+;/g,
        `const uah2cny = ${phoneLikeRate};`);

    // 3. 全部处理完成后，一次性写入文件
    fs.writeFileSync("./index.html", newHtml, "utf-8");
    console.log("页面更新完成");
}

refreshHtmlRate();
