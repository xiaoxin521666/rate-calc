const axios = require('axios');
const fs = require('fs');

// 两套全球通用免费汇率接口，自动兜底，不会出现ENOTFOUND域名解析失败
const apiList = [
    "https://api.exchangerate.host/latest?base=UAH&symbols=CNY",
    "https://open.er-api.com/v6/latest/UAH"
];

async function getRate() {
    for (const url of apiList) {
        try {
            const res = await axios.get(url, {
                timeout: 15000,
                headers: {"User-Agent": "Node.js Github Actions Bot"}
            });
            const data = res.data;
            let rate;
            // 接口1解析逻辑
            if(url.includes("exchangerate.host")){
                if (!data.rates || !data.rates.CNY) continue;
                rate = data.rates.CNY;
            }
            // 接口2备用解析逻辑
            else{
                if (!data.rates || !data.rates.CNY) continue;
                rate = data.rates.CNY;
            }
            return Number(parseFloat(rate).toFixed(4));
        } catch (e) {
            console.log(`当前接口${url}请求失败，切换备用接口`);
            continue;
        }
    }
    throw new Error("所有汇率接口均无法获取CNY汇率");
}

async function updateRate() {
    try {
        const uahToCny = await getRate();
        console.log(`✅ 实时汇率：1 UAH = ${uahToCny} CNY`);

        // 替换网页两处汇率文本
        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", html, "utf8");
        console.log("✅ index.html汇率更新完成");
    } catch (err) {
        console.error("❌ 汇率获取失败：", err.message);
        process.exit(1);
    }
}

updateRate();
