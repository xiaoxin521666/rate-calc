const axios = require('axios');
const fs = require('fs');

// 1、国内免费无key汇率接口（优先调用，国内行情）
const chinaApi = "https://api.exchangerate.fun/latest?base=UAH&symbols=CNY";
// 2、备用：乌克兰国家银行官方接口（兜底，境外官方权威）
const nbuApi = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";

// 优先国内接口获取UAH兑CNY汇率
async function getChinaRate() {
    try {
        const res = await axios.get(chinaApi, { timeout: 12000 });
        const data = res.data;
        if (data.rates && data.rates.CNY) {
            return Number(data.rates.CNY.toFixed(4));
        }
        throw new Error("国内接口无CNY汇率字段");
    } catch (err) {
        console.log(`国内汇率接口请求失败：${err.message}，切换乌克兰央行兜底接口`);
        return null;
    }
}

// 兜底：乌克兰央行接口，换算1UAH=多少CNY
async function getNbuRate() {
    const res = await axios.get(nbuApi, { timeout: 15000 });
    const list = res.data;
    let usdPerUah = null;
    let cnyPerUsd = null;
    // 遍历获取UAH兑USD、USD兑CNY
    for (const item of list) {
        if (item.cc === "USD") usdPerUah = item.rate;
        if (item.cc === "CNY") cnyPerUsd = item.rate;
    }
    // 换算：1UAH = (UAH兑USD) * (USD兑CNY)
    const uah2cny = usdPerUah / cnyPerUsd;
    return Number(uah2cny.toFixed(4));
}

async function fetchFinalRate() {
    // 先拿国内汇率
    const chinaRate = await getChinaRate();
    if (chinaRate) return chinaRate;
    // 国内接口挂了，使用乌克兰央行换算汇率
    return await getNbuRate();
}

async function main() {
    try {
        const rate = await fetchFinalRate();
        console.log(`✅ 汇率获取成功：1 UAH = ${rate} CNY`);
        // 读取本地计算器页面
        let html = fs.readFileSync("./index.html", "utf-8");
        // 替换页面展示文字
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${rate} CNY`);
        // 替换JS计算变量
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${rate};`);
        // 写回文件
        fs.writeFileSync("./index.html", html, "utf-8");
        console.log("✅ index.html汇率文本与计算变量更新完成");
    } catch (e) {
        console.error("❌ 汇率全部接口获取失败：", e.message);
        process.exit(1);
    }
}

main();
