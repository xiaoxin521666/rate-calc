const axios = require('axios');
const fs = require('fs');

// 你的ExchangeRate-API密钥
const API_KEY = "06eeef79e5d09c416e10ce2a";

async function updateRate() {
    try {
        // 以UAH乌克兰格里夫纳为基准，直接获取UAH兑CNY汇率
        const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/UAH`;
        const res = await axios.get(url, { timeout: 15000 });
        const data = res.data;

        // 校验接口返回正常
        if (data.result !== "success" || !data.conversion_rates?.CNY) {
            throw new Error("接口未返回CNY人民币汇率");
        }

        // 1乌克兰格里夫纳 = 对应人民币，保留4位小数
        const uahToCny = Number(data.conversion_rates.CNY.toFixed(4));
        console.log(`实时汇率：1 UAH = ${uahToCny} CNY`);

        // 读取网页并替换汇率文本
        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", html, "utf8");

        console.log("汇率更新完成，已写入index.html");
    } catch (err) {
        console.error("汇率获取失败：", err.message);
        process.exit(1);
    }
}

updateRate();
